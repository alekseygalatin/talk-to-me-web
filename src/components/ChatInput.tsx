import { Mic, Send, Loader2, MicOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isProcessing: boolean;
    theme: 'light' | 'dark';
    language: string;
}

export function ChatInput({
                              onSendMessage,
                              isProcessing,
                              theme,
                              language,
                          }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
    } = useSpeechRecognition();

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
                language: language
            });
        }
    };

    const isDark = theme === 'dark';

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="text-center p-4 text-red-500">
                Browser doesn't support speech recognition.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
      <textarea
          value={listening ? transcript : message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={listening ? 'Listening...' : 'Type a message...'}
          className={`w-full rounded-2xl border ${
              isDark
                  ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400'
                  : 'border-gray-200 bg-white text-gray-900'
          } pl-4 pr-24 py-3 focus:outline-none focus:border-blue-500 resize-none min-h-[52px] ${
              listening ? 'animate-pulse' : ''
          }`}
          rows={1}
          disabled={isProcessing || listening}
      />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {isMicrophoneAvailable ? (
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-2 rounded-full transition-all ${
                            listening
                                ? 'bg-red-500 text-white animate-pulse'
                                : isDark
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        disabled={isProcessing}
                        title={listening ? 'Stop listening' : 'Start listening'}
                    >
                        {listening ? (
                            <MicOff className="w-4 h-4" />
                        ) : (
                            <Mic className="w-4 h-4" />
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        className={`p-2 rounded-full ${
                            isDark
                                ? 'bg-gray-700 text-gray-500'
                                : 'bg-gray-100 text-gray-400'
                        } cursor-not-allowed`}
                        disabled
                        title="Microphone access denied"
                    >
                        <MicOff className="w-4 h-4" />
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!message.trim() || isProcessing || listening}
                    className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:hover:bg-blue-600"
                >
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </button>
            </div>
        </form>
    );
}