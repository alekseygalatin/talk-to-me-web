import {ExperimentalSettings} from "../models/ExperimentalSettings.ts";

export class ExperimentalSettingsManager {
    private readonly settings: ExperimentalSettings;

    constructor() {
        const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local';
        const isLocal = process.env.BACKEND_RUN_STRATEGY === 'local';

        this.settings = {
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
