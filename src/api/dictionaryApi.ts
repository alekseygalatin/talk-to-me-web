import { Word } from "../models/Word";
import apiClient from "./apiClient";

export const addWordToDictionary = async (word: Word) => {
    const response = await apiClient.post(`/words`, word);
    return response.data;
}

export const getWords = async (): Promise<Word[]> => {
    const response = await apiClient.get(`/words`);
    console.log(response);
    return response.data;
}
  
  