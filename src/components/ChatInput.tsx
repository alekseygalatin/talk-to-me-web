import { Mic, Send, Loader2, MicOff, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { TipsDialog } from './TipsDialog';
import { useAppContext } from '../contexts/AppContext';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isProcessing: boolean;
}

export function ChatInput({
                              onSendMessage,
                              isProcessing,
                          }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [isTipsOpen, setIsTipsOpen] = useState(false);
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
    } = useSpeechRecognition();

    const { preferences } = useAppContext();

    // Handle recording stop and send message
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (!listening && transcript) {
            // Small delay to ensure we have the final transcript
            timeoutId = setTimeout(() => {
                const finalMessage = transcript.trim();
                if (finalMessage) {
                    onSendMessage(finalMessage);
                    setMessage('');
                }
                resetTranscript();
            }, 500);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [listening, transcript, onSendMessage]);

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

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            setMessage(''); // Clear any existing message when starting to listen
            resetTranscript();
            SpeechRecognition.startListening({
                continuous: true,
                language: preferences?.currentLanguageToLearn!
            });
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="text-center p-4 text-red-500">
                Browser doesn't support speech recognition.
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={listening ? transcript : message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={listening ? 'Listening...' : 'Type a message...'}
                    className={`w-full rounded-2xl border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 
                        dark:text-white dark:placeholder-gray-400 pl-4 pr-32 py-3 focus:outline-none focus:border-blue-500 resize-none min-h-[52px] ${
                        listening ? 'animate-pulse' : ''
                    }`}
                    rows={1}
                    disabled={isProcessing || listening}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {/*<button*/}
                    {/*    type="button"*/}
                    {/*    onClick={() => setIsTipsOpen(true)}*/}
                    {/*    className={`p-2.5 rounded-full ${*/}
                    {/*        isDark*/}
                    {/*            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'*/}
                    {/*            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'*/}
                    {/*    } transition-colors`}*/}
                    {/*    aria-label="Show tips"*/}
                    {/*>*/}
                    {/*    <Info className="w-5 h-5" />*/}
                    {/*</button>*/}
                    {isMicrophoneAvailable ? (
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`p-2.5 rounded-full transition-all ${
                                listening
                                    ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                            disabled={isProcessing}
                            title={listening ? 'Stop listening' : 'Start listening'}
                        >
                            {listening ? (
                                <MicOff className="w-5 h-5" />
                            ) : (
                                <Mic className="w-5 h-5" />
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className='p-2.5 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                            disabled
                            title="Microphone access denied"
                        >
                            <MicOff className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!message.trim() || isProcessing || listening}
                        className='p-2.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600 
                            text-white disabled:hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white dark:disabled:hover:bg-blue-600'
                    >
                        {isProcessing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </form>
            <TipsDialog
                isOpen={isTipsOpen}
                onClose={() => setIsTipsOpen(false)}
            />
        </>
    );
}