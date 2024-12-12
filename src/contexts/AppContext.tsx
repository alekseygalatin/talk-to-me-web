import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUserPreferences } from '../api/userPreferencesApi';
import { UserPreference } from '../models/UserPreference';
import AuthService from '../core/auth/authService';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppContextType {
  preferences: UserPreference | null;
  isLoading: boolean;
  theme: string;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  const userId: string | null = AuthService.getUserId(); 
  const [preferences, setPreference] = useState<UserPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) {
        navigate("/login");
        return; 
      }
      try {
        const fetchedPreferences: UserPreference = await getUserPreferences(userId);
        setPreference(fetchedPreferences); 

        if (!fetchedPreferences.currentLanguageToLearn) {
          navigate(`/select-language-to-learn`, { state: { returnTo: location.pathname } });
        }

      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          navigate("/user-preferences", { state: { returnTo: location.pathname } });
          return;
        } else {
          console.error("Error fetching user preferences:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [userId, navigate, location.pathname]); 



  return (
    <AppContext.Provider
      value={{ theme, toggleTheme, preferences, isLoading }}
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
