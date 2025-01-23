import { useEffect, useRef, useState } from "react";

export const useWebSocket = (url: string | null) => {
    const [webSocketMessage, setMessages] = useState<any>(); // Stores received messages
    const socketRef = useRef<WebSocket | null>(null); // WebSocket instance reference
    const [isWebSocketConnected, setIsConnected] = useState(false);

    useEffect(() => {

        if (!url) {
            return; // Do not initiate connection if no URL is provided
        }

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
            setMessages(() => event.data); // Append message to state
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
    const sendWebSocketMessage = (message: any) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(message);
        } else {
            console.error("WebSocket is not connected.");
        }
    };

    return { webSocketMessage, sendWebSocketMessage, isWebSocketConnected };
};
