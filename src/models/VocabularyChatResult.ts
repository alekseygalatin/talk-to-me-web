export enum VocabularyChatSessionStatus {
    Introduction,
    Evaluation,
    Error
}

export interface VocabularyChatResult {
    response: string;
    success: boolean;
    status: VocabularyChatSessionStatus
}