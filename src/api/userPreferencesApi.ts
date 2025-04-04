import { LanguageInfo } from "../models/LanguageInfo";
import { UserPreference } from "../models/UserPreference";
import apiClient from "./apiClient";

export const createUserPreferences = async (preferences: UserPreference) => {
  const response = await apiClient.post(`/UserPreferences`, preferences);
  return response.data;
};

export const updateUserPreferences = async (preferences: UserPreference) => {
  const response = await apiClient.put(`/UserPreferences`, preferences);
  return response.data;
};

export const setCurrentLanguageToLearn = async (languageInfo: LanguageInfo) => {
  const response = await apiClient.put("/UserPreferences/current-language", languageInfo);
  return response.data;
};

export const getUserPreferences = async (): Promise<UserPreference> => {
    const response = await apiClient.get(`/UserPreferences`);
    return response.data; 
  };