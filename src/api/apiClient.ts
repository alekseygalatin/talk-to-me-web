import axios from "axios";
import AuthService from "../core/auth/authService";

const apiClient = axios.create({
  //baseURL: "https://localhost:7099/api",
  baseURL: "https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api",
  headers: {
    "Content-Type": "application/json", 
  },
  timeout: 60000
});

apiClient.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers["Authorization"] = `${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;