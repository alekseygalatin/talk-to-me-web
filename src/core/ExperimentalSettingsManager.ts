import {ExperimentalSettings} from "../models/ExperimentalSettings.ts";

export class ExperimentalSettingsManager {
    private readonly settings: ExperimentalSettings;

    constructor() {
        /*const isDevelopment = true;
        const useLocalBackend = true;*/

        const useLocalBackend = process.env.BACKEND_RUN_STRATEGY === 'local';
        const isDevelopment = process.env.ENV === 'DEV' || process.env.ENV === 'local';

        const useLocalWebSocket = true;
        const streamSupported = true
        this.settings = {
            WebSocket: {
                isDevelopment: useLocalWebSocket,
                Url: useLocalWebSocket
                    ? 'ws://127.0.0.1:8080'
                    : 'wss://egy8ib44s2.execute-api.us-east-1.amazonaws.com/production'
            },
            Api: {
                isDevelopment: isDevelopment,
                Url: useLocalBackend
                    ? 'https://localhost:7099/api'
                    : "https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api"
            },
            Frontend: {
                isDevelopment: isDevelopment,
                Url: useLocalBackend ? "http://localhost:5173" : isDevelopment ? "https://dev.talknlearn.com" : "https://talknlearn.com",
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
