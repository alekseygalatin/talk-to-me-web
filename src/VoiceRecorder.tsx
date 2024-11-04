
import React, { useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
    token: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ token }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [textMessage, setTextMessage] = useState('');
    const [isTextSending, setIsTextSending] = useState(false);
    const [chatHistory, setChatHistory] = useState<{ sender: string, message: string }[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    if (!browserSupportsSpeechRecognition) {
        return <p>Your browser does not support speech recognition.</p>;
    }

    const startRecording = () => {
        setIsRecording(true);
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true, language: 'sv-SE' });
    };

    const stopRecording = () => {
        setIsRecording(false);
        SpeechRecognition.stopListening();
        setTextMessage(transcript);
    };

    const addMessageToChat = (sender: string, message: string) => {
        setChatHistory(prev => [...prev, { sender, message }]);
    };

    const sendTextToAPI = async () => {
        if (!textMessage) return;

        addMessageToChat('user', textMessage);
        setIsTextSending(true);
        setTextMessage('');

        try {
            const response = await axios.post(
                'https://2inmmpsyon2mm664xfotrr66cy0sajtd.lambda-url.us-east-1.on.aws/process-text',
                { text: textMessage, sessionId: "1234" },
                { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
            );
            
            const audioBytes = Uint8Array.from(atob(response.data.Audio), c => c.charCodeAt(0));
            const responseWavBlob = new Blob([audioBytes], { type: 'audio/wav' });
            const responseAudioURL = URL.createObjectURL(responseWavBlob);
            console.log(responseAudioURL)
            
            if (audioRef.current) {
                audioRef.current.src = responseAudioURL;
                audioRef.current.load(); // Preload the audio
                audioRef.current.play();
            }

            addMessageToChat('bot', response.data.Text);
        } catch (error) {
            console.error('Error sending text or receiving audio:', error);
        } finally {
            setIsTextSending(false);
        }
    };

    return (
        <div className="chat-container">
            <h1 className="title">Chat with VoiceBot</h1>

            <div className="chat-box">
                {chatHistory.map((chat, index) => (
                    <div key={index} className={`chat-bubble ${chat.sender}`}>
                        {chat.message}
                    </div>
                ))}
                {isRecording && <div className="chat-bubble user">🔴 Listening...</div>}
            </div>

            <div className="controls">
                <button className="record-btn" onClick={startRecording} disabled={isRecording}>
                    🎙️ Start Recording
                </button>
                <button className="stop-btn" onClick={stopRecording} disabled={!isRecording}>
                    ⏹️ Stop Recording
                </button>
            </div>

            <div className="message-input">
                <textarea
                    placeholder="Type a message..."
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    rows={2}
                />
                <button onClick={sendTextToAPI} disabled={!textMessage || isTextSending}>
                    {isTextSending ? 'Sending...' : 'Send'}
                </button>
            </div>

            <audio ref={audioRef} hidden />
        </div>
    );
};

export default VoiceRecorder;




