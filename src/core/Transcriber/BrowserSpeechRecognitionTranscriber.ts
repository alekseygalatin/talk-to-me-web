import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {Transcriber, TranscriberStartParams, TranscriptResult} from './Transcriber';
import {useEffect, useState} from "react";

export const useSpeechRecognitionTranscriber = (): Transcriber => {
    const [transcriptResult, setTranscript] = useState<TranscriptResult | null>(null);

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

    const stopTranscript = async (): Promise<void> => {
        SpeechRecognition.stopListening();
    };

    const clearTranscript = (): void => {
        resetTranscript();
    };

    useEffect(() => {
        const transcriptResult: TranscriptResult = {
            isFinal: true,
            transcript: transcript
        };
        setTranscript(() => transcriptResult);
    }, [transcript]);

    return {
        startTranscript,
        stopTranscript,
        clearTranscript,
        transcript: transcriptResult,
        isRecording: listening
    };
};
