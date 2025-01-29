import axios from "axios";
import { Auth } from "aws-amplify";

const apiClient = axios.create({
  //baseURL: "https://localhost:7099/api",
  baseURL: "https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api",
  headers: {
    "Content-Type": "application/json", 
  },
  timeout: 60000
});

apiClient.interceptors.request.use(
  async (config) => {
    let token = '';
    try {
      token = (await Auth.currentSession()).getAccessToken()?.getJwtToken();
      if (token) {
        config.headers["Authorization"] = `${token}`; 
      }
    } catch (error) {
      console.error("Error retrieving token:", error);
      window.location.href = "/login";
    }

    return config;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("403 or 401: Emitting authError event...");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;