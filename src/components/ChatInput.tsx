import { Mic, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  theme: 'light' | 'dark';
}

export function ChatInput({
                            onSendMessage,
                            isRecording,
                            isProcessing,
                            onStartRecording,
                            onStopRecording,
                            theme,
                          }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDark = theme === 'dark';

  return (
      <form onSubmit={handleSubmit} className="relative">
      <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className={`w-full rounded-2xl border ${
              isDark
                  ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400'
                  : 'border-gray-200 bg-white text-gray-900'
          } pl-4 pr-24 py-3 focus:outline-none focus:border-blue-500 resize-none min-h-[52px]`}
          rows={1}
          disabled={isProcessing}
      />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
              type="button"
              onClick={isRecording ? onStopRecording : onStartRecording}
              className={`p-2 rounded-full transition-all ${
                  isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
              }`}
              disabled={isProcessing}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
              type="submit"
              disabled={!message.trim() || isProcessing}
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