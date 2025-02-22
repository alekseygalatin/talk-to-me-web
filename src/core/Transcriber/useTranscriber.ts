import {useRemoteSpeechRecognitionTranscriber} from "./RemoteSpeechRecognitionTranscriber.ts";
import {useSpeechRecognition} from 'react-speech-recognition';
import {ExperimentalSettings} from "../../models/ExperimentalSettings.ts";
import {Transcriber, TranscriberContext} from "./Transcriber.ts";
import {useBrowserBasedSpeechRecognitionTranscriber} from "./BrowserBasedSpeechRecognitionTranscriber.ts";

export const useTranscriber = (experimentalSettings: ExperimentalSettings): TranscriberContext => {
    const {
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
    } = useSpeechRecognition();

    // use browser based recognition if available, otherwise use audio context
    let transcriber: Transcriber = useBrowserBasedSpeechRecognitionTranscriber();
    if (!browserSupportsSpeechRecognition && experimentalSettings.StreamTranscriptionSupported) {
        transcriber = useRemoteSpeechRecognitionTranscriber();
    }
    transcriber = useRemoteSpeechRecognitionTranscriber();
    const isSpeechRecognitionSupported = browserSupportsSpeechRecognition || experimentalSettings.StreamTranscriptionSupported;

    return {
        transcriber,
        isMicrophoneAvailable,
        isSpeechRecognitionSupported,
    };
};