import {ExperimentalSettings} from "../models/ExperimentalSettings.ts";

export class ExperimentalSettingsManager {
    private readonly settings: ExperimentalSettings;

    constructor() {
        // const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local';
        
        const useLocalBackend = false;
        const useLocalWebSocket = false;
        const streamSupported = true
        this.settings = {
            WebSocket: {
                isDevelopment: useLocalWebSocket,
                Url: useLocalWebSocket
                    ? 'ws://127.0.0.1:8080'
                    : 'wss://egy8ib44s2.execute-api.us-east-1.amazonaws.com/production'
            },
            Api: {
                isDevelopment: useLocalBackend,
                Url: useLocalBackend
                    ? 'https://localhost:7099/api'
                    : "https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api"
            },
            StreamTranscriptionSupported: streamSupported
        };
    }

    // Getter for settings
    public getSettings(): ExperimentalSettings {
        return <ExperimentalSettings> this.settings;
    }
}

export const experimentalSettingsManager = new ExperimentalSettingsManager();
