import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { Sidebar } from './components/Sidebar';
import { MessageSquare, Settings } from 'lucide-react';
import type { Message, ChatState } from './types';
import { jwtDecode } from 'jwt-decode';

const clientId = '7o8tqlt2ucihqsbtthfopc9d4p';
const redirectUri = 'https://d3u8od6g4wwl6c.cloudfront.net'; // Replace with your S3 URL
const tokenUrl = 'https://talk-to-me.auth.us-east-1.amazoncognito.com/oauth2/token';

interface JwtPayload {
  exp: number;
}

function App() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isProcessing: false,
  });

  const [settings, setSettings] = useState({
    volume: 80,
    language: 'sv-SE',
    theme: 'light' as const,
    microphoneSensitivity: 100,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('idToken');
    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      setLoading(false);
    } else {
      handleCallback();
    }
  }, []);

  const redirectToLogin = () => {
    const loginUrl = `https://talk-to-me.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = loginUrl;
  };

  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          redirect_uri: redirectUri,
          code: code,
        }),
      });

      if (response.ok) {
        const tokens = await response.json();
        const idToken = tokens.id_token;
        localStorage.setItem('idToken', idToken);
        setToken(idToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.error('Token exchange failed:', await response.text());
        redirectToLogin();
      }
    } else {
      redirectToLogin();
    }
    setLoading(false);
  };

  const isTokenExpired = (token: string) => {
    const decoded: JwtPayload = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const storedToken = localStorage.getItem('idToken');
      if (storedToken && isTokenExpired(storedToken)) {
        redirectToLogin();
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const handleSendMessage = async (text: string) => {
    if (!token) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isProcessing: true,
    }));

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

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isProcessing: false,
      }));
    } catch (error) {
      console.error('Error:', error);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleSettingsChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const onTranslate = useCallback(async (word: string, token: string) => {
    console.log(token)
    const response = await axios.post(
        'https://vv5jzb5zpnyvrmzbfhgt3k2q5q0sbmes.lambda-url.us-east-1.on.aws/process-text',
        { text: word, sessionId: "1234" },
        { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
    );
    
    console.log(response.data)
    return JSON.parse(response.data.Json);
  }, []);

  return (
      <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
        {loading ? (
            <p>Loading...</p>
        ) : token ? (
          <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col">
            <header className={`flex items-center justify-between p-4 ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm mb-4`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h1 className={`text-xl font-semibold ${settings.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Talk To Me
                </h1>
              </div>
              <button
                  onClick={() => setIsSidebarOpen(true)}
                  className={`p-2 rounded-lg transition-colors ${
                      settings.theme === 'dark'
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-600'
                  }`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </header>
  
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
              {state.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <p>Start a conversation by typing or using voice input!</p>
                  </div>
              ) : (
                  state.messages.map((message) => (
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
  
            <div className={`p-4 ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm mt-4`}>
              <ChatInput
                  onSendMessage={handleSendMessage}
                  isProcessing={state.isProcessing}
                  theme={settings.theme}
                  language={settings.language}
              />
            </div>
          </div>
        ) : (
            <p>Please log in to access the Voice Chat Assistant.</p>
        )}
        <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            settings={settings}
            onSettingsChange={handleSettingsChange}
        />
      </div>
  );
}

export default App;