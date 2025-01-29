import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserPreferences } from "../api/userPreferencesApi";
import { useAppContext } from "../contexts/AppContext";
import { getLanguage } from "../api/languagesApi";

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setPreferences, setCurrentLanguage, isInitialized, setIsInitialized } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {

    const initializeApp = async () => {
      if (isInitialized) return;

      try {
        const fetchedPreferences = await getUserPreferences();
        if (!fetchedPreferences) {
          navigate("/user-preferences");
          return;
        }

        setPreferences(fetchedPreferences);

        if (fetchedPreferences.currentLanguageToLearn) {
          const language = await getLanguage(fetchedPreferences.currentLanguageToLearn);
          if (language) setCurrentLanguage(language);
        } else {
          navigate("/select-language-to-learn");
          return;
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error during app initialization:", error);
      }
    };

    initializeApp();
  }, [isInitialized]);


  // Render children only after initialization
  return <>{children}</>;
};

export default AppInitializer;
