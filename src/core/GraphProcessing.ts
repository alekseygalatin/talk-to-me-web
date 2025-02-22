import {useEffect, useRef, useState} from "react";
import {
    AudioMetadata,
    deserializeSocketResponse,
    serializeSocketMessage,
    SocketAuthResponse,
    SocketCreateGraphRequest, SocketExceptionResponse, SocketPollyResponse,
    SocketRequest, SocketStopGraphRequest, SocketStopTranscriptRequest,
    SocketTranscribeRequest, SocketTranscriptCompletedResponse, SocketTranscriptResponse
} from "../api/WebSocketApi/WebsocketDTO.ts";
import {useWebSocket} from "../api/WebSocketApi/WebsocketService.ts";
import {experimentalSettingsManager} from "./ExperimentalSettingsManager.ts";
import {Auth} from "aws-amplify";
import {TranscriberStartParams, TranscriptResult} from "./Transcriber/Transcriber.ts";

const experimentalSettings = experimentalSettingsManager.getSettings();

type GraphType = "Transcribe" | "TranscribeWithBedrockAndPolly";
type GraphProcessingStatus = "Idling" | "Preparing" | "Transcribing" | "Processing" | "Speaking";
export interface GraphProcessingParams {
    GraphType: GraphType;
    TranscriberStartParams: TranscriberStartParams;
}
export interface GraphProcessingData {
    GraphProcessingStatus: GraphProcessingStatus;
    Transcript: string | null;
    AudioData: Blob | null;
}

export const useGraphProcessing = () => {
    const [connectionId, setConnectionId] = useState('');
    const {webSocketMessage, sendWebSocketMessage} = useWebSocket();

    const [graphProcessingData, setGraphProcessingData] = useState<GraphProcessingData | null>(null);
    const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
    const [transcriptCompletedResponse, setTranscriptCompletedResponse] = useState<SocketTranscriptCompletedResponse | null>(null);
    const [aiAgentResponse, setAiAgentResponse] = useState<SocketTranscriptCompletedResponse | null>(null);
    const [audioData, setAudioData] = useState<string | null>(null);
    const [authResponse, setAuthResponse] = useState<SocketAuthResponse | null>(null);

    const authResponseRef = useRef<SocketAuthResponse | null>(null);
    const transcriptCompletedResponseRef = useRef<SocketTranscriptCompletedResponse | null>(null);
    const pollyResponseRef = useRef<SocketPollyResponse | null>(null);


    const [isProcessing, setIsProcessing] = useState(false);
    // const [graphProcessingStatus, setGraphProcessingStatus] = useState<GraphProcessingStatus>("Idling");
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    useEffect(() => {
        authResponseRef.current = authResponse;
    }, [authResponse]);

    useEffect(() => {
        transcriptCompletedResponseRef.current = transcriptCompletedResponse;
    }, [transcriptCompletedResponse]);

    useEffect(() => {
        const newId = crypto.randomUUID();
        setConnectionId(newId);
    }, []);

    // Handle incoming WebSocket messages
    useEffect(() => {
        if (!webSocketMessage) {
            return;
        }
        const deserialized = deserializeSocketResponse(webSocketMessage);
        if (!deserialized) {
            return;
        }

        if (deserialized.route === "authResponse") {
            const authResponse = deserialized.result as SocketAuthResponse;
            setAuthResponse(authResponse);

            return;
        }

        if (deserialized.route === "transcript") {
            const transcriptResult = deserialized.result as SocketTranscriptResponse;
            if (transcriptResult.isFinal) {
                setGraphProcessingData((prevState: GraphProcessingData | null)=> {
                    if (prevState) {
                        return {
                            GraphProcessingStatus: "Transcribing",
                            Transcript: `${prevState.Transcript} ${transcriptResult.text}`,
                            AudioData: prevState.AudioData
                        }
                    }
                    return {
                        GraphProcessingStatus: "Transcribing",
                        Transcript: `${transcriptResult.text}`,
                        AudioData: null
                    }
                });
            }

            return;
        }

        if (deserialized.route === "transcriptCompleted") {
            setTranscriptCompletedResponse(deserialized.result as SocketTranscriptCompletedResponse);

            return;
        }

        if (deserialized.route === "aiAgentResponse") {
            setAiAgentResponse(deserialized.result as SocketTranscriptCompletedResponse);

            return;
        }

        if (deserialized.route === "pollyResult") {
            const audioData = deserialized.result.audioChunk;
            const audioBytes = Uint8Array.from(atob(audioData), (c) =>
                c.charCodeAt(0)
            );
            const audioBlob = new Blob([audioBytes], { type: "audio/wav" });

            setGraphProcessingData((prevState: GraphProcessingData | null)=> {
                return {
                    GraphProcessingStatus: "Processing",
                    Transcript: prevState?.Transcript ?? null,
                    AudioData: audioBlob
                }
            });

            return;
        }

        if (deserialized.route === "exception") {
            const errorResult = deserialized.result as SocketExceptionResponse;
            console.log("Error:", errorResult);
            stopTranscribingInternal(true);

            return;
        }
    }, [webSocketMessage]);

    const startProcessing = async (parameters: GraphProcessingParams) => {
        if (isProcessing) {
             await stopProcessing();
        }

        setIsProcessing(true);
        setGraphProcessingData((prevState: GraphProcessingData | null)=> {
            return {
                GraphProcessingStatus: "Preparing",
                Transcript: prevState?.Transcript ?? null,
                AudioData: prevState?.AudioData ?? null,
            }
        });

        const token = (await Auth.currentSession()).getAccessToken()?.getJwtToken();
        const connectMessage: SocketRequest<SocketCreateGraphRequest> = {
            route: "CreateGraph",
            request: {
                graph_type:  parameters.GraphType,
                auth_token: token
            }
        };
        const metadataJson = serializeMessage(connectMessage, connectionId);
        sendWebSocketMessage(metadataJson);
        const authResponse = await waitForAuthenticationResult();
        if (!authResponse.authSuccessful) {
            console.error("Authentication failed");
            return;
        }

        if(parameters.GraphType === "Transcribe" || parameters.GraphType === "TranscribeWithBedrockAndPolly") {

            setGraphProcessingData((prevState: GraphProcessingData | null)=> {
                return {
                    GraphProcessingStatus: "Transcribing",
                    Transcript: prevState?.Transcript ?? null,
                    AudioData: prevState?.AudioData ?? null,
                }
            });
            if(!await tryStartTranscript(parameters.TranscriberStartParams)) {
                setIsProcessing(false);

                setGraphProcessingData((prevState: GraphProcessingData | null)=> {
                    return {
                        GraphProcessingStatus: "Idling",
                        Transcript: prevState?.Transcript ?? null,
                        AudioData: prevState?.AudioData ?? null,
                    }
                });
            }
            await waitForTranscriptCompletedResponse();
        }

        if (parameters.GraphType === "TranscribeWithBedrockAndPolly") {

            setGraphProcessingData((prevState: GraphProcessingData | null)=> {
                return {
                    GraphProcessingStatus: "Processing",
                    Transcript: prevState?.Transcript ?? null,
                    AudioData: prevState?.AudioData ?? null,
                }
            });
            await waitForPollyResponse();
        }
    }

    const tryStartTranscript = async (params: TranscriberStartParams): Promise<boolean> => {
        try {
            if (!params.language) {
                console.error('Language is required');

                return false;
            }
            const audioContext = new AudioContext();
            const mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
            const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);

            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            mediaStreamSource.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            let sendMetadata = true;
            scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
                const audioData = event.inputBuffer.getChannelData(0);
                const audioChunk = encodePCMChunk(audioData);
                const binaryString = convertToBase64(audioChunk);
                const audioMetadata: AudioMetadata = {
                    sampleRate: event.inputBuffer.sampleRate,
                    codec: 'pcm',
                    language: params.language
                };

                const transcriptMessage: SocketRequest<SocketTranscribeRequest> = {
                    route: "Transcribe",
                    request: {
                        audioData: binaryString,
                        audioMetadata: sendMetadata ? audioMetadata : null
                    }
                };

                const metadataJson = serializeMessage(transcriptMessage, connectionId);
                sendWebSocketMessage(metadataJson);

                sendMetadata = false;
            };

            audioContextRef.current = audioContext;
            mediaStreamRef.current = mediaStream;
            scriptProcessorRef.current = scriptProcessor;

            return true;
        } catch (error) {
            console.error('Error starting audio transcription:', error);

            return false;
        }
    };

    const stopProcessing = async () => {

        setGraphProcessingData((prevState: GraphProcessingData | null)=> {
            return {
                GraphProcessingStatus: "Idling",
                Transcript: prevState?.Transcript ?? null,
                AudioData: prevState?.AudioData ?? null,
            }
        });
        
        if(graphProcessingData?.GraphProcessingStatus === "Transcribing") {
            await stopTranscribingInternal(false);
        }
        const stopTranscriptRequest: SocketRequest<SocketStopGraphRequest> = {
            route: "StopGraph",
            request: { }
        };
        const message = serializeMessage(stopTranscriptRequest, connectionId);
        sendWebSocketMessage(message);
        setIsProcessing(false);
        clearState();
    }

    const stopCurrentProcessingStep = async () => {
        if(graphProcessingData?.GraphProcessingStatus === "Transcribing") {
            await stopTranscribingInternal(false);
        }
    }

    const clearState = () => {
        transcriptCompletedResponseRef.current = null;
        audioContextRef.current = null;
        mediaStreamRef.current = null;
        scriptProcessorRef.current = null;
        return {
            GraphProcessingStatus: "Idling",
            Transcript: null,
            AudioData: null
        }

    }

    const stopTranscribingInternal = async (stopByException: boolean) => {
        scriptProcessorRef.current?.disconnect();
        audioContextRef.current?.close();
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());

        audioContextRef.current = null;
        mediaStreamRef.current = null;
        scriptProcessorRef.current = null;

        if (!stopByException) {
            const stopTranscriptRequest: SocketRequest<SocketStopTranscriptRequest> = {
                route: "StopTranscript",
                request: { }
            };
            const message = serializeMessage(stopTranscriptRequest, connectionId);
            sendWebSocketMessage(message);
            await waitForTranscriptCompletedResponse();
        }
    };

    const waitForAuthenticationResult = async (): Promise<SocketAuthResponse> => {
        while (!authResponseRef.current) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return authResponseRef.current;
    };

    const waitForTranscriptCompletedResponse = async (): Promise<SocketTranscriptCompletedResponse> => {
        while (!transcriptCompletedResponseRef.current) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return transcriptCompletedResponseRef.current;
    };

    const waitForPollyResponse = async (): Promise<SocketPollyResponse> => {
        while (!pollyResponseRef.current) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return pollyResponseRef.current;
    };

    return {
        startProcessing,
        stopProcessing,
        stopCurrentProcessingStep,
        clearState,
        graphProcessingData,
    };
}




const encodePCMChunk = (input: Float32Array): Uint8Array => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Uint8Array(buffer);
}

const serializeMessage = (
    message: SocketRequest<SocketCreateGraphRequest | SocketStopGraphRequest | SocketTranscribeRequest | SocketStopTranscriptRequest>,
    connectionId: string): string => {
    if (experimentalSettings.WebSocket.isDevelopment) {
        const serializedBodyMessage = serializeSocketMessage(message);
        const request = {
            requestContext: {
                connectionId: connectionId,
                domainName: "someName",
                stage: "localdev",
                routeKey: "$default"
            },
            body: serializedBodyMessage
        };
        return JSON.stringify(request);
    }

    return serializeSocketMessage(message);
}

const detectSilence = (chunk: Float32Array): boolean => {
    const rms = Math.sqrt(chunk.reduce((sum, sample) => sum + sample * sample, 0) / chunk.length);
    return rms < 0.01; // Silence threshold
}

const convertToBase64 = (buffer: Uint8Array): string => {
    let binaryString = "";
    for (const byte of buffer) {
        binaryString += String.fromCharCode(byte);
    }
    return btoa(binaryString);
}