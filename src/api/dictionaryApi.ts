import { Word } from "../models/Word";
import apiClient from "./apiClient";

export const addWordToDictionary = async (language: string, word: Word) => {
    word.language = language;
    const response = await apiClient.post(`/words`, word);
    return response.data;
}

export const getWords = async (language: string): Promise<Word[]> => {
    const response = await apiClient.get(`/words/${language}`);
    return response.data;
}
  
  