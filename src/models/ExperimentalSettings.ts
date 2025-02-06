export interface ExperimentalSettings {
    Api: ApiSettings
    WebSocket: ApiSettings
    StreamTranscriptionSupported: boolean;
}

export interface ApiSettings{
    isDevelopment: boolean;
    Url: string;
}