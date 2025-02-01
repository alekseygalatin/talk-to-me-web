import {useState, useRef, useEffect} from 'react';
import {useWebSocket} from "../../api/WebSocketApi/WebsocketService.ts";
import {
    AudioMetadata, deserializeSocketResponse,
    serializeSocketMessage,
    SocketAuthResponse,
    SocketConnectRequest, SocketDisconnectRequest, SocketDisconnectResponse, SocketExceptionResponse,
    SocketRequest, SocketTranscribeRequest, SocketTranscriptResponse
} from "../../api/WebSocketApi/WebsocketDTO.ts";
import {Transcriber, TranscriberStartParams, TranscriptResult} from "./Transcriber.ts";
import AuthService from "../auth/authService.ts";
import {experimentalSettingsManager} from "../ExperimentalSettingsManager.ts";

const experimentalSettings = experimentalSettingsManager.getSettings();

export const useAudioContextTranscriber = (): Transcriber => {
    const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const [connectionId, setConnectionId] = useState('');
    const {webSocketMessage, sendWebSocketMessage} = useWebSocket();
    const [authResponse, setAuthResponse] = useState<SocketAuthResponse | null>(null);
    const authResponseRef = useRef<SocketAuthResponse | null>(null);
    const [disconnectResponse, setDisconnectResponse] = useState<SocketDisconnectResponse | null>(null);
    const disconnectResponseRef = useRef<SocketDisconnectResponse | null>(null);

    useEffect(() => {
        authResponseRef.current = authResponse;
    }, [authResponse]);
    useEffect(() => {
        disconnectResponseRef.current = disconnectResponse;
    }, [disconnectResponse]);

    useEffect(() => {
        const newId = crypto.randomUUID();
        setConnectionId(newId);
    }, []);

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
            console.log("Auth result:", authResponse);
            setAuthResponse(authResponse);

            return;
        } else if (deserialized.route === "transcript") {
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
                    };
                });
            }
        } else if (deserialized.route === "exception") {
            const errorResult = deserialized.result as SocketExceptionResponse;
            console.log("Error:", errorResult);
        } else if (deserialized.route === "disconnect") {
            setDisconnectResponse(deserialized.result as SocketDisconnectResponse);
        }
    }, [webSocketMessage]);

    const startTranscript = async (params: TranscriberStartParams) => {
        try {
            if (!params.language) {
                console.error('Language is required');

                return;
            }

            // we can consider this as a low quality audio. Need to think a way to improve it.
            const sampleRate = 8000;

            const token = AuthService.getToken();
            const audioContext = new AudioContext({sampleRate: sampleRate});
            const mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
            const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);

            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            mediaStreamSource.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            const connectMessage: SocketRequest<SocketConnectRequest> = {
                route: "Connect",
                request: {
                    token: token
                }
            };
            const metadataJson = serializeMessage(connectMessage);
            sendWebSocketMessage(metadataJson);

            const authResponse = await waitForAuthenticationResult();
            if (!authResponse.authSuccessful) {
                console.error("Authentication failed");
                return;
            }

            let firstChunk = true;
            scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
                const audioData = event.inputBuffer.getChannelData(0);
                // const isSilence = detectSilence(audioData);
                // if (isSilence) {
                //     return;
                // }
                const audioChunk = encodePCMChunk(audioData);
                const binaryString = convertToBase64(audioChunk);
                const audioMetadata: AudioMetadata = {
                    sampleRate: sampleRate,
                    codec: 'pcm',
                    language: params.language
                };

                const transcriptMessage: SocketRequest<SocketTranscribeRequest> = {
                    route: "Transcribe",
                    request: {
                        audioData: binaryString,
                        audioMetadata: firstChunk ? audioMetadata : null
                    }
                };

                const metadataJson = serializeMessage(transcriptMessage);
                sendWebSocketMessage(metadataJson);

                firstChunk = false;
            };

            audioContextRef.current = audioContext;
            mediaStreamRef.current = mediaStream;
            scriptProcessorRef.current = scriptProcessor;

            setIsRecording(true);
        } catch (error) {
            console.error('Error starting audio transcription:', error);
        }
    };

    const convertToBase64 = (buffer: Uint8Array): string => {
        let binaryString = "";
        for (const byte of buffer) {
            binaryString += String.fromCharCode(byte);
        }
        return btoa(binaryString);
    }

    const stopTranscript = async () => {
        if (isRecording) {
            scriptProcessorRef.current?.disconnect();
            audioContextRef.current?.close();
            mediaStreamRef.current?.getTracks().forEach((track) => track.stop());

            audioContextRef.current = null;
            mediaStreamRef.current = null;
            scriptProcessorRef.current = null;
            const disconnectRequest: SocketRequest<SocketDisconnectRequest> = {
                route: "Disconnect",
                request: {
                    reason: "stop requested"
                }
            };
            const disconnectMessage = serializeMessage(disconnectRequest);
            sendWebSocketMessage(disconnectMessage);
            await waitForDisconnectResponse();
            setIsRecording(false);
        }
    };

    const clearTranscript = () => setTranscript(null);

    const waitForAuthenticationResult = (): Promise<SocketAuthResponse> => {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (authResponseRef.current) {
                    clearInterval(interval);
                    resolve(authResponseRef.current);
                }
            }, 50);
        });
    };

    const waitForDisconnectResponse = (): Promise<SocketDisconnectResponse> => {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (disconnectResponseRef.current) {
                    clearInterval(interval);
                    resolve(disconnectResponseRef.current);
                }
            }, 50);
        });
    };

    const serializeMessage =(message: SocketRequest<SocketConnectRequest | SocketTranscribeRequest | SocketDisconnectRequest> ): string => {
        if(experimentalSettings.UseLocalWebSocket){
            const serializedBodyMessage = serializeSocketMessage(message);
            const request ={
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

    return {
        startTranscript,
        stopTranscript,
        clearTranscript,
        transcript,
        isRecording
    };
};

const encodePCMChunk = (input: Float32Array): Uint8Array => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Uint8Array(buffer);
}

const detectSilence = (chunk: Float32Array): boolean => {
    const rms = Math.sqrt(chunk.reduce((sum, sample) => sum + sample * sample, 0) / chunk.length);
    return rms < 0.01; // Silence threshold
};