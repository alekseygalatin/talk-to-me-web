import {ExperimentalSettings} from "../models/ExperimentalSettings.ts";

export class ExperimentalSettingsManager {
    private readonly settings: ExperimentalSettings;

    constructor() {
        const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local';
        const isLocal = process.env.BACKEND_RUN_STRATEGY === 'local';

        this.settings = {
            UseLocalWebSocket: false,
            WebSocketUrl: 'wss://egy8ib44s2.execute-api.us-east-1.amazonaws.com/production',
            // WebSocketUrl: 'ws://127.0.0.1:8080', // 'wss://egy8ib44s2.execute-api.us-east-1.amazonaws.com/production',
            UseStreamTranscription: isDevelopment,
            UseLocalBackEnd: isLocal,
        };
    }

    // Getter for settings
    public getSettings(): ExperimentalSettings {
        return <ExperimentalSettings> this.settings;
    }
}

export const experimentalSettingsManager = new ExperimentalSettingsManager();
