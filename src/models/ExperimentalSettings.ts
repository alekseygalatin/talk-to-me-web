export interface ExperimentalSettings {
    Api: ApiSettings
    Frontend: FrontendSettings
    WebSocket: ApiSettings
    StreamTranscriptionSupported: boolean;
}

export interface ApiSettings{
    isDevelopment: boolean;
    Url: string;
}

export interface FrontendSettings{
    isDevelopment: boolean;
    Url: string;
}