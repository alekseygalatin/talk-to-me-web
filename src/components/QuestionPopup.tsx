import { motion } from 'framer-motion';
import './QuestionPopup.css';

interface QuestionPopupProps {
    suggestedAnswer?: string;
    explanation?: string;
    alternativeResponses?: string[];
    note?: string;
    onClose: () => void;
    isLoading: boolean;
}

export default function QuestionPopup({
    suggestedAnswer,
    explanation,
    alternativeResponses,
    note,
    onClose,
    isLoading,
}: QuestionPopupProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative rounded-2xl shadow-2xl
                    w-[95vw] sm:w-[550px] md:w-[600px] lg:w-[650px] bg-white text-gray-900 dark:bg-gray-800 dark:text-white
                    backdrop-blur-lg backdrop-filter
                    border border-gray-200 dark:border-gray-700`}
            >
                <button
                    onClick={onClose}
                    className={`absolute right-4 top-4 p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-500 hover:text-gray-700
                            dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200' 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 dark:focus:ring-gray-700`}
                    aria-label="Close popup"
                >
                    <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 
                                border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent"/>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className='text-sm font-medium mb-2 text-gray-500 dark:text-gray-400'>
                                    Suggested Answer
                                </h3>
                                <p className="text-xl font-medium">{suggestedAnswer}</p>
                            </div>

                            <div>
                                <h3 className='text-sm font-medium mb-2 text-gray-500 dark:text-gray-400'>
                                    Explanation
                                </h3>
                                <p className='p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50'>
                                    {explanation}
                                </p>
                            </div>

                            <div>
                                <h3 className='text-sm font-medium mb-2 text-gray-500 dark:text-gray-400'>
                                    Alternative Responses
                                </h3>
                                <ul className="list-disc list-inside">
                                    {alternativeResponses?.map((response, index) => (
                                        <li key={index}>{response}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className='text-sm font-medium mb-2 text-gray-500 dark:text-gray-400'>
                                    Note
                                </h3>
                                <p className='italic text-gray-600 dark:text-gray-400'>
                                    {note}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
} 