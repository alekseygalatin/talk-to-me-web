import apiClient from "./apiClient";

export const getLanguages = async () => {
    const response = await apiClient.get("/languages");
    return response.data;
  };
  