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
    Circular: boolean;
}

export interface GraphProcessingData {
    GraphProcessingStatus: GraphProcessingStatus;
    Transcript: string | null;
    AudioData: Blob | null;
}

export const useGraphProcessing = () => {
    const [connectionId, setConnectionId] = useState('');
    const {webSocketMessage, sendWebSocketMessage} = useWebSocket();

    const [transcriptCompletedResponse, setTranscriptCompletedResponse] = useState<SocketTranscriptCompletedResponse | null>(null);
    const [aiAgentResponse, setAiAgentResponse] = useState<SocketTranscriptCompletedResponse | null>(null);
    const [authResponse, setAuthResponse] = useState<SocketAuthResponse | null>(null);

    const authResponseRef = useRef<SocketAuthResponse | null>(null);
    const transcriptCompletedResponseRef = useRef<SocketTranscriptCompletedResponse | null>(null);
    const audioDataRef = useRef<Blob | null>(null);
    const stopProcessingRequestedRef = useRef<boolean>(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [graphProcessingStatus, setGraphProcessingStatus] = useState<GraphProcessingStatus>("Idling");
    const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
    const [audioData, setAudioData] = useState<Blob | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    let resolvePlayback: (() => void) | null = null;

    useEffect(() => {
        authResponseRef.current = authResponse;
    }, [authResponse]);

    useEffect(() => {
        transcriptCompletedResponseRef.current = transcriptCompletedResponse;
    }, [transcriptCompletedResponse]);

    useEffect(() => {
        audioDataRef.current = audioData;
    }, [audioData]);

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
                setTranscript((prevState: TranscriptResult | null) => {
                    if (prevState) {
                        return {
                            isFinal: true,
                            transcript: `${prevState.transcript} ${transcriptResult.text}`
                        }
                    }
                    return {
                        isFinal: true,
                        transcript: `${transcriptResult.text}`
                    }
                });
            }

            return;
        }

        if (deserialized.route === "transcriptCompleted") {
            setTranscriptCompletedResponse(deserialized.result as SocketTranscriptCompletedResponse);
            console.log("Transcript completed message received");

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
            const audioBlob = new Blob([audioBytes], {type: "audio/wav"});
            setAudioData(audioBlob);
            return;
        }

        if (deserialized.route === "exception") {
            const errorResult = deserialized.result as SocketExceptionResponse;
            console.log("Error:", errorResult);
            // stopProcessing();

            return;
        }
    }, [webSocketMessage]);

    const startProcessing = async (parameters: GraphProcessingParams) => {
        stopProcessingRequestedRef.current = false;
        if (parameters.Circular) {
            await startProcessingCircular(parameters);
        } else {
            await startProcessingInternal(parameters);
        }
        setGraphProcessingStatus("Idling");
    }

    const startProcessingCircular = async (parameters: GraphProcessingParams) => {
        while (!isStopped()) {
            await startProcessingInternal(parameters);
            await stopProcessingInternal();

            // TODO - find a better way, but now it is fast and difficult to start speaking in a second second interval
            setTimeout(()=>{}, 1_000);
        }
    }
    const startProcessingInternal = async (parameters: GraphProcessingParams) => {
        setIsProcessing(true);

        // TODO - add loading spinner or any alternative to notify we are starting live conversation
        setGraphProcessingStatus("Processing");

        const token = (await Auth.currentSession()).getAccessToken()?.getJwtToken();
        const connectMessage: SocketRequest<SocketCreateGraphRequest> = {
            route: "CreateGraph",
            request: {
                graph_type: parameters.GraphType,
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

        if(isStopped()) return;

        if (parameters.GraphType === "Transcribe" || parameters.GraphType === "TranscribeWithBedrockAndPolly") {
            console.log("Starting transcription");
            setGraphProcessingStatus("Transcribing");
            if (!await tryStartTranscript(parameters.TranscriberStartParams)) {
                setGraphProcessingStatus("Idling");
                throw new Error("Failed to start transcription");
            }

            if(isStopped()) return;

            await waitForTranscriptCompletedResponse();
            console.log("Transcription completed");
        }

        if(isStopped()) return;

        if (parameters.GraphType === "TranscribeWithBedrockAndPolly") {
            console.log("Starting audio processing");
            setGraphProcessingStatus("Processing");
            await waitForPollyResponse();

            if(isStopped()) return;

            setGraphProcessingStatus("Speaking");
            await playAudio(audioDataRef.current);
            console.log("Audio processing completed");
        }
    }

    const tryStartTranscript = async (params: TranscriberStartParams): Promise<boolean> => {
        try {
            console.log("Try Starting audio transcription");
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
            let lastAudioDataReceivedTime = Date.now();
            scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
                const audioData = event.inputBuffer.getChannelData(0);
                const audioChunk = encodePCMChunk(audioData);
                const binaryString = convertToBase64(audioChunk);
                const audioMetadata: AudioMetadata = {
                    sampleRate: event.inputBuffer.sampleRate,
                    codec: 'pcm',
                    language: params.language
                };

                const isSilence = detectSilence(audioData);
                if (isSilence) {
                    if (Date.now() - lastAudioDataReceivedTime > 3_500) {
                        console.log("Silence detected, stopping transcription");
                        stopTranscribingInternal(false);
                    }
                } else {
                    lastAudioDataReceivedTime = Date.now();
                }
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
            console.log("Try Starting audio transcription - started");
            return true;
        } catch (error) {
            console.error('Error starting audio transcription:', error);

            return false;
        }
    };

    const playAudio = (audioBlob: Blob | null): Promise<void> => {
        return new Promise((resolve, reject) => {
            console.log("Playing audio");
            if (!audioBlob) {
                reject(new Error("No audio data provided"));
                return;
            }

            const url = URL.createObjectURL(audioBlob);
            const audio = new Audio(url);
            audioRef.current = audio;

            // Store the resolver so we can resolve it manually if stopped
            resolvePlayback = resolve;

            audio.onended = () => {
                URL.revokeObjectURL(url); // Cleanup
                stopAudio();
                resolve();
            };

            audio.onerror = () => {
                console.error("Error playing audio")
                resolve();
            };

            audio.play().catch(reject);
        });
    };

    const stopProcessing = async () => {
        stopProcessingRequestedRef.current = true;
        await stopProcessingInternal();
    }

    const stopProcessingInternal = async () => {
        setGraphProcessingStatus("Idling");
        stopAudio();

        await stopTranscribingInternal(false);
        const stopGraphRequest: SocketRequest<SocketStopGraphRequest> = {
            route: "StopGraph",
            request: {}
        };
        const message = serializeMessage(stopGraphRequest, connectionId);
        sendWebSocketMessage(message);

        setIsProcessing(false);
        clearState();
    }

    const stopCurrentProcessingStep = async () => {
        if (graphProcessingStatus === "Transcribing") {
            await stopTranscribingInternal(false);
        }
    }

    const clearState = () => {
        console.log("Clearing state");
        authResponseRef.current = null;
        transcriptCompletedResponseRef.current = null;
        audioContextRef.current = null;
        mediaStreamRef.current = null;
        scriptProcessorRef.current = null;
        setAuthResponse(null);
        setTranscript(null);
        setTranscriptCompletedResponse(null);
        setAudioData(null);
    }

    const stopTranscribingInternal = async (stopByException: boolean) => {
        console.log("Stopping transcription internal");
        scriptProcessorRef.current?.disconnect();
        if (audioContextRef.current?.state !== "closed") {
            audioContextRef.current?.close();
        }
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());

        if (!stopByException) {
            const stopTranscriptRequest: SocketRequest<SocketStopTranscriptRequest> = {
                route: "StopTranscript",
                request: {}
            };
            const message = serializeMessage(stopTranscriptRequest, connectionId);
            sendWebSocketMessage(message);
        }
    };

    const stopAudio = () => {
        console.log("Stopping audio");
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reset playback to start
            resolvePlayback?.(); // Resolve the Promise to prevent blocking
            audioRef.current = null;
            setAudioData(null);
        }
    };

    // need to add timeout logic and wait no more than 1-2 seconds or 10 for polly
    const waitForAuthenticationResult = async (): Promise<SocketAuthResponse> => {
        while (!authResponseRef.current) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return authResponseRef.current;
    };

    const waitForTranscriptCompletedResponse = async (): Promise<SocketTranscriptCompletedResponse> => {
        transcriptCompletedResponseRef.current = null;

        while (!transcriptCompletedResponseRef.current) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return transcriptCompletedResponseRef.current;
    };

    const waitForPollyResponse = async (): Promise<Blob> => {
        while (!audioDataRef.current) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return audioDataRef.current;
    };

    const isStopped: () => boolean | null = () => {
        return stopProcessingRequestedRef.current;
    }

    return {
        startProcessing,
        stopProcessing,
        stopCurrentProcessingStep,
        clearState,
        graphProcessingStatus,
        transcript
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