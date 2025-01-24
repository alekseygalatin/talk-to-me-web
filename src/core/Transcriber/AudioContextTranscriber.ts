import {useState, useRef, useEffect} from 'react';
import {useWebSocket} from "../../api/WebSocketApi/WebsocketService.ts";
import {Transcriber, TranscriberStartParams, TranscriptResult} from "./Transcriber.ts";

export const useAudioContextTranscriber = (webSocketUrl: string | null): Transcriber => {
    const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const [connectionId, setConnectionId] = useState('');

    const {webSocketMessage, sendWebSocketMessage} = useWebSocket(webSocketUrl);

    const startTranscript = async (params?: TranscriberStartParams) => {
        try {
            // setWebSocketAddress(webSocketUrl);
            const connectionId = crypto.randomUUID().toString();
            setConnectionId(connectionId);
            const audioContext = new AudioContext();
            const mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
            const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);

            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            mediaStreamSource.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
            const metadata = {
                // RequestContext fields for backend identification
                requestContext: {
                    connectionId: connectionId,
                    domainName: "localhost",
                    routeKey: "sendAudioChunk",
                    stage: "dev",
                },
                token: "xxxxxx",
                audioMetadata: {
                    sampleRate: 8000,
                    codec: 'pcm_s16le',
                }
            };
            const metadataJson = JSON.stringify(metadata);
            sendWebSocketMessage(metadataJson);

            scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
                const audioData = event.inputBuffer.getChannelData(0);
                // const isSilence = detectSilence(audioData);
                // if (isSilence) {
                //     return;
                // }
                const audioChunk = encodePCMChunk(audioData);
                const binaryString = convertToBase64(audioChunk);
                const metadata = {
                    // RequestContext fields for backend identification
                    requestContext: {
                        connectionId: connectionId
                    },
                    body: binaryString
                };
                const metadataJson = JSON.stringify(metadata);
                sendWebSocketMessage(metadataJson);
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

    const stopTranscript = () => {
        if (isRecording) {
            const metadata = {
                // RequestContext fields for backend identification
                requestContext: {
                    connectionId: connectionId,
                    domainName: "localhost",
                    routeKey: "sendAudioChunk",
                    stage: "dev",
                },
                reason: "stop"
            };
            const metadataJson = JSON.stringify(metadata);
            sendWebSocketMessage(metadataJson);

            scriptProcessorRef.current?.disconnect();
            audioContextRef.current?.close();
            mediaStreamRef.current?.getTracks().forEach((track) => track.stop());

            audioContextRef.current = null;
            mediaStreamRef.current = null;
            scriptProcessorRef.current = null;

            setIsRecording(false);
        }
    };

    const clearTranscript = () => setTranscript(null);

    const parseTranscriptResult = (json: string): TranscriptResult => {
        const parsed = JSON.parse(json);
        return {
            isFinal: parsed.is_final,
            transcript: parsed.text,
            timedOut: parsed.timed_out,
        };
    }

    useEffect(() => {
        if (!webSocketMessage) {
            return;
        }

        const transcriptResult = parseTranscriptResult(webSocketMessage);
        if (transcriptResult.isFinal){
            setTranscript((prevState) => {
                if (prevState) {
                    return {
                        isFinal: true,
                        transcript: `${prevState.transcript} ${transcriptResult.transcript}`
                    }
                }
                return transcriptResult;
            });
        }
    }, [webSocketMessage]);

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
