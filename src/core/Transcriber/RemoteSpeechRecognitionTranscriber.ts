import {Transcriber, TranscriberStartParams} from './Transcriber';
import {useGraphProcessing} from "../GraphProcessing.ts";

export const useRemoteSpeechRecognitionTranscriber = (): Transcriber => {
    const {
        startProcessing,
        stopProcessing,
        transcript,
        isProcessing,
        clearState
    } = useGraphProcessing();


    const startTranscript = async (params?: TranscriberStartParams): Promise<void> => {
        try {
            await startProcessing({
                GraphType: "Transcribe",
                TranscriberStartParams: {
                    continuous: true,
                    language: params?.language ?? 'en-US',
                    stopBySilence: false
                },
                Circular: false
            });
        } catch (error) {
            console.error('Error starting SpeechRecognition:', error);
        }
    };

    const stopTranscript = async (): Promise<void> => {
        await stopProcessing();
    };

    const clearTranscript = (): void => {
        clearState();
    };

    return {
        startTranscript,
        stopTranscript,
        clearTranscript,
        transcript: transcript,
        isRecording: isProcessing
    };
};
