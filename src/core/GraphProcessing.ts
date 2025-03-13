import {useEffect, useRef, useState} from "react";
import {
    deserializeSocketResponse,
    RouteResponseType,
    SocketAuthResponse,
    SocketExceptionResponse,
    SocketGraphCreated,
    SocketPollyResponse,
    SocketTranscriptCompletedResponse,
    SocketTranscriptResponse
} from "../api/WebSocketApi/WebsocketResponse.ts";
import {useWebSocket} from "../api/WebSocketApi/WebsocketService.ts";
import {experimentalSettingsManager} from "./ExperimentalSettingsManager.ts";
import {Auth} from "aws-amplify";
import {TranscriberStartParams, TranscriptResult} from "./Transcriber/Transcriber.ts";
import {AudioMetadata, SocketRequestBuilder} from "../api/WebSocketApi/WebsocketRequest.ts";

const TARGET_SIZE: number = 50_000;

const experimentalSettings = experimentalSettingsManager.getSettings();

type GraphType = "Transcribe" | "TranscribeWithBedrockAndPolly";
type GraphProcessingStatus = "Idling" | "Preparing" | "Transcribing" | "Processing" | "Speaking";

export interface GraphProcessingParams {
    GraphType: GraphType;
    TranscriberStartParams: TranscriberStartParams;
    Circular: boolean;
}

export const useGraphProcessing = () => {
    const {webSocketMessage, sendWebSocketMessage} = useWebSocket();

    const graphCreatedResponseRef = useRef<SocketGraphCreated | null>(null);
    const authResponseRef = useRef<SocketAuthResponse | null>(null);
    const transcriptCompletedResponseRef = useRef<SocketTranscriptCompletedResponse | null>(null);

    //outgoing audio chunks
    const audioAccumulator = useRef<Float32Array[]>([]);
    const accumulatedSize = useRef<number>(0);

    //incomming audio chunks
    const audioChunks = useRef<Map<number, Uint8Array>>(new Map());
    const audioDataRef = useRef<Blob | null>(null);

    const [aiAgentResponse, setAiAgentResponse] = useState<SocketTranscriptCompletedResponse | null>(null);


    const stopProcessingRequestedRef = useRef<boolean>(false);
    const sessionIdRef = useRef<string>("");

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
        audioDataRef.current = audioData;
    }, [audioData]);

    // Handle incoming WebSocket messages
    useEffect(() => {
        if (!webSocketMessage) {
            return;
        }
        const deserialized = deserializeSocketResponse(webSocketMessage);
        if (!deserialized) {
            return;
        }

        if (deserialized.route === RouteResponseType.AuthResponse) {
            authResponseRef.current = deserialized.result as SocketAuthResponse;

            return;
        }

        if (deserialized.route === RouteResponseType.GraphCreated) {
            graphCreatedResponseRef.current = deserialized.result as SocketGraphCreated;

            return;
        }

        if (deserialized.route === RouteResponseType.Transcript) {
            const transcriptResult = deserialized.result as SocketTranscriptResponse;
            if (transcriptResult.isFinal) {
                setTranscript((prevState: TranscriptResult | null) => {
                    const transcript = prevState ? `${prevState.transcript} ${transcriptResult.text}` : `${transcriptResult.text}`;
                    console.log("Transcript:", transcript);
                    return {
                        isFinal: true,
                        transcript: transcript
                    }
                });
            }

            return;
        }

        if (deserialized.route === RouteResponseType.TranscriptCompleted) {
            transcriptCompletedResponseRef.current = deserialized.result as SocketTranscriptCompletedResponse;

            return;
        }

        if (deserialized.route === RouteResponseType.AiAgentResponse) {
            setAiAgentResponse(deserialized.result as SocketTranscriptCompletedResponse);

            return;
        }

        if (deserialized.route === RouteResponseType.PollyResult) {
            const pollyResult = deserialized.result as SocketPollyResponse;
            let audioBytes = Uint8Array.from(atob(pollyResult.audioChunk), (c) =>
                c.charCodeAt(0)
            );

            if(pollyResult.chunked) {
                audioChunks.current.set(pollyResult.chunkIndex, audioBytes);

                if(pollyResult.chunkIndex == pollyResult.totalChunks - 1) {
                    let totalLength = 0;
                    for (let i = 0; i < pollyResult.totalChunks; i++) {
                        const chunk = audioChunks.current.get(i);
                        if (!chunk) {
                            console.warn(`Missing audio chunk ${i}, but continuing with what we have`);
                            continue;
                        }
                        totalLength += chunk.length;
                    }

                    audioBytes = new Uint8Array(totalLength);
                    let offset = 0;
                    
                    for (let i = 0; i < pollyResult.totalChunks; i++) {
                        const chunk = audioChunks.current.get(i);
                        if (!chunk) continue; // Skip missing chunks
                        
                        audioBytes.set(chunk, offset);
                        offset += chunk.length;
                    }
                } else {
                    return;
                }

                audioChunks.current.clear();
            }

            const audioBlob = new Blob([audioBytes], {type: "audio/wav"});
            setAudioData(audioBlob);
            return;
        }

        if (deserialized.route === RouteResponseType.Exception) {
            const errorResult = deserialized.result as SocketExceptionResponse;
            console.log("Error:", errorResult);
            stopProcessing();

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
            clearState();

            // TODO - find a better way, but now it is fast and difficult to start speaking in a second interval
            setTimeout(() => {
            }, 1_000);
        }
    }

    const startProcessingInternal = async (parameters: GraphProcessingParams) => {
        try {
            const newId = crypto.randomUUID();
            sessionIdRef.current = newId;

            setIsProcessing(true);

            // TODO - add loading spinner or any alternative to notify we are starting live conversation
            setGraphProcessingStatus("Processing");

            const token = (await Auth.currentSession()).getAccessToken()?.getJwtToken();
            const createGraphRequest = SocketRequestBuilder
                .createGraph(parameters.GraphType, token, parameters.TranscriberStartParams.language)
                .serialize(sessionIdRef.current, experimentalSettings.WebSocket.isDevelopment);
            sendWebSocketMessage(createGraphRequest);

            await waitForResult(graphCreatedResponseRef);

            const authResponse = await waitForResult(authResponseRef);
            if (!authResponse.authSuccessful) {
                console.error("Authentication failed");
                return;
            }

            if (isStopped()) return;

            if (parameters.GraphType === "Transcribe" || parameters.GraphType === "TranscribeWithBedrockAndPolly") {
                console.log("Starting transcription");
                setGraphProcessingStatus("Transcribing");
                if (!await tryStartTranscript(parameters.TranscriberStartParams)) {
                    setGraphProcessingStatus("Idling");
                    return;
                }

                if (isStopped()) return;

                await waitForResult(transcriptCompletedResponseRef, 60);
                console.log("Transcription completed");
            }

            if (isStopped()) return;

            if (parameters.GraphType === "TranscribeWithBedrockAndPolly") {
                console.log("Starting audio processing");
                setGraphProcessingStatus("Processing");
                await waitForResult(audioDataRef, 60);

                if (isStopped()) return;

                setGraphProcessingStatus("Speaking");
                await playAudio(audioDataRef.current);
                console.log("Audio processing completed");
            }
        } catch (error) {
            console.error("Error during processing:", error);
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

            let lastAudioDataReceivedTime = Date.now();
            let transcriptProcessingStopped = false;
            scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
                if (transcriptProcessingStopped) {
                    return;
                }
                if (isStopped()) {
                    transcriptProcessingStopped = true;
                }

                const audioBuffer = event.inputBuffer.getChannelData(0);
                const audioMetadata: AudioMetadata = {
                    sampleRate: event.inputBuffer.sampleRate,
                    codec: 'pcm'
                };

                const isSilence = detectSilence(audioBuffer);
                if (isSilence && params.stopBySilence) {
                    if (Date.now() - lastAudioDataReceivedTime > 3_500) {
                        console.log("Silence detected, stopping transcription");
                        transcriptProcessingStopped = true;
                    }
                } else {
                    lastAudioDataReceivedTime = Date.now();
                }

                // Add the current buffer to the accumulator
                audioAccumulator.current.push(new Float32Array(audioBuffer));
                accumulatedSize.current += audioBuffer.length * 4; // 4 bytes per float32
                if (accumulatedSize.current >= TARGET_SIZE || transcriptProcessingStopped) {
                    sendAccumulatedAudio(audioMetadata);
                }

                if (transcriptProcessingStopped) {
                    stopTranscribingInternal(false);
                }
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
    
    // Add this method to your class
    const sendAccumulatedAudio = (audioMetadata: AudioMetadata): void => {
        if (audioAccumulator.current.length === 0) return;
        
        // Make a copy of the current accumulator and reset it immediately
        // This prevents race conditions with new incoming audio
        const buffersToSend = [...audioAccumulator.current];
        audioAccumulator.current = [];
        accumulatedSize.current = 0;
        
        // Calculate total length
        let totalLength = 0;
        for (const buffer of buffersToSend) {
            totalLength += buffer.length;
        }
        
        // Combine all accumulated buffers
        const combinedBuffer = new Float32Array(totalLength);
        let offset = 0;
        
        for (const buffer of buffersToSend) {
            combinedBuffer.set(buffer, offset);
            offset += buffer.length;
        }
        
        // Encode and send the combined chunk
        const audioChunk = encodePCMChunk(combinedBuffer);
        // console.log(`Sending accumulated audio chunk: ${(audioChunk.length * 0.75 / 1024).toFixed(2)}KB`);
        
        const request = SocketRequestBuilder
            .transcribe(audioChunk, audioMetadata)
            .serialize(sessionIdRef.current, experimentalSettings.WebSocket.isDevelopment);
        
        sendWebSocketMessage(request);
    }

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
        setGraphProcessingStatus("Processing");
        stopAudio();

        await stopTranscribingInternal(false);
        const createGraphRequest = SocketRequestBuilder
            .stopGraph()
            .serialize(sessionIdRef.current, experimentalSettings.WebSocket.isDevelopment);
        sendWebSocketMessage(createGraphRequest);

        setIsProcessing(false);
        setGraphProcessingStatus("Idling");
    }

    const clearState = () => {
        console.log("Clearing state");
        authResponseRef.current = null;
        transcriptCompletedResponseRef.current = null;
        audioContextRef.current = null;
        mediaStreamRef.current = null;
        scriptProcessorRef.current = null;
        setTranscript(null);
        setAudioData(null);
    }

    const stopTranscribingInternal = async (stopByException: boolean) => {
        console.log("Stopping transcription internal");
        scriptProcessorRef.current?.disconnect();
        if (audioContextRef.current?.state !== "closed") {
            mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
            audioContextRef.current?.close();
        }

        // If transcriptCompletedResponseRef not null that mean transcription already stopped, do nothing
        if (transcriptCompletedResponseRef.current) {
            return;
        }

        if (!stopByException) {
            const createGraphRequest = SocketRequestBuilder
                .stopTranscript()
                .serialize(sessionIdRef.current, experimentalSettings.WebSocket.isDevelopment);
            sendWebSocketMessage(createGraphRequest);
            await waitForResult(transcriptCompletedResponseRef, 5);
        }
    };

    const stopAudio = () => {
        if (audioRef.current) {
            console.log("Stopping audio");
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reset playback to start
            resolvePlayback?.(); // Resolve the Promise to prevent blocking
            audioRef.current = null;
            setAudioData(null);
        }
    };

    // May need to add logic stop waiting if exception received
    const waitForResult = async <T>(
        ref: React.MutableRefObject<T | null>,
        timeoutSeconds: number = 5
    ): Promise<T> => {
        const startTime = Date.now();
        const timeoutMs = timeoutSeconds * 1000;

        while (!ref.current && !isStopped()) {
            if (Date.now() - startTime > timeoutMs) {
                throw new Error(`Operation timed out after ${timeoutSeconds} seconds`);
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        return ref.current;
    };

    const isStopped: () => boolean = () => {
        return stopProcessingRequestedRef.current === true;
    }

    return {
        startProcessing,
        stopProcessing,
        clearState,
        graphProcessingStatus,
        transcript,
        isProcessing
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

const detectSilence = (chunk: Float32Array): boolean => {
    const rms = Math.sqrt(chunk.reduce((sum, sample) => sum + sample * sample, 0) / chunk.length);
    return rms < 0.01; // Silence
}