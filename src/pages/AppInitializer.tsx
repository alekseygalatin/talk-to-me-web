import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserPreferences } from "../api/userPreferencesApi";
import AuthService from "../core/auth/authService";
import { useAppContext } from "../contexts/AppContext";
import { getLanguage } from "../api/languagesApi";
import { Auth } from "aws-amplify";

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setPreferences, setCurrentLanguage, setIsInitialized } = useAppContext();
  const navigate = useNavigate();
  let userId = '';

  useEffect(() => {
    const initializeApp = async () => {
      Auth.currentAuthenticatedUser().then((user) => {
        userId = user.getUserId();
      });

      const token = AuthService.getToken();
      if (!token) {
        navigate("/login"); 
        return;
      }

      try {
        const fetchedPreferences = await getUserPreferences(userId);
        if (!fetchedPreferences) {
          navigate("/user-preferences"); 
          return;
        }

        setPreferences(fetchedPreferences);

        if (fetchedPreferences.currentLanguageToLearn) {
           const language = await getLanguage(fetchedPreferences.currentLanguageToLearn);
           if (language) 
            setCurrentLanguage(language);
        } else {
          navigate("/select-language-to-learn");
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error during app initialization:", error);
      }
    };

    initializeApp();
  }, [navigate, setPreferences, setCurrentLanguage, setIsInitialized]);


  // Render children after initialization logic
  return <>{children}</>;
};

export default AppInitializer;
