import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://localhost:7099/api",
});

export default apiClient;