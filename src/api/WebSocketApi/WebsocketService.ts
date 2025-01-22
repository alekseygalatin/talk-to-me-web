import { useEffect, useRef, useState } from "react";

export const useWebSocket = (url: string) => {
    const [messages, setMessages] = useState<any[]>([]); // Stores received messages
    const socketRef = useRef<WebSocket | null>(null); // WebSocket instance reference
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize WebSocket connection
        const socket = new WebSocket(url);
        socketRef.current = socket;

        // Connection opened
        socket.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
        };

        // Handle incoming messages
        socket.onmessage = (event) => {
            console.log("Message from server:", event.data);
            setMessages((prev) => [...prev, event.data]); // Append message to state
        };

        // Handle connection close
        socket.onclose = () => {
            console.log("WebSocket connection closed");
            setIsConnected(false);
        };

        // Handle errors
        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        // Cleanup on unmount
        return () => {
            socket.close();
            setIsConnected(false);
        };
    }, [url]);

    // Function to send a message
    const sendMessage = (message: any) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(message);
        } else {
            console.error("WebSocket is not connected.");
        }
    };

    return { messages, sendMessage, isConnected };
};
