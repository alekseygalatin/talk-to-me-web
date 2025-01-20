import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { MessageSquare } from 'lucide-react';
import { withAuth } from '../components/withAuth';
import '../chat.css';
import { SettingsSidebar } from '../components/SettingsSidebar';
import {
  invokeConversationAgent,
  invokeRetailerAgent,
  invokeStoryTailorAgent,
  invokeWordTeacherAgent
} from "../api/agentsApi.ts";
import {useAppContext} from "../contexts/AppContext.tsx";
import ChatHeader from '../components/ChatHeader';
import { fetchAudioForMessage } from '../api/audioApi';
import { fetchHistory } from "../api/historyApi.ts"; // Import the new API function

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

function Chat() {
  const { partnerId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('idToken'); // Assume token is already stored
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { preferences } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollToBottom = () => {
    if (messagesEndRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  useEffect(() => {
    const fetchStory = async () => {
      // Check for token first
      const token = localStorage.getItem('idToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Prevent duplicate calls
      if (messages.length > 0) return;
      
      setIsProcessing(true);
      try {
        const response = await invokeStoryTailorAgent(preferences?.currentLanguageToLearn!)
        let responseObject = JSON.parse(response.data.body);
        
        const botMessage: Message = {
          id: Date.now().toString(),
          text: responseObject.Text,
          isUser: false,
          timestamp: new Date(),
          audioUrl: "",
        };

        setMessages(prevMessages => {
          // Only add if not already present
          if (prevMessages.length === 0) {
            return [botMessage];
          }
          return prevMessages;
        });
      } catch (error) {
        console.error('Error fetching story:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    const fetchInitialMessageForEmma = async () => {
      // Check for token first
      const token = localStorage.getItem('idToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Prevent duplicate calls
      if (messages.length > 0) return;

      setIsProcessing(true);
      try {
        const response = await invokeWordTeacherAgent('', preferences?.currentLanguageToLearn!)
        let responseObject = JSON.parse(response.data.body);

        const botMessage: Message = {
          id: Date.now().toString(),
          text: responseObject.Text,
          isUser: false,
          timestamp: new Date(),
          audioUrl: "",
        };

        setMessages(prevMessages => {
          return [...prevMessages, botMessage];
        });
      } catch (error) {
        console.error('Error fetching story:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    const fetchChatHistory = async (agent) => {
      // Check for token first
      const token = localStorage.getItem('idToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Prevent duplicate calls
      if (messages.length > 0) return;

      setIsProcessing(true);
      try {
        let response = await fetchHistory(preferences?.currentLanguageToLearn!, agent);
        
        let messages = [];
        for (let obj of response) {
          messages.push({
            id: Date.now().toString(),
            text: obj.message,
            isUser: obj.isUser,
            timestamp: obj.dateTime,
            audioUrl: "",
          })
        }

        setMessages(prevMessages => {
          // Only add if not already present
          if (prevMessages.length === 0) {
            return [...messages];
          }
          return prevMessages;
        });
      } catch (error) {
        console.error('Error fetching story:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    const fetchData = async () => {
      // Check for token first
      const token = localStorage.getItem('idToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Prevent duplicate calls
      if (messages.length > 0) return;

      setIsProcessing(true);
      try {
        //await fetchChatHistory('wordTeacherAgent'); // Wait for this to complete
        await fetchInitialMessageForEmma(); // Then call this
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    if (partnerId == "4") {
      fetchStory();
    } else if (partnerId == "5") {
      fetchData(); // Call the new async function
    } else {
      //fetchChatHistory('conversationAgent');
    }
  }, [partnerId, messages.length]);

  const handleSendMessage = async (text: string) => {
    if (!token) return;

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
      if (partnerId === "4") { //get-story-feedback
        response = await invokeRetailerAgent(messages[0].text, text, preferences?.currentLanguageToLearn!)
      } else if (partnerId === "5") {
        response = await invokeWordTeacherAgent(text, preferences?.currentLanguageToLearn!)
      }
      else {
        response = await invokeConversationAgent(text, preferences?.currentLanguageToLearn!)
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
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAudio = async (message: string) : Promise<string> => {
    try {
      const response = await fetchAudioForMessage(preferences?.currentLanguageToLearn!, message);
      const audioBytes = Uint8Array.from(atob(response), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log(audioUrl)
      return audioUrl;
    } catch (error) {
      console.error('Error fetching audio:', error);
      return "";
    }
  };

  return (
    <div 
      className='flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900'
      style={{ 
        height: '100dvh',
      }}
    >
      <div 
        className="flex flex-col h-full w-full max-w-3xl mx-auto relative"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <ChatHeader openSidebar={() => setIsSidebarOpen(true)}/>
       
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto"
        >
          
          
          <div className="p-4 pt-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                token={token}
                onPlayAudio={text => handlePlayAudio(text)}
              />
            ))}
            {isProcessing && (
              <div className='flex justify-left py-2 text-gray-600 dark:text-gray-400'>
                <MessageSquare className="w-5 h-5 animate-bounce" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div 
          className='border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
          style={{
            paddingBottom: `calc(env(safe-area-inset-bottom) + 0.75rem)`,
          }}
        >
          <div className="px-3 sm:px-4 py-3">
            <ChatInput
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
      <SettingsSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
    </div>
  );
}

export default withAuth(Chat); 