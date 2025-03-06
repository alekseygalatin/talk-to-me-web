import {Transcriber, TranscriberStartParams} from './Transcriber';
import {useGraphProcessing} from "../GraphProcessing.ts";

export const useRemoteSpeechRecognitionTranscriber = (): Transcriber => {
    const {
        startProcessing,
        stopProcessing,
        transcript,
        isProcessing
    } = useGraphProcessing();


    const startTranscript = async (params?: TranscriberStartParams): Promise<void> => {
        try {
            await startProcessing({
                GraphType: "Transcribe",
                TranscriberStartParams: {
                    continuous: true,
                    language: params?.currentLanguageToLearn ?? 'en-US',
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
        //resetTranscript();
    };

    return {
        startTranscript,
        stopTranscript,
        clearTranscript,
        transcript: transcript,
        isRecording: isProcessing
    };
};
