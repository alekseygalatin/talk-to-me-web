import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Copy, Volume2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import React, { forwardRef } from 'react';

interface MessageBubbleProps {
  message: Message;
  theme: 'light' | 'dark';
  onTranslate: (word: string, token: string) => Promise<any>;
  language: string;
  token: string | null;
}

interface WordPopupProps {
  word: string;
  onClose: () => void;
  theme: 'light' | 'dark';
  onTranslate: (word: string, token: string) => Promise<any>;
  language: string;
  token: string | null;
}

const WordPopup = forwardRef<HTMLDivElement, WordPopupProps>(
  ({ word, onClose, theme, onTranslate, language, token }, ref) => {
    const isDark = theme === 'dark';
    const [translation, setTranslation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const translateRequestRef = useRef<AbortController | null>(null);

    useEffect(() => {
      if (translateRequestRef.current) {
        translateRequestRef.current.abort();
      }

      translateRequestRef.current = new AbortController();

      const loadTranslation = async () => {
        if (!word) return;

        setIsLoading(true);
        try {
          const result = await onTranslate(word, token!);
          setTranslation(result);
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Translation error:', error);
          }
        } finally {
          setIsLoading(false);
        }
      };

      const timeoutId = setTimeout(loadTranslation, 300);

      return () => {
        clearTimeout(timeoutId);
        if (translateRequestRef.current) {
          translateRequestRef.current.abort();
        }
      };
    }, [word, onTranslate]);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative rounded-2xl shadow-2xl
            w-[95vw] sm:w-[550px] md:w-[600px] lg:w-[650px]
            ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
            backdrop-blur-lg backdrop-filter
            border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <button
            onClick={onClose}
            className={`absolute right-4 top-4 p-2 rounded-full transition-colors
              ${isDark 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              ${isDark ? 'focus:ring-gray-700' : 'focus:ring-gray-300'}
            `}
            aria-label="Close popup"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-semibold">{word}</span>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(word);
                      onClose();
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Copy word"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const utterance = new SpeechSynthesisUtterance(word);
                      utterance.lang = language;
                      utterance.rate = 0.9;
                      window.speechSynthesis.speak(utterance);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Speak word"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-3 
                  border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent"/>
              </div>
            ) : (
              translation && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Translation
                    </h3>
                    <p className="text-xl font-medium">{translation.translation}</p>
                  </div>

                  <div>
                    <h3 className={`text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Example
                    </h3>
                    <p className={`p-4 rounded-lg ${
                      isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      {translation.example_usage}
                    </p>
                  </div>

                  <div>
                    <h3 className={`text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Notes
                    </h3>
                    <p className={`italic ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {translation.translation_notes}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    );
  }
);

export default WordPopup;

export function MessageBubble({ message, theme, onTranslate, language, token }: MessageBubbleProps) {
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    position: { x: number; y: number };
  } | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

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

  useEffect(() => {
    const adjustPopupPosition = () => {
      if (popupRef.current && selectedWord) {
        const rect = popupRef.current.getBoundingClientRect();
        const newStyle: React.CSSProperties = {};

        // Calculate initial position
        let left = selectedWord.position.x - rect.width / 2; // Center horizontally
        let top = selectedWord.position.y + 10; // Slightly below the word

        // Adjust horizontal position
        if (left + rect.width > window.innerWidth) {
          left = window.innerWidth - rect.width - 10; // 10px padding
        } else if (left < 0) {
          left = 10; // 10px padding from the left
        }

        // Adjust vertical position
        if (top + rect.height > window.innerHeight) {
          top = selectedWord.position.y - rect.height - 10; // 10px padding
        } else if (top < 0) {
          top = 10; // 10px padding from the top
        }

        newStyle.left = left;
        newStyle.top = top;

        setPopupStyle(newStyle);
      }
    };

    const resizeObserver = new ResizeObserver(adjustPopupPosition);

    if (popupRef.current) {
      resizeObserver.observe(popupRef.current);
    }

    window.addEventListener('resize', adjustPopupPosition);

    return () => {
      if (popupRef.current) {
        resizeObserver.unobserve(popupRef.current);
      }
      window.removeEventListener('resize', adjustPopupPosition);
    };
  }, [selectedWord]);

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
    
    // Clean the word from any symbols
    const cleanWord = word.replace(/[.,!?;:'"()\[\]{}]/g, '');

    setSelectedWord({
      word: cleanWord,
      position: {
        x: clickRect.left,
        y: clickRect.bottom + 10,
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
            className={`flex flex-col space-y-1 max-w-[85vw] sm:max-w-[75%] ${
                message.isUser ? 'items-end ml-auto' : 'items-start'
            }`}
        >
          <div
            className={`relative group px-3 py-2 rounded-2xl break-words ${
              message.isUser
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-800'
            } ${message.isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
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
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedWord && (
            <WordPopup
                ref={popupRef}
                word={selectedWord.word}
                onClose={() => setSelectedWord(null)}
                theme={theme}
                onTranslate={onTranslate}
                language={language}
                token={token}
            />
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