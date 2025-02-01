import { useEffect, useRef, useState } from "react";
import { experimentalSettingsManager } from "../../core/ExperimentalSettingsManager.ts";

const experimentalSettings = experimentalSettingsManager.getSettings();

export const useWebSocket = () => {
    const [webSocketMessage, setMessages] = useState<any>(); // Stores received messages
    const socketRef = useRef<WebSocket | null>(null); // WebSocket instance reference
    const [isWebSocketConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize WebSocket connection
        const socket = new WebSocket(experimentalSettings.WebSocketUrl);
        socketRef.current = socket;

        // Connection opened
        socket.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
        };

        // Handle incoming messages
        socket.onmessage = (event) => {
            if(event.data.includes("error")){
                return;
            }
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
            if (socketRef.current) {
                console.log("Closing WebSocket...");
                socketRef.current.close();
            }
            setIsConnected(false);
        };
    }, []);

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
