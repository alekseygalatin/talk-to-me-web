import { Settings, ChevronLeft, Volume2, Globe2, Mic, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    volume: number;
    language: string;
    theme: 'light' | 'dark';
    microphoneSensitivity: number;
  };
  onSettingsChange: (key: string, value: any) => void;
}

export function Sidebar({ isOpen, onClose, settings, onSettingsChange }: SidebarProps) {
  const languages = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'sv-SE', label: 'Svenska' },
    { code: 'es-ES', label: 'Español' },
    { code: 'fr-FR', label: 'Français' },
    { code: 'de-DE', label: 'Deutsch' },
  ];

  return (
      <>
        {/* Overlay */}
        {isOpen && (
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={onClose}
            />
        )}

        {/* Sidebar */}
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: isOpen ? 0 : '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50"
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Settings</h2>
              </div>
              <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Volume2 className="w-4 h-4" />
                <span>Assistant Volume</span>
              </div>
              <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => onSettingsChange('volume', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="text-right text-sm text-gray-500">{settings.volume}%</div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Globe2 className="w-4 h-4" />
                <span>Language</span>
              </div>
              <select
                  value={settings.language}
                  onChange={(e) => onSettingsChange('language', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                ))}
              </select>
            </div>

            {/* Microphone Sensitivity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mic className="w-4 h-4" />
                <span>Microphone Sensitivity</span>
              </div>
              <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.microphoneSensitivity}
                  onChange={(e) => onSettingsChange('microphoneSensitivity', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="text-right text-sm text-gray-500">{settings.microphoneSensitivity}%</div>
            </div>

            {/* Theme Toggle */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {settings.theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>Theme</span>
              </div>
              <button
                  onClick={() => onSettingsChange('theme', settings.theme === 'light' ? 'dark' : 'light')}
                  className="w-full flex items-center justify-between px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
              <span className="text-sm text-gray-600">
                {settings.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </span>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${
                    settings.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <motion.div
                      animate={{ x: settings.theme === 'dark' ? 16 : 0 }}
                      className="w-4 h-4 bg-white rounded-full"
                  />
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </>
  );
}