import React, { useEffect, useState } from "react";
import { useLanguages } from "../hooks/useLanguages";
import { createUserPreferences, updateUserPreferences } from "../api/userPreferencesApi";
import { UserPreference } from "../models/UserPreference";
import { useNavigate, useLocation  } from "react-router-dom";
import Spinner from "./Spinner";
import { MessageCircleQuestion } from "lucide-react";
import { useAppContext } from '../contexts/AppContext';

const UserPreferencesForm: React.FC = () => {
  const { languages, isLoading } = useLanguages();
  const [isSaving, setIsSaving] = useState(false);
  const { preferences, setPreferences } = useAppContext();

  const [fromPreferences, setFormPreference] = useState<UserPreference>({
    name: "",
    nativeLanguage: "en-US",
    preferedPronoun: "He/Him",
    currentLanguageToLearn: ""
  });

  useEffect(() => {
    if (preferences) {
      setFormPreference(preferences)
    }
  }, [preferences]);

  const isEditing = !!preferences;
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedLanguage = (languageCode: string) => {
    return languages.find((lang) => lang.code === languageCode);
  };

  useEffect(() => {
    if (fromPreferences.nativeLanguage) {
      const selectedLanguage = getSelectedLanguage(fromPreferences.nativeLanguage);
      if (selectedLanguage) {
        setFormPreference((prev) => ({
          ...prev,
          preferedPronoun: selectedLanguage.pronouns[0], // Default to the first pronoun
        }));
      }
    }
  }, [fromPreferences.nativeLanguage, languages]);

  const handleInputChange = (field: keyof UserPreference, value: string) => {
    setFormPreference((prev) => {
      const updatedPreferences = { ...prev, [field]: value };
      if (field === 'nativeLanguage') {
        const selectedLanguage = getSelectedLanguage(value);
        if (selectedLanguage) {
          updatedPreferences.preferedPronoun = selectedLanguage.pronouns[0]; // Reset to the first pronoun
        }
      }
      return updatedPreferences;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEditing) {
        await updateUserPreferences(fromPreferences!);
      } else {
        await createUserPreferences(fromPreferences!);
      }
      setPreferences(fromPreferences);
      const returnTo = location.state?.returnTo || "/select-partner";
      navigate(returnTo); 
    } catch (error) {
      console.error("Error saving preferences", error);
      alert("Failed to save preferences.");
    }
  };

  if (isLoading) {
    return (
      <Spinner 
        isLoading={isLoading}
        global={false}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <div className="flex justify-between relative">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name:</label>
                    <span className="cursor-pointer mx-1 peer">
                    <MessageCircleQuestion className="w-5 text-gray-700 dark:text-gray-300"/>
                    </span>
                    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden peer-hover:flex items-center justify-center 
                      max-w-md w-full px-4 py-4 bg-white text-sm rounded shadow-lg italic font-medium text-gray-500 dark:bg-gray-800 dark:text-white">
                      Your name will be used by the AI to address you personally during conversations and interactions
                    </div>
                </div>
                <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
                value={fromPreferences.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                disabled={isSaving}
                />
            </div>
            <div>
              <div className="flex justify-between relative">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Native language:</label>
                    <span className="cursor-pointer mx-1 peer">
                    <MessageCircleQuestion className="w-5 text-gray-700 dark:text-gray-300"/>
                    </span>
                    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden peer-hover:flex items-center justify-center 
                      max-w-md w-full px-4 py-4 bg-white text-sm rounded shadow-lg italic font-medium text-gray-500 dark:bg-gray-800 dark:text-white">
                      Your native language helps the AI explain concepts, grammar rules, and translations in a way that's tailored to you. It also determines the language used in the dictionary for translations
                    </div>
                </div>
                <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={fromPreferences.nativeLanguage}
                onChange={(e) => handleInputChange("nativeLanguage", e.target.value)}
                required
                disabled={isSaving}
                >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                    {lang.name}
                    </option>
                ))}
                </select>
            </div>
            <div>
            <div className="flex justify-between relative">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preferred pronoun:</label>
                  <span className="cursor-pointer mx-1 peer">
                    <MessageCircleQuestion className="w-5 text-gray-700 dark:text-gray-300"/>
                  </span>
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden peer-hover:flex items-center justify-center 
                    max-w-md w-full px-4 py-4 bg-white text-sm rounded shadow-lg italic font-medium text-gray-500 dark:bg-gray-800 dark:text-white">
                    The AI will use this pronoun to address you in languages where pronouns are important. For languages without gender-specific pronouns, a neutral form will be used
                  </div>
              </div>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={fromPreferences.preferedPronoun}
              onChange={(e) => handleInputChange("preferedPronoun", e.target.value)}
              required
              disabled={isSaving}
            >
              {getSelectedLanguage(fromPreferences.nativeLanguage)?.pronouns.map((pronoun, index) => (
                <option key={index} value={pronoun}>
                  {pronoun}
                </option>
              ))}
            </select>
          </div>
            <button 
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            type="submit"
            disabled={isSaving}>
              {isSaving ? (
                <div className="mx-2 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Save Preferences '
              )}
            </button>
        </form>
    </div>
    
  );
};

export default UserPreferencesForm;
