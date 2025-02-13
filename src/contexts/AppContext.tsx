import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserPreference } from '../models/UserPreference';
import { Language } from "../models/Language";

interface AppContextType {
  preferences: UserPreference | null;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreference | null>>;
  currentLanguage: Language | null;
  setCurrentLanguage: React.Dispatch<React.SetStateAction<Language | null>>;
  isInitialized: boolean;
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  theme: string;
  toggleTheme: () => void;
  clearData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // Update the HTML document's class when the theme changes
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save the theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const clearData = () => {
    setPreferences(null);
    setCurrentLanguage(null);
    setIsInitialized(false);
  }

  return (
    <AppContext.Provider
      value={{ preferences, setPreferences, currentLanguage, setCurrentLanguage, isInitialized, setIsInitialized, theme, toggleTheme, clearData}}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
