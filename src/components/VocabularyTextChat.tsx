import { useState, useEffect, useRef, useCallback } from "react";
import { MessageBubble } from "../components/MessageBubble";
import { ChatInput } from "../components/ChatInput";
import { MessageSquare } from "lucide-react";
import { invokeWordTeacherAgent } from "../api/agentsApi.ts";
import { useAppContext } from "../contexts/AppContext.tsx";
import { v4 as uuidv4 } from "uuid";
import {
  endVocabularySession,
  getSessionWords,
  startVocabularySession,
} from "../api/vocabularyChatSessionApi.ts";
import { LanguageInfo } from "../models/LanguageInfo.ts";
import {
  VocabularyChatResult,
  VocabularyChatSessionStatus,
} from "../models/VocabularyChatResult.ts";
import VocabularyChatSidebarContent from "./VocabularyChatSidebarContent.tsx";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

const VocabularyTextChat: React.FC<{
  setSidebarContent: (content: React.ReactNode) => void;
}> = ({ setSidebarContent }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { preferences } = useAppContext();
  const languageInfo: LanguageInfo = {
    languageCode: preferences?.currentLanguageToLearn!,
  };
  const [learningWords, setLearningWords] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);


  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const initializeChat = async () => {
      if (!preferences?.currentLanguageToLearn) return;

      try {
        await startSession();
        await getIntroductionMessage();
        if (learningWords.length == 0) {
          setLearningWords(await getSessionWords(languageInfo.languageCode));
        }

      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();
    window.addEventListener("beforeclosechat", handleBeforeCloseChat);

    return () => {
      handleBeforeCloseChat();
      window.removeEventListener("beforeclosechat", handleBeforeCloseChat);
    };
  }, [preferences?.currentLanguageToLearn]);

  useEffect(() => {
    if (learningWords.length > 0) {
      setSidebarContent(
        <VocabularyChatSidebarContent
          learningWords={learningWords}
          restartSession={restartSession}
        />
      );
    }
    
  }, [JSON.stringify(learningWords)]);

  useEffect(() => {
    if (isResetting) {
        setIsResetting(false);
        startSession().then(getIntroductionMessage).then(() => {
          if (learningWords.length == 0) {
            getSessionWords(languageInfo.languageCode).then((words) => {
              setLearningWords(words);
            });
          }
        });
    }
  }, [isResetting]);

  const restartSession = async () => {
    setMessages([]);
    setLearningWords([]);
    await handleBeforeCloseChat();
    setIsResetting(true);

    await new Promise((resolve) => setTimeout(resolve, 0)); 
  };

  const startSession = async () => {
    try {
      const words = await startVocabularySession(languageInfo);
      setLearningWords(words);
    } catch (error) {
      console.error("Error starting vocabulary session:", error);
    }
  };

  const handleBeforeCloseChat = async () => {
    try {
      await endVocabularySession(languageInfo.languageCode);
    } catch (error) {
      console.error("Error ending vocabulary session:", error);
    }
  };

  

  const getIntroductionMessage = async () => {
    setIsProcessing(true);

    try {
      const response = await invokeWordTeacherAgent(
        "",
        preferences?.currentLanguageToLearn!
      );
      const responseObject = JSON.parse(response.data.body);
      const chatResult: VocabularyChatResult = JSON.parse(responseObject.Text);

      addMessage({ text: chatResult.response, isUser: false });
    } catch (error) {
      console.error("Error fetching introduction message:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: uuidv4(), timestamp: new Date(), ...message },
    ]);
  };

  const handleSendMessage = async (text: string) => {
    addMessage({ text, isUser: true });

    setIsProcessing(true);
    try {
      const response = await invokeWordTeacherAgent(
        text,
        preferences?.currentLanguageToLearn!
      );
      const responseObject = JSON.parse(response.data.body);
      const chatResult: VocabularyChatResult = JSON.parse(responseObject.Text);

      addMessage({ text: chatResult.response, isUser: false });

      if (
        chatResult.status === VocabularyChatSessionStatus.Evaluation &&
        chatResult.success
      ) {
        await getIntroductionMessage();
      }
    } catch (error) {
      console.error("Error processing chat message:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 pt-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isProcessing && (
          <div className="flex justify-left py-2 text-gray-600 dark:text-gray-400">
            <MessageSquare className="w-5 h-5 animate-bounce" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        onCleanHistory={()=> {}}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default VocabularyTextChat;
