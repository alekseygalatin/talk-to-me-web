import { UserPreference } from "../models/UserPreference";
import apiClient from "./apiClient";

export const createUserPreferences = async (userId: string, preferences: UserPreference) => {
  //console.log("api: createUserPreferences");
  const response = await apiClient.post(`/UserPreferences/${userId}`, preferences);
  return response.data;
};

export const updateUserPreferences = async (userId: string, preferences: UserPreference) => {
  //console.log("api: updateUserPreferences");
  const response = await apiClient.put(`/UserPreferences/${userId}`, preferences);
  return response.data;
};

export const setCurrentLanguageToLearn = async (userId: string, langaugeCode: string) => {
  //console.log("api: setCurrentLanguageToLearn");
  const response = await apiClient.put(`/UserPreferences/set-current-language-to-learn/${userId}/${langaugeCode}`);
  return response.data;
};

export const getUserPreferences = async (userId: string): Promise<UserPreference> => {
  //console.log("api: getUserPreferences");
    const response = await apiClient.get(`/UserPreferences/${userId}`);
    return response.data; 
  };