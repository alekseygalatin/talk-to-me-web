import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Transcriber, TranscriberStartParams } from './Transcriber';

export const useSpeechRecognitionTranscriber = (): Transcriber => {
    const {
        transcript,
        listening,
        resetTranscript
    } = useSpeechRecognition();

    const startTranscript = async (params?: TranscriberStartParams): Promise<void> => {
        const { language = 'en-US', continuous = true } = params || {};

        try {
            SpeechRecognition.startListening({
                continuous,
                language
            });
        } catch (error) {
            console.error('Error starting SpeechRecognition:', error);
        }
    };

    const stopTranscript = (): void => {
        SpeechRecognition.stopListening();
    };

    const clearTranscript = (): void => {
        resetTranscript();
    };

    return {
        startTranscript,
        stopTranscript,
        clearTranscript,
        transcript,
        isRecording: listening
    };
};
