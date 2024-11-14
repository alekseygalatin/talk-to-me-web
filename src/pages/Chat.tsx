import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { SettingsSidebar } from '../components/SettingsSidebar';
import { ArrowLeft, Settings, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

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

export function Chat() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem('idToken'); // Assume token is already stored
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    language: 'sv-SE',
    volume: 80,
    microphoneSensitivity: 100,
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
      const response = await axios.post(
        'https://2inmmpsyon2mm664xfotrr66cy0sajtd.lambda-url.us-east-1.on.aws/process-text',
        { text: text, sessionId: "1234" },
        { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
      );

      const audioBytes = Uint8Array.from(atob(response.data.Audio), c => c.charCodeAt(0));
      const responseWavBlob = new Blob([audioBytes], { type: 'audio/wav' });
      const responseAudioURL = URL.createObjectURL(responseWavBlob);

      const botMessage: Message = {
        id: Date.now().toString(),
        text: response.data.Text,
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
      'https://vv5jzb5zpnyvrmzbfhgt3k2q5q0sbmes.lambda-url.us-east-1.on.aws/process-text',
      { text: word, sessionId: "1234" },
      { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
    );

    return JSON.parse(response.data.Json);
  }, [token]);

  return (
    <div className={`h-screen flex flex-col ${settings.theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <header className={`flex items-center justify-between p-4 ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/select-partner')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className={`font-semibold ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Talk And Learn</h1>
              <p className={`text-sm ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Language Teacher</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`p-2 rounded-lg transition-colors ${settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        {/* Chat Container */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 overscroll-bounce" style={{ WebkitOverflowScrolling: 'touch' }}>
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className={`text-xl font-semibold ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Start Your Conversation</h3>
              <p className={`text-gray-500 dark:text-gray-400 max-w-sm`}>Begin chatting with your language partner. Ask questions, practice phrases, or start a casual conversation!</p>
            </motion.div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                theme={settings.theme}
                onTranslate={onTranslate}
                language={settings.language}
                token={token}
              />
            ))
          )}
        </div>

        {/* Chat Input */}
        <div className={`p-4 ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-t dark:border-gray-700`}>
          <ChatInput
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            theme={settings.theme}
            language={settings.language}
          />
        </div>

        {/* Settings Sidebar */}
        <SettingsSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  );
} 