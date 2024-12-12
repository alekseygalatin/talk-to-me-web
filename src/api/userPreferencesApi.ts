import { UserPreference } from "../models/UserPreference";
import apiClient from "./apiClient";

export const createUserPreferences = async (userId: string, preferences: UserPreference) => {
  const response = await apiClient.post(`/UserPreferences/${userId}`, preferences);
  return response.data;
};

export const updateUserPreferences = async (userId: string, preferences: UserPreference) => {
  const response = await apiClient.put(`/UserPreferences/${userId}`, preferences);
  return response.data;
};

export const setCurrentLanguageToLearn = async (userId: string, langaugeCode: string) => {
  const response = await apiClient.put(`/UserPreferences/set-current-language-to-learn/${userId}/${langaugeCode}`);
  return response.data;
};

export const getUserPreferences = async (userId: string): Promise<UserPreference> => {
    const response = await apiClient.get(`/UserPreferences/${userId}`);
    return response.data; 
  };