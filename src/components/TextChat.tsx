import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "../components/MessageBubble";
import { ChatInput } from "../components/ChatInput";
import { MessageSquare } from "lucide-react";
import {cleanHistoryAgent, fetchHistory} from "../api/historyApi.ts"; // Import the new API function
import {
  invokeConversationAgent,
  invokeRetailerAgent,
  invokeStoryTailorAgent
} from "../api/agentsApi.ts";
import { useAppContext } from "../contexts/AppContext.tsx";

interface TextChatProps {
  partnerId: string | undefined;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

const TextChat: React.FC<TextChatProps> = ({ partnerId }: TextChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { preferences } = useAppContext();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {

    const fetchChatHistory = async (agent: any) => {
      // Prevent duplicate calls
      if (messages.length > 0) return;

      setIsProcessing(true);
      try {
        let response = await fetchHistory(
          preferences?.currentLanguageToLearn!,
          agent
        );

        let messages = [];
        for (let obj of response) {
          messages.push({
            id: Date.now().toString(),
            text: obj.message,
            isUser: obj.isUser,
            timestamp: obj.dateTime,
            audioUrl: "",
          });
        }

        setMessages((prevMessages) => {
          // Only add if not already present
          if (prevMessages.length === 0) {
            return [...messages];
          }
          return prevMessages;
        });
      } catch (error) {
        console.error("Error fetching story:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    if (partnerId == "4") {
      fetchChatHistory("retailerAgent");
    } else {
      fetchChatHistory("conversationAgent");
    }
  }, [partnerId, messages.length]);

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsProcessing(true);

    try {
      let response: any;
      if (partnerId === "4") {
        //get-story-feedback
        response = await invokeRetailerAgent(
          messages[0].text,
          text,
          preferences?.currentLanguageToLearn!
        );
      } else {
        response = await invokeConversationAgent(
          text,
          preferences?.currentLanguageToLearn!
        );
      }

      let responseObject = JSON.parse(response.data.body);

      const botMessage: Message = {
        id: Date.now().toString(),
        text: responseObject.Text,
        isUser: false,
        timestamp: new Date(),
        audioUrl: "",
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCleanHistory = async () => {
    try {
      if (partnerId === "4") {
        await cleanHistoryAgent(
            preferences?.currentLanguageToLearn!,
            "retailerAgent"
        );

        setMessages((prevMessages) => {
          prevMessages = [];
          return prevMessages;
        });

        setIsProcessing(true);
        
        const response = await invokeStoryTailorAgent(
            preferences?.currentLanguageToLearn!
        );
        let responseObject = JSON.parse(response.data.body);

        const botMessage: Message = {
          id: Date.now().toString(),
          text: responseObject.Text,
          isUser: false,
          timestamp: new Date(),
          audioUrl: "",
        };

        setMessages((prevMessages) => {
          // Only add if not already present
          if (prevMessages.length === 0) {
            return [botMessage];
          }
          return prevMessages;
        });

        setIsProcessing(false);
      } else {
        await cleanHistoryAgent(
            preferences?.currentLanguageToLearn!,
            "conversationAgent"
        );

        setMessages((prevMessages) => {
          prevMessages = [];
          return prevMessages;
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
    }
  };

  return (
    <>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
        <div className="p-4 pt-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
            />
          ))}
          {isProcessing && (
            <div className="flex justify-left py-2 text-gray-600 dark:text-gray-400">
              <MessageSquare className="w-5 h-5 animate-bounce" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <ChatInput
        onSendMessage={handleSendMessage}
            onCleanHistory={handleCleanHistory}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default TextChat;
