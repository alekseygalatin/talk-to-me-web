import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { withAuth } from '../components/withAuth';
import { useLanguages } from "../hooks/useLanguages";
import { setCurrentLanguageToLearn } from '../api/userPreferencesApi';
import AuthService from '../core/auth/authService';
import Spinner from '../components/Spinner';
import React, { useState } from "react";
import { useAppContext } from '../contexts/AppContext';

const SelectLanguageToLearn: React.FC = () => {
    const userId = AuthService.getUserId();
    const { languages, isLoading } = useLanguages();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSaving, setIsSaving ] = useState(false);
    const { preferences } = useAppContext();

    const handleSelectLanguage = async (languageCode: string) => {
      setIsSaving(true);
      try {
        await setCurrentLanguageToLearn(userId!, languageCode);
        const returnTo = location.state?.returnTo || "/select-partner";
        setIsSaving(false);
        navigate(returnTo); 
      }
      catch(error) {
        setIsSaving(false);
        console.error("Error saving current language", error);
        alert("Failed to set language.");
      }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        { isLoading || isSaving ? 
        (
          <div>
            <Spinner 
            isLoading={isLoading || isSaving}
            global={true}/>
          </div>
        ) : 
        (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  What language would you like to practice?
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                  Continue where you left off or choose a new one
              </p>
            </motion.div>
          
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {languages.map((language, index) => (
                <motion.div
                  key={language.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectLanguage(language.code)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${preferences?.currentLanguageToLearn == language.code ? 'bg-blue-900 text-white' : 'bg-blue-50 dark:bg-gray-700 dark:text-white'}`}>
                    <Globe />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {language.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {language.englishName}
                    </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
          </div>
        )
        }
        
      </div>
    );
  };
  
export default withAuth(SelectLanguageToLearn);
