import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { SettingsSidebar } from '../components/SettingsSidebar';
import { ArrowLeft, Settings, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { withAuth } from '../components/withAuth';
import '../chat.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

interface Settings {
  theme: 'light' | 'dark';
  language: string;
  volume: number;
  microphoneSensitivity: number;
}

function Chat() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem('idToken'); // Assume token is already stored
  const [settings, setSettings] = useState<Settings>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' ?? 'dark'; // Default to dark theme
    return {
      theme: savedTheme,
      language: 'sv-SE',
      volume: 80,
      microphoneSensitivity: 100,
    };
  });

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    localStorage.setItem('theme', settings.theme);
  }, [settings.theme]);

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
            'https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Transcribe/get-story',
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
   
    fetchStory();
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
            'https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Transcribe/get-story-feedback',
            {
              originText: messages[0].text,
              retailText: text
            },
            { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
        );
      }else {
        response = await axios.post(
            'https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Transcribe/process-text',
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

  const handleSettingsChange = (key: keyof Settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const onTranslate = useCallback(async (word: string) => {
    if (!token) return;

    const response = await axios.post(
      'https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Transcribe/translate-word',
        word,
      { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
    );
    
    let responseObject = JSON.parse(response.data.body);
    return JSON.parse(responseObject.Text);
  }, [token]);

  return (
    <div 
      className={`flex flex-col ${settings.theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}
      style={{ 
        minHeight: '100vh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex flex-col h-full w-full max-w-3xl mx-auto relative">
        <header 
          className={`fixed top-0 left-0 right-0 flex items-center justify-between p-3 sm:p-4 ${
            settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-md z-20`}
          style={{
            marginTop: 'env(safe-area-inset-top)',
            maxWidth: '48rem',
            margin: '0 auto'
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/select-partner')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className={`text-lg sm:text-xl font-semibold ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Talk And Learn</h1>
              <p className={`text-xs sm:text-sm ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Language Teacher</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        <div className="h-[72px] sm:h-[80px]" />

        <div style={styles.chatWrapper}>
          <div style={styles.chatContainer}>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                theme={settings.theme}
                onTranslate={onTranslate}
                language={settings.language}
                token={token}
              />
            ))}
            {isProcessing && (
              <div className={`flex justify-center py-2 ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <MessageSquare className="w-5 h-5 animate-bounce" />
              </div>
            )}
            <div ref={messagesEndRef} style={styles.bottomSpacer} />
          </div>
        </div>

        <div 
          className={`fixed bottom-0 left-0 right-0 border-t ${
            settings.theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          } z-20`}
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            maxWidth: '48rem',
            margin: '0 auto'
          }}
        >
          <div className="px-3 sm:px-4 py-3">
            <ChatInput
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
              theme={settings.theme}
              language={settings.language}
            />
          </div>
        </div>

        <SettingsSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          theme={settings.theme}
          className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md"
          style={{ 
            top: 'env(safe-area-inset-top)',
            bottom: 'env(safe-area-inset-bottom)'
          }}
        />
      </div>
    </div>
  );
}

const styles = {
  chatWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh', // Full viewport height
  },
  chatContainer: {
    flex: 1, // Allows the chat container to grow and shrink
    overflowY: 'auto',
    padding: '10px', // Optional: for spacing
  },
  bottomSpacer: {
    height: '80px', // Increased height for more spacing
  },
};

export default withAuth(Chat); 