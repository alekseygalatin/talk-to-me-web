type RouteResponseType = "authResponse" | "transcript" | "exception" | "disconnect";
type RouteRequestType = "Connect" | "Transcribe" | "Disconnect";

export interface SocketResponse<T> {
    route: RouteResponseType;
    result: T;
}

export interface SocketRequest<T> {
    route: RouteRequestType;
    request: T;
}

export interface SocketAuthResponse {
    connectionId: string;
    authResult: string;
    authSuccessful: boolean;
}

export interface SocketTranscriptResponse {
    text: string;
    isFinal: boolean;
}

export interface SocketDisconnectResponse {
    result: boolean;
}

export interface SocketExceptionResponse {
    error: string;
    code: number;
}

export interface SocketConnectRequest {
    token: string | null;
}

export interface SocketTranscribeRequest {
    audioData: string;
    audioMetadata: AudioMetadata | null;
}

export interface AudioMetadata {
    sampleRate: number;
    codec: string;
    language: string;
};

export interface SocketDisconnectRequest {
    reason: string;
}

// Deserializer function
export const deserializeSocketResponse = (json: string): SocketResponse<SocketAuthResponse | SocketTranscriptResponse | SocketExceptionResponse | SocketDisconnectResponse> | null => {
    const parsed = JSON.parse(json);

    if (!parsed.route || !parsed.result) {
        console.error("Failed to deserialize WebSocket message: Invalid message structure");
    }

    switch (parsed.route) {
        case "authResponse":
            return parsed as SocketResponse<SocketAuthResponse>;
        case "transcript":
            return parsed as SocketResponse<SocketTranscriptResponse>;
        case "exception":
            return parsed as SocketResponse<SocketExceptionResponse>;
        case "disconnect":
            return parsed as SocketResponse<SocketDisconnectResponse>;
        default:
            console.error("Failed to deserialize WebSocket message: Unknown route type");
            return null;
    }
}

// Deserializer function
export const serializeSocketMessage = (message: SocketRequest<SocketConnectRequest | SocketTranscribeRequest | SocketDisconnectRequest> ): string => {
    const flattenedMetadata = { route: message.route, ...message.request };

    return JSON.stringify(flattenedMetadata);
}