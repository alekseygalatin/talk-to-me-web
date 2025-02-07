import { LanguageInfo } from "../models/LanguageInfo";
import { UserPreference } from "../models/UserPreference";
import apiClient from "./apiClient";

export const createUserPreferences = async (preferences: UserPreference) => {
  //console.log("api: createUserPreferences");
  const response = await apiClient.post(`/UserPreferences`, preferences);
  return response.data;
};

export const updateUserPreferences = async (preferences: UserPreference) => {
  //console.log("api: updateUserPreferences");
  const response = await apiClient.put(`/UserPreferences`, preferences);
  return response.data;
};

export const setCurrentLanguageToLearn = async (languageInfo: LanguageInfo) => {
  //console.log("api: setCurrentLanguageToLearn");
  const response = await apiClient.put("/UserPreferences/current-language", languageInfo);
  return response.data;
};

export const getUserPreferences = async (): Promise<UserPreference> => {
  //console.log("api: getUserPreferences");
    const response = await apiClient.get(`/UserPreferences`);
    return response.data; 
  };