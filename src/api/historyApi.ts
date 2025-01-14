import apiClient from "./apiClient";

export const fetchHistory = async (locale: string, agent: string) => {
  const response = await apiClient.get('/history/' + locale + '/' + agent);
  return response.data;
}; 