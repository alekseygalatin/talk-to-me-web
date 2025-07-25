export interface TranscriberContext {
    transcriber: Transcriber;
    isMicrophoneAvailable: boolean;
    isSpeechRecognitionSupported: boolean;
}

export interface Transcriber {
    startTranscript(params?: TranscriberStartParams): Promise<void>;

    stopTranscript(): Promise<void>;

    clearTranscript(): void;

    transcript: TranscriptResult | null;

    isRecording: boolean;
}

export interface TranscriptResult {
    isFinal: boolean;
    transcript: string;
    timedOut?: boolean;
}

export interface TranscriberStartParams {
    language: string;
    continuous?: boolean,
    stopBySilence: boolean,

    [key: string]: any;
}