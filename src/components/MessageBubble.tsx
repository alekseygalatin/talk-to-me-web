import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Message } from "../types";
import React from "react";
import { FaQuestionCircle } from "react-icons/fa";
import QuestionPopup from "./QuestionPopup"; // Adjust the path as necessary
import { useAppContext } from "../contexts/AppContext";
import { invokeConversationHelperAgent } from "../api/agentsApi.ts";
import WordPopup from "./WordPopup.tsx";
import { fetchAudioForMessage } from "../api/audioApi";
import ReactMarkdown from "react-markdown";
import { useChatSettings } from "../contexts/ChatSettingsContext";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const { chatSettings } = useChatSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isQuestionPopupVisible, setIsQuestionPopupVisible] = useState(false);
  const [apiResponse, setApiResponse] = useState<{
    suggestedAnswer: string;
    explanation: string;
    alternativeResponses: string[];
    note: string;
  } | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const { preferences } = useAppContext();
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const toggleAudio = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setIsAudioLoading(true); // Start loading
        try {
          var url = await handlePlayAudio(message.text);
          audioRef.current = new Audio(url);
          audioRef.current.volume = chatSettings.volume / 100;
          audioRef.current.addEventListener("canplaythrough", () => {
            audioRef.current?.play().catch((error) => {
              console.error("Error playing audio:", error);
            });
          });

          audioRef.current.addEventListener("error", (e) => {
            console.error("Audio error:", e);
          });

          audioRef.current.play().catch((error) => {
            console.error("Error playing audio directly:", error);
          });
        } catch (error) {
          console.error("Error fetching audio URL:", error);
        } finally {
          setIsAudioLoading(false); // End loading
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePlayAudio = async (message: string): Promise<string> => {
    try {
      const response = await fetchAudioForMessage(
        preferences?.currentLanguageToLearn!,
        message
      );
      const audioBytes = Uint8Array.from(atob(response), (c) =>
        c.charCodeAt(0)
      );
      const audioBlob = new Blob([audioBytes], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log(audioUrl);
      return audioUrl;
    } catch (error) {
      console.error("Error fetching audio:", error);
      return "";
    }
  };

  useEffect(() => {
    if (audioRef && audioRef.current) {
      audioRef.current.volume = chatSettings.volume / 100;
    }
  }, [chatSettings.volume]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const updateProgress = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
      });

      return () => {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("ended", () => {
          setIsPlaying(false);
          setProgress(0);
        });
      };
    }
  }, [audioRef.current]);

  const handleQuestionClick = async () => {
    try {
      setIsLoadingQuestion(true);
      setIsQuestionPopupVisible(true);

      let response = await invokeConversationHelperAgent(
        message.text,
        preferences?.currentLanguageToLearn!
      );
      let responseObject = JSON.parse(response.data.body);
      const data = JSON.parse(responseObject.Text);

      setApiResponse(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const cleanWord = word.replace(/[.,!?;:'"()\[\]{}]/g, "").toLowerCase();

    if (selectedWord !== cleanWord) {
      setSelectedWord(cleanWord);
    } else {
      setSelectedWord(null); // Close if the same word is clicked
      setTimeout(() => setSelectedWord(cleanWord), 100);
    }
  };

  const renderWords = (text: string) => {
    return text.split(" ").map((word, index, array) => (
      <span key={index}>
        <span
          onClick={(e) => handleWordClick(word, e)}
          className="cursor-pointer hover:bg-opacity-20 rounded px-0.5 py-0.5 transition-colors duration-200 hover:bg-gray-600 dark:hover:bg-gray-400"
        >
          <ReactMarkdown
            components={{ p: ({ node, ...props }) => <>{props.children}</> }}
          >
            {word}
          </ReactMarkdown>
        </span>
        {index < array.length - 1 ? " " : ""}
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
        className={`flex ${
          message.isUser ? "justify-end" : "justify-start"
        } mb-4`}
        onClick={() => setSelectedWord(null)}
      >
        <div
          className={`flex flex-col space-y-1 max-w-[85vw] sm:max-w-[75%] ${
            message.isUser ? "items-end ml-auto" : "items-start"
          }`}
        >
          <div
            className={`relative group px-3 py-2 rounded-2xl break-words ${
              message.isUser
                ? "bg-blue-500 text-white dark:bg-blue-600 dark:text-white"
                : "bg-white text-gray-800 dark:bg-gray-700 dark:text-white"
            } ${message.isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
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
            {!message.isUser && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={toggleAudio}
                  className="p-2 rounded-full hover:bg-black/10 transition-colors"
                >
                  {isAudioLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-gray-600 rounded-full"></div>
                  ) : isPlaying ? (
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
        </div>
      </motion.div>

      {selectedWord && (
        <WordPopup
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          setSelectedWord={setSelectedWord}
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
          isLoading={isLoadingQuestion}
        />
      )}
    </div>
  );
}
