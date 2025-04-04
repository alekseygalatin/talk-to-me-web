import { Feedback } from "../models/Feedback";
import apiClient from "./apiClient";

export const saveFeedback = async (feedback: Feedback) => {
    const response = await apiClient.post(`/feedbacks`, feedback);
    return response;
}