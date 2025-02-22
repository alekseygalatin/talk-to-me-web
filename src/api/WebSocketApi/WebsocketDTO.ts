type RouteResponseType =
    "authResponse"
    | "transcript"
    | "transcriptCompleted"
    | "aiAgentResponse"
    | "pollyResult"
    | "exception";

type RouteRequestType = "CreateGraph" | "StopGraph" | "Transcribe" | "StopTranscript";

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

export interface SocketTranscriptCompletedResponse extends SocketTranscriptResponse {
}

export interface SocketAiAgentResponse {
    text: string;
}

export interface SocketPollyResponse {
    audioChunk: string;
    chunked: boolean;
}

export interface SocketExceptionResponse {
    error: string;
    code: number;
}

export interface SocketCreateGraphRequest {
    auth_token: string | null;
    graph_type: string;
}

export interface SocketStopGraphRequest { }

export interface SocketTranscribeRequest {
    audioData: string;
    audioMetadata: AudioMetadata | null;
}

export interface AudioMetadata {
    sampleRate: number;
    codec: string;
    language: string;
};

export interface SocketStopTranscriptRequest {
}

// Deserializer function
export const deserializeSocketResponse =
    (json: string): SocketResponse<
        SocketAuthResponse |
        SocketTranscriptResponse |
        SocketExceptionResponse |
        SocketTranscriptCompletedResponse |
        SocketAiAgentResponse |
        SocketPollyResponse
    > | null => {
        const parsed = JSON.parse(json);

        if (!parsed.route || !parsed.result) {
            console.error("Failed to deserialize WebSocket message: Invalid message structure");
        }

        switch (parsed.route) {
            case "authResponse":
                return parsed as SocketResponse<SocketAuthResponse>;
            case "transcript":
                return parsed as SocketResponse<SocketTranscriptResponse>;
            case "transcriptCompleted":
                return parsed as SocketResponse<SocketTranscriptCompletedResponse>;
            case "aiAgentResponse":
                return parsed as SocketResponse<SocketAiAgentResponse>;
            case "pollyResult":
                return parsed as SocketResponse<SocketPollyResponse>;
            case "exception":
                return parsed as SocketResponse<SocketExceptionResponse>;
            default:
                console.error("Failed to deserialize WebSocket message: Unknown route type");
                return null;
        }
    }

// Deserializer function
export const serializeSocketMessage = (message: SocketRequest<SocketCreateGraphRequest | SocketTranscribeRequest | SocketStopTranscriptRequest>): string => {
    const flattenedMetadata = {route: message.route, ...message.request};

    return JSON.stringify(flattenedMetadata);
}