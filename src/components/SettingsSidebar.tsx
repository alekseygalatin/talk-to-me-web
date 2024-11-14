import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Settings {
  theme: 'light' | 'dark';
  language: string;
}

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export function SettingsSidebar({ isOpen, onClose, settings, onSettingsChange }: SettingsSidebarProps) {
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
            className={`fixed right-0 top-0 h-full w-80 ${
              settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg p-6`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold ${
                settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Settings
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${
                  settings.theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => onSettingsChange({ ...settings, theme: e.target.value as 'light' | 'dark' })}
                  className={`w-full p-2 rounded-lg border ${
                    settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => onSettingsChange({ ...settings, language: e.target.value })}
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 