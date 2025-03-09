import { LanguageInfo } from "../models/LanguageInfo";
import apiClient from "./apiClient";

export const startVocabularySession = async (language: LanguageInfo) : Promise<string[]> => {
    const response = await apiClient.post(`/vocabularyChatSessions/start`, language);
    return response.data;
}

export const getVocabularySessionWords = async (language:string): Promise<string[]> => {
    const response = await apiClient.get(`/vocabularyChatSessions/${language}`);
    return response.data;
}

export const endVocabularySession = async (language: LanguageInfo) => {
    const response = await apiClient.post(`/vocabularyChatSessions/end`, language);
    return response;
}