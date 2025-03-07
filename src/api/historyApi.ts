import apiClient from "./apiClient";

export const fetchHistory = async (locale: string, agent: string) => {
  const response = await apiClient.get('/history/' + locale + '/' + agent);
  return response.data;
};

export const cleanHistoryAgent = async (locale: string, agent: string): Promise<any> => {
  return await apiClient.delete('/history/' + locale + '/' + agent);
}