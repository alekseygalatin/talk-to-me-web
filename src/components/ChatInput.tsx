import {useState, useEffect, useRef} from 'react';
import {Mic, Send, Loader2, MicOff} from 'lucide-react';
import {TipsDialog} from './TipsDialog';
import {useAppContext} from '../contexts/AppContext';
import {experimentalSettingsManager} from "../core/ExperimentalSettingsManager.ts";
import {useTranscriber} from "../core/Transcriber/useTranscriber.ts";

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isProcessing: boolean;
}

export function ChatInput({onSendMessage, isProcessing}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [isTipsOpen, setIsTipsOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const experimentalSettings = experimentalSettingsManager.getSettings();

    const {
        transcriber,
        isSpeechRecognitionSupported,
        isMicrophoneAvailable
    } = useTranscriber(experimentalSettings);

    const{isRecording, transcript, clearTranscript} = transcriber;
    const {preferences} = useAppContext();

    // Handle recording stop and send message
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (!isRecording && transcript) {
            // Small delay to ensure we have the final transcript
            timeoutId = setTimeout(() => {
                const finalMessage = transcript.transcript.trim();
                if (finalMessage) {
                    onSendMessage(finalMessage);
                    setMessage('');
                }
                clearTranscript();
            }, 500);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isRecording, transcript]);

    // Adjust textarea height dynamically
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                120 // Maximum height for 6 lines (20px per line + padding)
            )}px`;
        }
    }, [message]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const toggleListening = async () => {
        // Handle SpeechRecognition
        if (transcriber.isRecording) {
            await transcriber.stopTranscript();
        } else {
            setMessage(""); // Clear the current message
            transcriber.clearTranscript();
            await transcriber.startTranscript({
                continuous: true,
                language: preferences?.currentLanguageToLearn ?? "sv-SE",
            });
        }
    };

    if (!isSpeechRecognitionSupported) {
        return (
            <div className="text-center p-4 text-red-500">
                Browser doesn't support speech recognition.
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className='flex w-full rounded-2xl border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800
              dark:text-white dark:placeholder-gray-400 p-3'>
            <textarea
                ref={textareaRef}
                value={transcriber.isRecording ? (transcriber.transcript ? transcriber.transcript.transcript : '') : message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={transcriber.isRecording ? 'Listening...' : 'Type a message...'}
                className={`w-8/12 sm:w-10/12  border-0 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 px-1
                    dark:text-white dark:placeholder-gray-400 resize-none focus:outline-none`}
                style={{maxHeight: '120px', overflow: 'auto'}} // Set max height for 6 lines
                disabled={isProcessing || transcriber.isRecording}
            />
                    <div className="w-4/12 sm:w-2/12 flex items-end justify-end gap-2">
                        {isMicrophoneAvailable ? (
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`p-2.5 rounded-full transition-all ${
                                    transcriber.isRecording
                                        ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                                disabled={isProcessing}
                                title={transcriber.isRecording ? 'Stop listening' : 'Start listening'}
                            >
                                {transcriber.isRecording ? (
                                    <MicOff className="w-5 h-5"/>
                                ) : (
                                    <Mic className="w-5 h-5"/>
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="p-2.5 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                                disabled
                                title="Microphone access denied"
                            >
                                <MicOff className="w-5 h-5"/>
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!message.trim() || isProcessing || transcriber.isRecording}
                            className="p-2.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600
                    text-white disabled:hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white dark:disabled:hover:bg-blue-600"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin"/>
                            ) : (
                                <Send className="w-5 h-5"/>
                            )}
                        </button>
                    </div>
                </div>

            </form>
            <TipsDialog isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)}/>
        </>
    );
}
