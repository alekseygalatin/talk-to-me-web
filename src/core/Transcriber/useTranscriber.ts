import {useAudioContextTranscriber} from "./AudioContextTranscriber.ts";
import {useSpeechRecognition} from 'react-speech-recognition';
import {ExperimentalSettings} from "../../models/ExperimentalSettings.ts";
import {TranscriberContext} from "./Transcriber.ts";
import {useSpeechRecognitionTranscriber} from "./BrowserSpeechRecognitionTranscriber.ts";

export const useTranscriber = (experimentalSettings: ExperimentalSettings, webSocketUrl: string | null = null): TranscriberContext => {
    // Use SpeechRecognition transcriber
    const {
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
    } = useSpeechRecognition();

    const isSpeechRecognitionSupported = browserSupportsSpeechRecognition || experimentalSettings.UseStreamTranscription;

    const transcriber = experimentalSettings.UseStreamTranscription
        ? useAudioContextTranscriber(webSocketUrl)
        : useSpeechRecognitionTranscriber();
    return {
        transcriber,
        isMicrophoneAvailable,
        isSpeechRecognitionSupported,
    };
};