import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  theme: 'light' | 'dark';
}

export function MessageBubble({ message, theme }: MessageBubbleProps) {
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

  const isDark = theme === 'dark';

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.isUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : isDark
                        ? 'bg-gray-700 text-gray-100 rounded-bl-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}
        >
          <p className="text-sm">{message.text}</p>
          {message.audioUrl && (
              <div className="mt-2 flex items-center gap-2">
                <button
                    onClick={toggleAudio}
                    className="p-2 rounded-full hover:bg-black/10 transition-colors"
                >
                  {isPlaying ? (
                      <Pause className="w-4 h-4" />
                  ) : (
                      <Play className="w-4 h-4" />
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
                      style={{ width: `${progress}%` }}
                      transition={{ type: "tween" }}
                  />
                </div>
              </div>
          )}
          <span className="text-xs opacity-60 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
        </div>
      </motion.div>
  );
}