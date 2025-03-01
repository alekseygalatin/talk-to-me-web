import { useState, useEffect, useRef } from 'react';
import { Mic, Send, Loader2, MicOff, Trash2, Image, Paperclip, Plus } from 'lucide-react';
import { experimentalSettingsManager } from "../core/ExperimentalSettingsManager.ts";
import { useTranscriber } from "../core/Transcriber/useTranscriber.ts";
import { TipsDialog } from './TipsDialog';
import { useAppContext } from '../contexts/AppContext';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onCleanHistory: () => void;
  isProcessing: boolean;
}

export function ChatInput({ onSendMessage, isProcessing, onCleanHistory }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [showExtraButtons, setShowExtraButtons] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const experimentalSettings = experimentalSettingsManager.getSettings();

  const {
    transcriber,
    isSpeechRecognitionSupported,
    isMicrophoneAvailable
  } = useTranscriber(experimentalSettings);

  const { isRecording, transcript, clearTranscript } = transcriber;
  const { preferences } = useAppContext();

  const toggleExtraButtons = () => {
    setShowExtraButtons(!showExtraButtons);
  };

  // Handle recording stop and send message
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!isRecording && transcript) {
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
    if (transcriber.isRecording) {
      await transcriber.stopTranscript();
    } else {
      setMessage("");
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
        <div className="flex flex-col w-full rounded-2xl border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 
              dark:text-white dark:placeholder-gray-400 p-2">
          <textarea
            ref={textareaRef}
            value={transcriber.isRecording ? (transcriber.transcript ? transcriber.transcript.transcript : '') : message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={transcriber.isRecording ? 'Listening...' : 'Type a message...'}
            className="flex-1 border-0 bg-white text-gray-900 dark:bg-gray-800 px-1
                dark:text-white dark:placeholder-gray-400 resize-none focus:outline-none"
            style={{ maxHeight: '120px', overflow: 'auto' }}
            disabled={isProcessing || transcriber.isRecording}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="relative flex items-center">
              <button
                onClick={toggleExtraButtons}
                className="p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 focus:outline-none transition"
                title="More Options"
              >
                <Plus className="w-5 h-5" />
              </button>
              <div
                className={`flex space-x-2 ml-2 transition-opacity duration-300 ${
                  showExtraButtons ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <button
                  className="p-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none transition"
                  title="Clean history"
                  onClick={onCleanHistory}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {isMicrophoneAvailable ? (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-full transition-all ${
                    transcriber.isRecording
                      ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  disabled={isProcessing}
                  title={transcriber.isRecording ? 'Stop listening' : 'Start listening'}
                >
                  {transcriber.isRecording ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className="p-2 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  disabled
                  title="Microphone access denied"
                >
                  <MicOff className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                disabled={!message.trim() || isProcessing || transcriber.isRecording}
                className="p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600 
                      text-white disabled:hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white dark:disabled:hover:bg-blue-600"
                title="Send Message"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      <TipsDialog isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </>
  );
}
