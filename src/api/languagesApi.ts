import { Language } from "../models/Language";
import apiClient from "./apiClient";

export const getLanguages = async (): Promise<Language[]> => {
    //console.log("api: getLanguages");
    const response = await apiClient.get("/languages");
    return response.data;
  };
  
  export const getLanguage = async (code: string): Promise<Language> => {
    //console.log("api: getLanguage");
    const response = await apiClient.get(`/languages/${code}`);
    return response.data; 
  };