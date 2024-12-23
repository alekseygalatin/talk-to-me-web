import axios from "axios";
import AuthService from "../core/auth/authService";

const apiClient = axios.create({
  //baseURL: "https://localhost:7099/api",
  baseURL: "http://localhost:5227/api",
  headers: {
    "Authorization": `${AuthService.getToken()}`,
    "Content-Type": "application/json", 
  },
});

export default apiClient;