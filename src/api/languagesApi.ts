import { Language } from "../models/Language";
import apiClient from "./apiClient";

export const getLanguages = async () => {
    const response = await apiClient.get("/languages");
    return response.data;
  };
  
  export const getLanguage = async (code: string): Promise<Language> => {
    const response = await apiClient.get(`/languages/${code}`);
    return response.data; 
  };