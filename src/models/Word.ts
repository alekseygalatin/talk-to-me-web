export interface Word {
    language: string;
    word: string;
    transcription: string;
    baseFormWord: string;
    translations: string[]
    example: string;
    translationNotes: string;
    includeIntoChat: boolean;

}