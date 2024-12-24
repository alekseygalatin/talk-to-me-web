import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { ChatSettings } from "../models/ChatSettings";

interface ChatSettingsContextType {
  chatSettings: ChatSettings;
  updateSetting: (key: keyof ChatSettings, value: number) => void;
}

const ChatSettingsContext = createContext<ChatSettingsContextType | undefined>(undefined);

export const ChatSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
    const initialChatSettings = useMemo(
    () => ({
      volume: parseFloat(localStorage.getItem("volume") || "80"),
      microphoneSensitivity: parseFloat(localStorage.getItem("microphoneSensitivity") || "80"),
      langaugeLevel: parseFloat(localStorage.getItem("langaugeLevel") || "5"),
    }),
    [] 
  );

  const [chatSettings, setSettings] = useState<ChatSettings>(initialChatSettings);

  useEffect(() => {
    localStorage.setItem("volume", String(chatSettings.volume));
    localStorage.setItem("microphoneSensitivity", String(chatSettings.microphoneSensitivity));
    localStorage.setItem("langaugeLevel", String(chatSettings.langaugeLevel));
  }, [chatSettings]);

  const updateSetting = (key: keyof ChatSettings, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const contextValue = useMemo(
    () => ({ chatSettings, updateSetting }),
    [chatSettings]
  );

  return (
    <ChatSettingsContext.Provider value={contextValue}>
      {children}
    </ChatSettingsContext.Provider>
  );
};

export const useChatSettings = (): ChatSettingsContextType => {
  const context = useContext(ChatSettingsContext);
  if (!context) {
    throw new Error("useChatSettings must be used within ChatSettingsProvider");
  }
  return context;
};
