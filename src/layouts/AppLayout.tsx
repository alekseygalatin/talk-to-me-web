import React from "react";
import { Outlet } from "react-router-dom";
import { ProfileSettings } from '../models/ProfileSettings';
import { SettingsSidebar } from '../components/SettingsSidebar';
import { useEffect, useState } from "react";
import Header from "../components/Header";


const AppLayout: React.FC = () => {
  
  /*const [settings, setSettings] = useState<ProfileSettings>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' ?? 'dark'; // Default to dark theme
    return {
      theme: savedTheme,
      language: 'sv-SE',
      volume: 80,
      microphoneSensitivity: 100,
    };
  });
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    localStorage.setItem('theme', settings.theme);
  }, [settings.theme]);
  
  const handleSettingsChange = (key: keyof ProfileSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };*/
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      
      {/*<header 
            className='flex items-center justify-between p-3 sm:p-4 w-full bg-white dark:bg-gray-800 shadow-md z-20'
            style={{
            paddingTop: `calc(env(safe-area-inset-top) + 0.75rem)`,
            }}
        >
            <div className="flex items-center gap-2 sm:gap-3">
              <div>
                  <h1 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white'>Talk And Learn</h1>
              </div>
            </div>
            
        </header>*/}

      <main>
        <Outlet /> {/* Renders the child route */}
      </main>

      

    </div>
  );
};

export default AppLayout;
