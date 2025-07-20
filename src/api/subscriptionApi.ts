import { Subscription } from "../models/Subscription";
import apiClient from "./apiClient";

export const subscriptionRequested = async () => {
    const response = await apiClient.get(`/subscriptions`);
    return response;
}

export const requestSubscription = async (subscription: Subscription) => {
    const response = await apiClient.post(`/subscriptions`, subscription);
    return response;
}

export const cancelSubscriptionRequest = async () => {
    const response = await apiClient.delete(`/subscriptions`);
    return response;
}
