export interface Word {
    word: string;
    transcription: string;
    wordForm: string;
    baseFormWord: string;
    translations: string[]
    example: string;
    translationNotes: string;
    includeIntoChat: boolean;

}