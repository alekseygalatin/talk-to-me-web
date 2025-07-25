import { Word } from "../models/Word";
import apiClient from "./apiClient";

export const addWordToDictionary = async (language: string, word: Word) => {
    word.language = language;
    const response = await apiClient.post(`/words`, word);
    return response;
}

export const getWords = async (language: string): Promise<Word[]> => {
    const response = await apiClient.get(`/words/${language}`);
    return response.data;
}
  
export const deleteWord = async (langauge: string, word: string) => {
    const response = await apiClient.delete(`/words/${langauge}/${word}`,);
    return response;
}

export const setIncludeIntoChat = async (langaugeCode: string, word: string, include: boolean) => {
    const response = await apiClient.put(`/words/${langaugeCode}/chat/${word}?include=${include}`);
    return response;
}
  