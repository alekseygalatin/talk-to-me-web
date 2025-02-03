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

export const useRemoteSpeechRecognitionTranscriber = (): Transcriber => {
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
                    };
                });
            }

            return;
        }

        if (deserialized.route === "exception") {
            const errorResult = deserialized.result as SocketExceptionResponse;
            console.log("Error:", errorResult);
            stopTranscriptInternal(true);

            return;
        }

        if (deserialized.route === "disconnect") {
            setDisconnectResponse(deserialized.result as SocketDisconnectResponse);

            return;
        }
    }, [webSocketMessage]);

    const startTranscript = async (params: TranscriberStartParams) => {
        try {
            if (!params.language) {
                console.error('Language is required');

                return;
            }

            const token = AuthService.getToken();
            const audioContext = new AudioContext();
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
            const metadataJson = serializeMessage(connectMessage, connectionId);
            sendWebSocketMessage(metadataJson);

            const authResponse = await waitForAuthenticationResult();
            if (!authResponse.authSuccessful) {
                console.error("Authentication failed");
                return;
            }

            let sendMetadata = true;
            scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
                const audioData = event.inputBuffer.getChannelData(0);
                // const isSilence = detectSilence(audioData);
                // if (isSilence) {
                //     return;
                // }
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

            setIsRecording(true);
        } catch (error) {
            console.error('Error starting audio transcription:', error);
        }
    };

    const stopTranscript = () => stopTranscriptInternal(false);

    const stopTranscriptInternal = async (stopByException: boolean) => {

            scriptProcessorRef.current?.disconnect();
            audioContextRef.current?.close();
            mediaStreamRef.current?.getTracks().forEach((track) => track.stop());

            audioContextRef.current = null;
            mediaStreamRef.current = null;
            scriptProcessorRef.current = null;

            if (!stopByException) {
                const disconnectRequest: SocketRequest<SocketDisconnectRequest> = {
                    route: "Disconnect",
                    request: {
                        reason: "stop transcription"
                    }
                };
                const disconnectMessage = serializeMessage(disconnectRequest, connectionId);
                sendWebSocketMessage(disconnectMessage);
                await waitForDisconnectResponse();
            }
            setIsRecording(false);
    };

    const clearTranscript = () => setTranscript(null);

    const waitForAuthenticationResult = async (): Promise<SocketAuthResponse> => {
        while (!authResponseRef.current) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return authResponseRef.current;
    };

    const waitForDisconnectResponse = async (): Promise<SocketDisconnectResponse> => {
        while (!disconnectResponseRef.current) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return disconnectResponseRef.current;
    };

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

const serializeMessage = (
    message: SocketRequest<SocketConnectRequest | SocketTranscribeRequest | SocketDisconnectRequest>,
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