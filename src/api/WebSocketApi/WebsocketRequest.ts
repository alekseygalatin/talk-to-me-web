type RouteRequestType =
    "CreateGraph"
    | "StopGraph"
    | "Transcribe"
    | "StopTranscript";

export interface SocketCreateGraphRequest {
    auth_token: string | null;
    graph_type: string;
    language_code: string;
}

export interface SocketStopGraphRequest {
}

export interface SocketTranscribeRequest {
    audioData: string;
    audioMetadata: AudioMetadata | null;
}

export interface AudioMetadata {
    sampleRate: number;
    codec: string;
}

export interface SocketStopTranscriptRequest {
}

export class SocketRequest<
    T extends SocketCreateGraphRequest | SocketStopGraphRequest | SocketTranscribeRequest | SocketStopTranscriptRequest
> {
    constructor(
        public route: RouteRequestType,
        public request: T
    ) {
    }

    public serialize(connectionId: string, isDevelopment: boolean): string {
        if (isDevelopment) {
            const serializedBodyMessage = this.serializeSocketMessage();
            const request = {
                requestContext: {
                    connectionId: connectionId,
                    domainName: "someName",
                    stage: "localdev",
                    routeKey: "$default"
                },
                body: serializedBodyMessage
            };
            return JSON.stringify(request);
        }

        return this.serializeSocketMessage();
    }

    private serializeSocketMessage(): string {
        const flattenedMetadata = {route: this.route, ...this.request};

        return JSON.stringify(flattenedMetadata);
    }
}

export class SocketRequestBuilder {
    static createGraph(
        graphType: string,
        token: string,
        language: string
    ): SocketRequest<SocketCreateGraphRequest> {
        return new SocketRequest<SocketCreateGraphRequest>(
            "CreateGraph",
            {
                graph_type: graphType,
                auth_token: token,
                language_code: language
            });
    }

    static stopGraph(): SocketRequest<SocketStopGraphRequest> {
        return new SocketRequest<SocketStopGraphRequest>("StopGraph", {});
    }

    static transcribe(
        audioData: Uint8Array,
        audioMetadata: AudioMetadata | null
    ): SocketRequest<SocketTranscribeRequest> {
        const audioBase64 = SocketRequestBuilder.convertToBase64(audioData);
        return new SocketRequest<SocketTranscribeRequest>(
            "Transcribe",
            {audioData: audioBase64, audioMetadata});
    }

    static stopTranscript(): SocketRequest<SocketStopTranscriptRequest> {
        return new SocketRequest<SocketStopTranscriptRequest>("StopTranscript", {});
    }

    private static convertToBase64(buffer: Uint8Array): string {
        let binaryString = "";
        for (const byte of buffer) {
            binaryString += String.fromCharCode(byte);
        }
        return btoa(binaryString);
    }
}