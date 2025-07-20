import apiClient from "./apiClient";

export const invokeWordTeacherAgent = async (text: string, locale: string): Promise<any> => {
  return await apiClient.post('/agents/' + locale + `/wordTeacherAgent/text/invoke`, 
      text);
}

export const invokeStoryTailorAgent = async (locale: string): Promise<any> => {
  return await apiClient.post('/agents/' + locale + `/storyTailorAgent/invoke`,
      {});
}

export const invokeTranslationAgent = async (text: string, locale: string): Promise<any> => {
  return await apiClient.post('/agents/' + locale + `/translationAgent/text/invoke`,
    text);
}

export const invokeRetailerAgent = async (promt: string, text: string, locale: string): Promise<any> => {
  return await apiClient.post('/agents/' + locale + `/retailerAgent/promt/text/invoke`,
      {
        promt,
        text
      });
}

export const invokeConversationAgent = async (text: string, locale: string): Promise<any> => {
    return await apiClient.post('/agents/' + locale + `/conversationAgent/text/invoke`,
        text);
}

export const invokeConversationHelperAgent = async (text: string, locale: string): Promise<any> => {
    return await apiClient.post('/agents/' + locale + `/conversationHelperAgent/text/invoke`,
        text);
}
  
  