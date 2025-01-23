export interface TranscriberContext {
    transcriber: Transcriber;
    isMicrophoneAvailable: boolean;
    isSpeechRecognitionSupported: boolean;
}

export interface Transcriber {
    startTranscript(params?: TranscriberStartParams): Promise<void>; // Parameters for starting transcription
    stopTranscript(): void; // Stop transcription
    clearTranscript(): void; // Clear the current transcript
    transcript: string;
    isRecording: boolean; // Check if transcription is active
}

export interface TranscriberStartParams {
    language?: string; // Language for transcription (e.g., "en-US")
    continuous?: boolean; // Continuous listening (true/false)
    [key: string]: any; // Allow additional parameters
}