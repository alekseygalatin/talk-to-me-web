import apiClient from "./apiClient";

export const fetchAudioForMessage = async (locale: string, message: string) => {
  const response = await apiClient.post('/speech/' + locale + '/speech', message);
  return response.data;
}; 