import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Copy, Volume2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import React, { forwardRef } from 'react';
import { HelpCircle } from 'lucide-react';
import axios from 'axios';
import { FaQuestionCircle } from 'react-icons/fa';
import QuestionPopup from './QuestionPopup'; // Adjust the path as necessary

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
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [isQuestionPopupVisible, setIsQuestionPopupVisible] = useState(false);
  const [apiResponse, setApiResponse] = useState<{
    suggestedAnswer: string;
    explanation: string;
    alternativeResponses: string[];
    note: string;
  } | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

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

  const handleQuestionClick = async () => {
    try {
      setIsLoadingQuestion(true);
      setIsQuestionPopupVisible(true);

      let response = await axios.post(
          'https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Transcribe/get-question-help',
          message.text,
          { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
      );

      let responseObject = JSON.parse(response.data.body);
      const data = JSON.parse(responseObject.Text);

      setApiResponse(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const clickRect = event.currentTarget.getBoundingClientRect();
    
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
            {!message.isUser && (
              <button
                onClick={handleQuestionClick}
                className="absolute bottom-2 right-2 p-2 rounded-full hover:bg-black/10 transition-colors"
                aria-label="Ask question"
              >
                {isLoadingQuestion ? (
                  <div className="animate-spin h-5 w-5">
                    <svg
                      className="h-full w-full text-gray-600 dark:text-gray-300"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <FaQuestionCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            )}
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
        {isPopupVisible && (
          <WordPopup
            ref={popupRef}
            word={popupContent.word}
            onClose={() => setIsPopupVisible(false)}
            theme={theme}
            onTranslate={onTranslate}
            language={language}
            token={token}
          />
        )}
      </AnimatePresence>

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

      {isQuestionPopupVisible && (
        <QuestionPopup
          suggestedAnswer={apiResponse?.suggestedAnswer}
          explanation={apiResponse?.explanation}
          alternativeResponses={apiResponse?.alternativeResponses}
          note={apiResponse?.note}
          onClose={() => {
            setIsQuestionPopupVisible(false);
            setApiResponse(null);
          }}
          isDark={theme === 'dark'}
          isLoading={isLoadingQuestion}
        />
      )}
    </div>
  );
}