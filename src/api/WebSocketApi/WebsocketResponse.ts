export enum RouteResponseType {
    AuthResponse = "authResponse",
    Transcript = "transcript",
    TranscriptCompleted = "transcriptCompleted",
    AiAgentResponse = "aiAgentResponse",
    PollyResult = "pollyResult",
    Exception = "exception",
    GraphCreated = "graphCreated"
}

export interface SocketResponse<T> {
    route: RouteResponseType;
    result: T;
}

export interface SocketGraphCreated {
    graphType: string;
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
    is_final: boolean;
    chunkIndex: number;
    totalChunks: number;
}

export interface SocketExceptionResponse {
    error: string;
    code: number;
}

// Deserializer function
export const deserializeSocketResponse =
    (json: string): SocketResponse<
        SocketGraphCreated |
        SocketAuthResponse |
        SocketTranscriptResponse |
        SocketExceptionResponse |
        SocketTranscriptCompletedResponse |
        SocketAiAgentResponse |
        SocketPollyResponse
    > | null => {
        const parsed = JSON.parse(json);

        if (!parsed.route) {
            console.error("Failed to deserialize WebSocket message: Invalid message structure");
        }

        switch (parsed.route as RouteResponseType) {
            case RouteResponseType.AuthResponse:
                return parsed as SocketResponse<SocketAuthResponse>;
            case RouteResponseType.GraphCreated:
                return parsed as SocketResponse<SocketGraphCreated>;
            case RouteResponseType.Transcript:
                return parsed as SocketResponse<SocketTranscriptResponse>;
            case RouteResponseType.TranscriptCompleted:
                return parsed as SocketResponse<SocketTranscriptCompletedResponse>;
            case RouteResponseType.AiAgentResponse:
                return parsed as SocketResponse<SocketAiAgentResponse>;
            case RouteResponseType.PollyResult:
                return parsed as SocketResponse<SocketPollyResponse>;
            case RouteResponseType.Exception:
                return parsed as SocketResponse<SocketExceptionResponse>;
            default:
                console.error("Failed to deserialize WebSocket message: Unknown route type", parsed.route);
                return null;
        }
    }