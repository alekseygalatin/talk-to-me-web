import apiClient from "./apiClient";

export const addWordToDictionary = async (word: string, translation: string, example: string): Promise<any> => {
  return await apiClient.post(`/words`,
      {
          word: word,
          translation: translation,
          example: example,
          includeIntoChat: true
      });
}

export const getWords = async (): Promise<any> => {
    return await apiClient.get(`/words`);
}
  
  