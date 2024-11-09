import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Copy, Volume2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  theme: 'light' | 'dark';
}

interface WordPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  theme: 'light' | 'dark';
}

function WordPopup({ word, position, onClose, theme }: WordPopupProps) {
  const isDark = theme === 'dark';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed z-50 px-4 py-2 rounded-lg shadow-lg ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -130%)',
      }}
    >
      <div className="flex gap-2 items-center">
        <span className="font-medium">{word}</span>
        <div className="flex gap-1">
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(word);
              onClose();
            }}
            className={`text-sm px-2 py-1 rounded ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Copy word"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance(word);
              window.speechSynthesis.speak(utterance);
            }}
            className={`text-sm px-2 py-1 rounded ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Speak word"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div 
        className={`absolute bottom-0 left-1/2 w-2 h-2 transform translate-y-1/2 rotate-45 -translate-x-1/2 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      />
    </motion.div>
  );
}

export function MessageBubble({ message, theme }: MessageBubbleProps) {
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    position: { x: number; y: number };
  } | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<number>();

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const updateProgress = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', () => {
          setIsPlaying(false);
          setProgress(0);
        });
      };
    }
  }, []);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const time = (percentage / 100) * audioRef.current.duration;

      audioRef.current.currentTime = time;
      setProgress(percentage);
    }
  };

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const clickRect = event.currentTarget.getBoundingClientRect();

    setSelectedWord({
      word,
      position: {
        x: clickRect.left - 50,
        y: clickRect.top - 50, // Adjust this value to control the vertical offset above the word
      },
    });
  };

  const renderWords = (text: string) => {
    return text.split(' ').map((word, index, array) => (
      <span key={index}>
        <span
          onClick={(e) => handleWordClick(word, e)}
          className={`cursor-pointer hover:bg-opacity-20 ${
            theme === 'dark' 
              ? 'hover:bg-gray-300' 
              : 'hover:bg-gray-600'
          } rounded px-0.5 py-0.5 transition-colors duration-200`}
        >
          {word}
        </span>
        {index < array.length - 1 ? ' ' : ''}
      </span>
    ));
  };

  return (
    <div className="relative">
      <motion.div
        ref={messageRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
        onClick={() => setSelectedWord(null)}
      >
        <div
            className={`relative max-w-[80%] rounded-2xl px-4 py-2 ${
                message.isUser
                    ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                    : theme === 'dark'
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-900'
            }`}
        >
          {renderWords(message.text)}
          {message.audioUrl && (
              <div className="mt-2 flex items-center gap-2">
                <button
                    onClick={toggleAudio}
                    className="p-2 rounded-full hover:bg-black/10 transition-colors"
                >
                  {isPlaying ? (
                      <Pause className="w-4 h-4"/>
                  ) : (
                      <Play className="w-4 h-4"/>
                  )}
                </button>
                <audio
                    ref={audioRef}
                    src={message.audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                />
                <div
                    className="h-1.5 flex-1 bg-black/10 rounded-full cursor-pointer overflow-hidden"
                    onClick={handleProgressBarClick}
                >
                  <motion.div
                      className="h-full bg-black/20 rounded-full"
                      style={{width: `${progress}%`}}
                      transition={{type: "tween"}}
                  />
                </div>
              </div>
          )}
          <span className="text-xs opacity-60 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedWord && (
            <motion.div
                initial={{opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`fixed z-50 px-4 py-2 rounded-lg shadow-lg ${
              isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
            style={{
              left: `${selectedWord.position.x}px`,
              top: `${selectedWord.position.y}px`,
              transform: 'translate(-50%, -130%)',
            }}
          >
            <div className="flex gap-2 items-center">
              <span className="font-medium">{selectedWord.word}</span>
              <div className="flex gap-1">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await navigator.clipboard.writeText(selectedWord.word);
                    setSelectedWord(null);
                  }}
                  className={`text-sm px-2 py-1 rounded ${
                    isDark 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Copy word"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const utterance = new SpeechSynthesisUtterance(selectedWord.word);
                    window.speechSynthesis.speak(utterance);
                  }}
                  className={`text-sm px-2 py-1 rounded ${
                    isDark 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Speak word"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div 
              className={`absolute bottom-0 left-1/2 w-2 h-2 transform translate-y-1/2 rotate-45 -translate-x-1/2 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {selectedWord && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
}