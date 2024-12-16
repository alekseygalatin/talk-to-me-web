import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCog, Globe } from 'lucide-react';
import { useAppContext } from "../contexts/AppContext";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

/*interface Settings {
  theme: 'light' | 'dark';
  language: string;
  volume: number;
  microphoneSensitivity: number;
}
*/

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  /*settings: Settings;
  onSettingsChange: (key: keyof Settings, value: any) => void;*/
}

export function SettingsSidebar({ isOpen, onClose }: SettingsSidebarProps) {

  const {theme, toggleTheme, preferences, isLoading} = useAppContext();

  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className='fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-6 dark:bg-gray-800'
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Settings
              </h2>
              <button
                onClick={onClose}
                className='p-2 rounded-lg hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 text-gray-300'
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">

            <div className='flex'>
              <div className='inline-block p-2'>
                <button
                  onClick={toggleTheme}
                  className="relative flex items-center px-2 py-1 w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-gray-400 rounded-full transition-transform ${
                      theme === 'dark' ? 'transform translate-x-8 bg-blue-600' : 'transform translate-x-0'
                    }`}
                  ></span>
                  <span
                    className={`absolute w-full flex items-center justify-between px-2 text-xs font-medium uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                  </span>
                </button>
                </div>
                <div className='flex items-center p-2'>
                  <span className='text-gray-900 dark:text-white'>Dark mode</span>
                </div>
              </div>
            <div>
                <label className='block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300'>
                  User preferences
                </label>
                <div>
                  <div className='inline-block p-2'>
                    <UserCog className='font-semibold text-gray-900 dark:text-white' />
                  </div>
                  <div className='px-2 inline-block'>
                      <h5 className='font-semibold text-gray-900 dark:text-white'>{preferences?.name}</h5>
                      <Link
                          to="/user-preferences"
                          className="font-medium hover:underline text-blue-600 dark:text-white"
                        >
                          Settings
                        </Link>
                  </div>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300'>
                  Language to learn
                </label>
                <div>
                  <div className='inline-block p-2'>
                    <Globe className='font-semibold text-gray-900 dark:text-white' />
                  </div>
                  <div className='px-2 inline-block'>
                      <h5 className='font-semibold text-gray-900 dark:text-white'>{preferences?.currentLanguageToLearn}</h5>
                      <Link
                          to="/select-language-to-learn"
                          className="font-medium hover:underline text-blue-600 dark:text-white"
                        >
                          Change
                        </Link>
                  </div>
                </div>
              </div>
              
            
              
              {/*<div>
                <label className={`block text-sm font-medium mb-2 ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => onSettingsChange('language', e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="sv-SE">Swedish</option>
                  <option value="en-US">English</option>
                  <option value="es-ES">Spanish</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300'>
                  Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => onSettingsChange('volume', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300'>
                  Microphone Sensitivity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.microphoneSensitivity}
                  onChange={(e) => onSettingsChange('microphoneSensitivity', Number(e.target.value))}
                  className="w-full"
                />
              </div>*/}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 