import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAppContext } from "../contexts/AppContext";
import { useChatSettings } from "../contexts/ChatSettingsContext";

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
}

export function SettingsSidebar({
  isOpen,
  onClose,
  content,
}: SettingsSidebarProps) {
  const { theme, toggleTheme } = useAppContext();
  const { chatSettings, updateSetting } = useChatSettings();

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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg dark:bg-gray-800 z-50"
          >
            <div className="flex justify-between items-center p-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Settings
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <hr />

            <div className="flex-1 h-full p-5 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex">
                  <div className="inline-block">
                    <button
                      onClick={toggleTheme}
                      className="relative flex items-center px-2 py-1 w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-gray-400 rounded-full transition-transform ${
                          theme === "dark"
                            ? "transform translate-x-8 bg-blue-600"
                            : "transform translate-x-0"
                        }`}
                      ></span>
                      <span
                        className={`absolute w-full flex items-center justify-between px-2 text-xs font-medium uppercase ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      ></span>
                    </button>
                  </div>
                  <div className="flex items-center p-2">
                    <span className="text-gray-900 dark:text-white">
                      Dark mode
                    </span>
                  </div>
                </div>
                <hr />
                {content && <>{content}</>}

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={chatSettings.volume}
                    onChange={(e) =>
                      updateSetting("volume", Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Microphone Sensitivity
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={chatSettings.microphoneSensitivity}
                    onChange={(e) =>
                      updateSetting(
                        "microphoneSensitivity",
                        Number(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Language Proficiency Level
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={chatSettings.langaugeLevel}
                    onChange={(e) =>
                      updateSetting("langaugeLevel", Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
                <hr />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
