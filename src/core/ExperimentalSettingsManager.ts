import {ExperimentalSettings} from "../models/ExperimentalSettings.ts";

export class ExperimentalSettingsManager {
    private readonly settings: ExperimentalSettings;

    constructor() {
        /*const isDevelopment = true;
        const isLocal = true;*/
        const isDevelopment = process.env.NODE_ENV === 'DEV' || process.env.NODE_ENV === 'local';
        const isLocal = process.env.BACKEND_RUN_STRATEGY === 'local';

        this.settings = {
            UseStreamTranscription: isDevelopment,
            BackendUrl: isLocal ? "https://localhost:7099/api" : "https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api",
            FrontendUrl: isLocal ? "http://localhost:5173" : isDevelopment ? "https://dev.talknlearn.com" : "https://talknlearn.com",
        };
    }

    // Getter for settings
    public getSettings(): ExperimentalSettings {
        return <ExperimentalSettings> this.settings;
    }
}

export const experimentalSettingsManager = new ExperimentalSettingsManager();
