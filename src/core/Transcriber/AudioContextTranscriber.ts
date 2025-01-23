import {useState, useRef} from 'react';
import {useWebSocket} from "../../api/WebSocketApi/WebsocketService.ts";
import {Transcriber, TranscriberStartParams} from "./Transcriber.ts";

export const useAudioContextTranscriber = (webSocketUrl: string | null): Transcriber => {
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    const {webSocketMessage, sendWebSocketMessage} = useWebSocket(webSocketUrl);

    const startTranscript = async (params?: TranscriberStartParams) => {
        try {
            const connectionId = crypto.randomUUID().toString();
            const audioContext = new AudioContext();
            const mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
            const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);

            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            mediaStreamSource.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
                const audioData = event.inputBuffer.getChannelData(0);
                const isSilence = detectSilence(audioData);
                if (!isSilence) {
                    return;
                }
                const audioChunk = encodePCMChunk(audioData);
                const binaryString = convertToBase64(audioChunk);
                const metadata = {
                    // RequestContext fields for backend identification
                    request_context: {
                        session_id: connectionId,
                        route_key: "sendAudioChunk",
                        audio_metadata: {
                            sample_rate: 8000,
                            codec: 'pcm_s16le',
                        },
                        stage: "dev",
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
        };

    const stopTranscript = () => {
        if (isRecording) {
            scriptProcessorRef.current?.disconnect();
            audioContextRef.current?.close();
            mediaStreamRef.current?.getTracks().forEach((track) => track.stop());

            audioContextRef.current = null;
            mediaStreamRef.current = null;
            scriptProcessorRef.current = null;

            setIsRecording(false);
        }
    };

    const clearTranscript = () => setTranscript('');

    // Update transcript when a new message is received from the WebSocket
    if (webSocketMessage) {
        setTranscript((prev) => `${prev} ${webSocketMessage}`.trim());
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
};

const detectSilence = (chunk: Float32Array): boolean => {
    const rms = Math.sqrt(chunk.reduce((sum, sample) => sum + sample * sample, 0) / chunk.length);
    return rms < 0.01; // Silence threshold
};
