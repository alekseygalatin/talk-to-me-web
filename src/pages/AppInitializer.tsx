import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserPreferences } from "../api/userPreferencesApi";
import { useAppContext } from "../contexts/AppContext";
import { getLanguage } from "../api/languagesApi";

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {preferences, setPreferences, currentLanguage, setCurrentLanguage, isInitialized, setIsInitialized } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreferences = async () => {
      if (preferences) return;

      try {
        const fetchedPreferences = await getUserPreferences();
        if (!fetchedPreferences) {
          navigate("/user-preferences");
          return;
        }

        setPreferences(fetchedPreferences);

      } catch (error) {
        console.error("Error during fetching preferences:", error);
      }
    };

    fetchPreferences();
  }, []);


  useEffect(() => {
    const fetchCurrentLanguage = async () => {
      if (!preferences || isInitialized) return;

      try {
        if (!currentLanguage) {
          if (preferences?.currentLanguageToLearn) {
            const language = await getLanguage(preferences.currentLanguageToLearn);
            if (language) setCurrentLanguage(language);
          } else {
            navigate("/select-language-to-learn");
            return;
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error during fetching current language:", error);
      }
    };

    fetchCurrentLanguage();
  }, [preferences, currentLanguage]);

  // Render children only after initialization
  return <>{children}</>;
};

export default AppInitializer;
