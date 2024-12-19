import axios from "axios";
import AuthService from "../core/auth/authService";

const apiClient = axios.create({
  //baseURL: "https://localhost:7099/api",
  baseURL: "https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api",
  headers: {
    "Authorization": `${AuthService.getToken()}`,
    "Content-Type": "application/json", 
  },
});

export default apiClient;