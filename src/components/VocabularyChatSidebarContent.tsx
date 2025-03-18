import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface VocabularyChatSidebarContentProps {
  learningWords: string[];
  restartSession: () => void;
}

const VocabularyChatSidebarContent: React.FC<
  VocabularyChatSidebarContentProps
> = ({ learningWords, restartSession }) => {
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestartingSession = async () => {
    setIsRestarting(true);
    await restartSession();
    setIsRestarting(false);
  };

  return (
    <>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Practicing Words
        </h3>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {learningWords.map((word) => (
            <div
              key={word}
              className="p-1 text-sm border border-gray-300 break-words bg-white dark:bg-gray-800 rounded-lg text-center text-gray-800 dark:text-white"
            >
              {word}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-items-center">
          <button
            type="button"
            className="py-2 px-4 text-sm inline-flex justify-center items-center gap-x-2  font-semibold rounded-md border 
                        border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 
                        disabled:pointer-events-none"
            onClick={handleRestartingSession}
            disabled={isRestarting}
          >
            <motion.div
              animate={{ rotate: isRestarting ? 360 : 0 }}
              transition={{
                duration: 0.7,
                repeat: isRestarting ? Infinity : 0,
                ease: "linear",
              }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.div>
            Restart
          </button>
        </div>
      </div>
      <hr className="my-3" />
    </>
  );
};

export default VocabularyChatSidebarContent;
