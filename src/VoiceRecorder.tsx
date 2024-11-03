// import React, { useState, useRef } from 'react';
// import axios from 'axios';
// import './VoiceRecorder.css';
//
// const VoiceRecorder: React.FC = () => {
//     const [isRecording, setIsRecording] = useState(false);
//     const [audioURL, setAudioURL] = useState<string | null>(null);
//     const [responseAudioURL, setResponseAudioURL] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [textMessage, setTextMessage] = useState('');
//     const [isTextSending, setIsTextSending] = useState(false);
//
//     const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//     const audioChunksRef = useRef<Blob[]>([]);
//
//     // Start recording audio
//     const startRecording = async () => {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         const mediaRecorder = new MediaRecorder(stream);
//
//         mediaRecorderRef.current = mediaRecorder;
//         audioChunksRef.current = [];
//
//         mediaRecorder.ondataavailable = (event) => {
//             if (event.data.size > 0) {
//                 audioChunksRef.current.push(event.data);
//             }
//         };
//
//         mediaRecorder.onstop = async () => {
//             const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//             const wavBlob = await convertToWav(audioBlob);
//             setAudioURL(URL.createObjectURL(wavBlob));
//         };
//
//         mediaRecorder.start();
//         setIsRecording(true);
//     };
//
//     // Stop recording audio
//     const stopRecording = () => {
//         mediaRecorderRef.current?.stop();
//         setIsRecording(false);
//     };
//
//     // Convert audio to WAV format
//     const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
//         const audioContext = new AudioContext();
//         const arrayBuffer = await audioBlob.arrayBuffer();
//         const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
//
//         const offlineContext = new OfflineAudioContext(
//             1,
//             audioBuffer.duration * 16000,
//             16000  // Set a lower sample rate (16 kHz)
//         );
//
//         const source = offlineContext.createBufferSource();
//         source.buffer = audioBuffer;
//         source.connect(offlineContext.destination);
//         source.start();
//
//         const renderedBuffer = await offlineContext.startRendering();
//         return createWavBlob(renderedBuffer);
//     };
//
//     // Create a WAV Blob from AudioBuffer
//     const createWavBlob = (audioBuffer: AudioBuffer): Blob => {
//         const numOfChannels = audioBuffer.numberOfChannels;
//         const length = audioBuffer.length * numOfChannels * 2 + 44;
//         const buffer = new ArrayBuffer(length);
//         const view = new DataView(buffer);
//
//         const writeString = (view: DataView, offset: number, string: string) => {
//             for (let i = 0; i < string.length; i++) {
//                 view.setUint8(offset + i, string.charCodeAt(i));
//             }
//         };
//
//         // Write WAV file header
//         writeString(view, 0, 'RIFF');
//         view.setUint32(4, 36 + audioBuffer.length * numOfChannels * 2, true);
//         writeString(view, 8, 'WAVE');
//         writeString(view, 12, 'fmt ');
//         view.setUint32(16, 16, true);
//         view.setUint16(20, 1, true);
//         view.setUint16(22, numOfChannels, true);
//         view.setUint32(24, 16000, true);  // Sample rate (16 kHz)
//         view.setUint32(28, 16000 * numOfChannels * 2, true);
//         view.setUint16(32, numOfChannels * 2, true);
//         view.setUint16(34, 16, true);  // Bits per sample
//         writeString(view, 36, 'data');
//         view.setUint32(40, audioBuffer.length * numOfChannels * 2, true);
//
//         // Write PCM samples
//         const channelData = audioBuffer.getChannelData(0);
//         let offset = 44;
//         for (let i = 0; i < channelData.length; i++) {
//             const sample = Math.max(-1, Math.min(1, channelData[i]));
//             view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
//             offset += 2;
//         }
//
//         return new Blob([buffer], { type: 'audio/wav' });
//     };
//
//     // Send WAV audio to the API
//     const sendAudioToAPI = async () => {
//         if (!audioURL) return;
//
//         setIsLoading(true);
//
//         try {
//             const wavBlob = await convertToWav(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
//
//             var base64 = btoa(
//                 new Uint8Array(await wavBlob.arrayBuffer())
//                     .reduce((data, byte) => data + String.fromCharCode(byte), '')
//             );
//
//             const response = await axios.post(
//                 'https://x53khwziw6a6qdz35st7slvdwm0urnjt.lambda-url.us-east-1.on.aws/process-audio',
//                 { audio: base64, sessionId: "1234" },
//                 {
//                     headers: { 'Content-Type': 'application/json' },
//                     responseType: 'blob'
//                 }
//             );
//
//             const responseWavBlob = new Blob([response.data], { type: 'audio/wav' });
//             setResponseAudioURL(URL.createObjectURL(responseWavBlob));
//         } catch (error) {
//             console.error('Error uploading or receiving audio:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     // Send text message to the API
//     const sendTextToAPI = async () => {
//         if (!textMessage) return;
//
//         setIsTextSending(true);
//
//         try {
//             const response = await axios.post(
//                 'https://2inmmpsyon2mm664xfotrr66cy0sajtd.lambda-url.us-east-1.on.aws/process-text',
//                 {
//                     text: textMessage,
//                     sessionId: "1234"
//                 },
//                 {
//                     headers: { 'Content-Type': 'application/json' },
//                     responseType: 'blob',
//                 }
//             );
//            
//             console.log(JSON.stringify(response))
//             const responseWavBlob = new Blob([response.data], { type: 'audio/wav' });
//             setResponseAudioURL(URL.createObjectURL(responseWavBlob));
//         } catch (error) {
//             console.error('Error sending text or receiving audio:', error);
//         } finally {
//             setIsTextSending(false);
//         }
//     };
//
//     return (
//         <div className="voice-recorder-container">
//             <h1 className="title">Voice Recorder & Text to Audio</h1>
//
//             <div className="buttons-container">
//                 <button className="record-btn" onClick={startRecording} disabled={isRecording}>
//                     🎙️ Start Recording
//                 </button>
//                 <button className="stop-btn" onClick={stopRecording} disabled={!isRecording}>
//                     ⏹️ Stop Recording
//                 </button>
//                 {isRecording && <div className="recording-indicator">🔴 Recording...</div>}
//             </div>
//
//             {audioURL && (
//                 <div className="audio-player">
//                     <h2>Recorded Audio</h2>
//                     <audio controls src={audioURL} />
//                 </div>
//             )}
//
//             <button className="send-btn" onClick={sendAudioToAPI} disabled={!audioURL || isLoading}>
//                 {isLoading ? 'Uploading Audio...' : 'Send Audio to API'}
//             </button>
//
//             <div className="text-message-section">
//                 <h2>Or Send a Text Message</h2>
//                 <textarea
//                     className="text-input"
//                     placeholder="Enter your message..."
//                     value={textMessage}
//                     onChange={(e) => setTextMessage(e.target.value)}
//                     rows={3}
//                 />
//                 <button className="send-text-btn" onClick={sendTextToAPI} disabled={!textMessage || isTextSending}>
//                     {isTextSending ? 'Sending...' : 'Send Text to API'}
//                 </button>
//             </div>
//
//             {responseAudioURL && (
//                 <div className="response-audio">
//                     <h2>Response Audio</h2>
//                     <audio controls src={responseAudioURL} />
//                     <a href={responseAudioURL} download="response.wav" className="download-link">Download Response WAV</a>
//                 </div>
//             )}
//         </div>
//     );
// };
//
// export default VoiceRecorder;

// import React, { useState, useRef } from 'react';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import axios from 'axios';
// import './VoiceRecorder.css';
//
// const VoiceRecorder: React.FC = () => {
//     const [isRecording, setIsRecording] = useState(false);
//     const [textMessage, setTextMessage] = useState('');
//     const [isTextSending, setIsTextSending] = useState(false);
//     const audioRef = useRef<HTMLAudioElement | null>(null);
//
//     const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
//
//     if (!browserSupportsSpeechRecognition) {
//         return <p>Your browser does not support speech recognition.</p>;
//     }
//
//     const startRecording = () => {
//         setIsRecording(true);
//         resetTranscript();
//         SpeechRecognition.startListening({ continuous: true });
//     };
//
//     const stopRecording = () => {
//         setIsRecording(false);
//         SpeechRecognition.stopListening();
//         setTextMessage(transcript);
//     };
//
//     const sendTextToAPI = async () => {
//         if (!textMessage) return;
//
//         setIsTextSending(true);
//
//         try {
//             const response = await axios.post(
//                 'https://2inmmpsyon2mm664xfotrr66cy0sajtd.lambda-url.us-east-1.on.aws/process-text',
//                 { text: textMessage, sessionId: "1234" },
//                 { headers: { 'Content-Type': 'application/json' }, responseType: 'blob' }
//             );
//
//             const responseWavBlob = new Blob([response.data], { type: 'audio/wav' });
//             const responseAudioURL = URL.createObjectURL(responseWavBlob);
//
//             // Play the audio response automatically
//             if (audioRef.current) {
//                 audioRef.current.src = responseAudioURL;
//                 audioRef.current.play();
//             }
//         } catch (error) {
//             console.error('Error sending text or receiving audio:', error);
//         } finally {
//             setIsTextSending(false);
//         }
//     };
//
//     return (
//         <div className="voice-recorder-container">
//             <h1 className="title">Talk to Me</h1>
//
//             <div className="buttons-container">
//                 <button className="record-btn" onClick={startRecording} disabled={isRecording}>
//                     🎙️ Start Recording
//                 </button>
//                 <button className="stop-btn" onClick={stopRecording} disabled={!isRecording}>
//                     ⏹️ Stop Recording
//                 </button>
//                 {isRecording && <div className="recording-indicator">🔴 Recording...</div>}
//             </div>
//             <div className="text-message-section">
//                 <textarea
//                     className="text-input"
//                     placeholder="Enter your message..."
//                     value={textMessage}
//                     onChange={(e) => setTextMessage(e.target.value)}
//                     rows={3}
//                 />
//                 <button className="send-text-btn" onClick={sendTextToAPI} disabled={!textMessage || isTextSending}>
//                     {isTextSending ? 'Sending...' : 'Send Text to API'}
//                 </button>
//             </div>
//
//             {/* Hidden audio element to play the response audio */}
//             <audio ref={audioRef} hidden />
//         </div>
//     );
// };
//
// export default VoiceRecorder;

import React, { useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import './VoiceRecorder.css';

const VoiceRecorder: React.FC = () => {
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
                { headers: { 'Content-Type': 'application/json' }, responseType: 'blob' }
            );

            const responseWavBlob = new Blob([response.data], { type: 'audio/wav' });
            const responseAudioURL = URL.createObjectURL(responseWavBlob);

            addMessageToChat('bot', "Audio response received.");
            if (audioRef.current) {
                audioRef.current.src = responseAudioURL;
                audioRef.current.play();
            }
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




