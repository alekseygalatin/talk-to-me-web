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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      
      <Header openSidebar={() => setIsSidebarOpen(true)}/>

      <main>
        <Outlet /> {/* Renders the child route */}
      </main>

      <SettingsSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md"
          style={{ 
            top: 'env(safe-area-inset-top)',
            bottom: 'env(safe-area-inset-bottom)'
          }}
        />

    </div>
  );
};

export default AppLayout;
