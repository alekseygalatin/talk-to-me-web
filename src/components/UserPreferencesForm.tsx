import React, { useEffect, useState } from "react";
import { useLanguages } from "../hooks/useLanguages";
import { createUserPreferences, getUserPreferences, updateUserPreferences } from "../api/userPreferencesApi";
import AuthService from "../core/auth/authService";
import { UserPreference } from "../models/UserPreference";
import { useNavigate, useLocation  } from "react-router-dom";

const UserPreferencesForm: React.FC = () => {
  const userId: string | null = AuthService.getUserId();
  const { languages, isLoading } = useLanguages();

  const [preferences, setPreference] = useState<UserPreference>({
    name: "",
    sex: "Male",
    nativeLanguage: "en-us",
    currentLanguageToLearn: ""
  });

  const [isEditing, setIsEditing] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) return;
      try {
        const existingPreferences = await getUserPreferences(userId);
        setPreference(existingPreferences);
        setIsEditing(true); // Preferences exist, we'll update instead of create
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // Preferences not found; creating new preferences
          setIsEditing(false);
        } else {
          console.error("Error fetching preferences:", error);
        }
      }
    };

    fetchPreferences();
  }, [userId]);

  useEffect(() => {
    if (languages.length > 0 && !preferences.nativeLanguage) {
      setPreference((prev) => ({ ...prev, nativeLanguage: languages[0].code }));
    }
  }, [languages]);

  const handleInputChange = (field: keyof UserPreference, value: string) => {
    setPreference((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateUserPreferences(userId!, preferences!);
      } else {
        await createUserPreferences(userId!, preferences!);
      }
      const returnTo = location.state?.returnTo || "/select-partner";
      navigate(returnTo); 
    } catch (error) {
      console.error("Error saving preferences", error);
      alert("Failed to save preferences.");
    }
  };

  if (isLoading) {
    return <p>Loading languages...</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name:</label>
                <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
                value={preferences.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sex:</label>
                <select 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={preferences.sex} onChange={(e) => handleInputChange("sex", e.target.value)} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Native language:</label>
                <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={preferences.nativeLanguage}
                onChange={(e) => handleInputChange("nativeLanguage", e.target.value)}
                required
                >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                    {lang.name}
                    </option>
                ))}
                </select>
            </div>
            <button 
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            type="submit">Save Preferences</button>
        </form>
    </div>
    
  );
};

export default UserPreferencesForm;
