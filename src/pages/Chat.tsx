import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { MessageSquare } from 'lucide-react';
import { withAuth } from '../components/withAuth';
import '../chat.css';
import Header from '../components/Header';
import { SettingsSidebar } from '../components/SettingsSidebar';

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
      if (partnerId === "4") {
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
          const response = await axios.post(
            'https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Agents/storyTailorAgent/invoke',
            {},  // empty body for POST request
            { 
              headers: { 
                'Content-Type': 'application/json', 
                'Authorization': token 
              } 
            }
          );

          let responseObject = JSON.parse(response.data.body);
          const audioBytes = Uint8Array.from(atob(responseObject.Audio), c => c.charCodeAt(0));
          const responseWavBlob = new Blob([audioBytes], { type: 'audio/wav' });
          const responseAudioURL = URL.createObjectURL(responseWavBlob);

          const botMessage: Message = {
            id: Date.now().toString(),
            text: responseObject.Text,
            isUser: false,
            timestamp: new Date(),
            audioUrl: responseAudioURL,
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
      }
    };

    const fetchHi = async () => {
      if (partnerId === "5") {
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
          const response = await axios.post(
              'https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Agents/wordTeacherAgent/text/invoke',
              "hej",
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': token
                }
              }
          );

          let responseObject = JSON.parse(response.data.body);
          const audioBytes = Uint8Array.from(atob(responseObject.Audio), c => c.charCodeAt(0));
          const responseWavBlob = new Blob([audioBytes], { type: 'audio/wav' });
          const responseAudioURL = URL.createObjectURL(responseWavBlob);

          const botMessage: Message = {
            id: Date.now().toString(),
            text: responseObject.Text,
            isUser: false,
            timestamp: new Date(),
            audioUrl: responseAudioURL,
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
      }
    };
   
    fetchStory();
    fetchHi();
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
        response = await axios.post(
            'https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Agents/retailerAgent/promt/text/invoke',
            {
              promt: messages[0].text,
              text: text
            },
            { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
        );
      } else if (partnerId === "5") {
        response = await axios.post(
            'https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Agents/wordTeacherAgent/text/invoke',
            text,
            { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
        );
      }
      else {
        response = await axios.post(
            'https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Agents/conversationAgent/text/invoke',
            text,
            { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
        );
      }
      
      let responseObject = JSON.parse(response.data.body);
      const audioBytes = Uint8Array.from(atob(responseObject.Audio), c => c.charCodeAt(0));
      const responseWavBlob = new Blob([audioBytes], { type: 'audio/wav' });
      const responseAudioURL = URL.createObjectURL(responseWavBlob);

      const botMessage: Message = {
        id: Date.now().toString(),
        text: responseObject.Text,
        isUser: false,
        timestamp: new Date(),
        audioUrl: responseAudioURL,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };


  const onTranslate = useCallback(async (word: string) => {
    if (!token) return;

    const response = await axios.post(
      'https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Agents/translationAgent/text/invoke',
        word,
      { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
    );
    
    let responseObject = JSON.parse(response.data.body);
    return JSON.parse(responseObject.Text);
  }, [token]);

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
        <Header openSidebar={() => setIsSidebarOpen(true)}/>
       
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto"
        >
          
          
          <div className="p-4 pt-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onTranslate={onTranslate}
                token={token}
              />
            ))}
            {isProcessing && (
              <div className='flex justify-center py-2 text-gray-600 dark:text-gray-400'>
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
          className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md"
          onSettingsChange={x => {}}
          style={{ 
            top: 'env(safe-area-inset-top)',
            bottom: 'env(safe-area-inset-bottom)'
          }}
        />
    </div>
  );
}

export default withAuth(Chat); 