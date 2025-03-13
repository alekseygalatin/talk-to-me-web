import { LanguageInfo } from "../models/LanguageInfo";
import apiClient from "./apiClient";

export const startVocabularySession = async (language: LanguageInfo) : Promise<string[]> => {
    const response = await apiClient.post(`/vocabularyChatSessions`, language);
    return response.data;
}

export const endVocabularySession = async (languageCode: string) => {
    const response = await apiClient.delete(`/vocabularyChatSessions/${languageCode}`);
    return response;
}