import { motion } from 'framer-motion';
import { Volume2, BookmarkPlus } from 'lucide-react';
import { forwardRef } from 'react';
import {addWordToDictionary} from "../api/dictionaryApi.ts";
import { Word } from '../models/Word.ts';
import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import {
  invokeTranslationAgent,
} from "../api/agentsApi.ts";

interface WordPopupProps {
  word: string;
  onClose: () => void;
  setSelectedWord:(word:string) => void;
  onWordAdded?: () => void;
}

const WordPopup = forwardRef<HTMLDivElement, WordPopupProps>(
    ({ word, onClose, setSelectedWord, onWordAdded}, ref) => {
      const [translation, setTranslation] = useState<Word | null>(null);
      const [isLoading, setIsLoading] = useState(false);
      const translateRequestRef = useRef<AbortController | null>(null);
      const [isAdding, setIsAdding] = useState(false);
      const [isAdded, setIsAdded] = useState(false);
      
      const { preferences } = useAppContext();
  
    useEffect(() => {
      if (translateRequestRef.current) {
          translateRequestRef.current.abort();
      }
      translateRequestRef.current = new AbortController();
  
      const loadTranslation = async () => {
          setTranslation(null);
          if (!word) return;
          setIsLoading(true);
          try {
              const result = await getTranslation(word);
              setTranslation(result!);
          } catch (error: any) {
              if (error.name !== 'AbortError') {
                  console.error('Translation error:', error);
              }
          } finally {
              setIsLoading(false);
          }
      };
  
      loadTranslation();
  
      return () => {
          if (translateRequestRef.current) {
              translateRequestRef.current.abort();
          }
      };
    }, [word]);
  
    const getTranslation = async (word: string): Promise<Word> => {
      const response = await invokeTranslationAgent(word, preferences?.currentLanguageToLearn!)
      let responseObject = JSON.parse(response.data.body);
      const translation: Word = JSON.parse(responseObject.Text);
      return translation;
    }

    const handleAddToDictionary = async () => {
      setIsAdding(true);
      try {
        const response = await addWordToDictionary(preferences?.currentLanguageToLearn!, translation!);
        
        if (response.status === 200 || response.status === 204) {
          setIsAdded(true);

          if (onWordAdded) {
            await onWordAdded();
          }
        }
      } catch (error: any) {
        if (error.response && error.response.status === 409) {
          alert(error.response.data.message);
        } else 
          console.error('Error adding word to dictionary:', error);
      } finally {
        setIsAdding(false);
      }
    };
  
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='relative rounded-2xl shadow-2xl  max-h-screen 
              w-[95vw] sm:w-[550px] md:w-[600px] lg:w-[650px] bg-white text-gray-900 dark:bg-gray-800 dark:text-white
              backdrop-blur-lg backdrop-filter
              border border-gray-200 dark:border-gray-700'
          >
            <div className='flex justify-between px-6 py-3 items-start border-b border-gray-200 dark:border-gray-700 gap-2'>
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <div className='flex gap-2'>
                    <span className="text-2xl font-semibold break-all">{translation?.word ? translation.word : word}</span>
                    <div className="flex items-start">
                      <button
                        onClick={() => {
                          const utterance = new SpeechSynthesisUtterance(translation?.word);
                          utterance.lang = preferences?.currentLanguageToLearn ?? "sv-se";
                          utterance.rate = 0.9;
                          window.speechSynthesis.speak(utterance);
                        }}
                        className='p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'
                        title="Speak word"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <motion.button
                        onClick={handleAddToDictionary}
                        className={`p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-300 ${
                          isAdding 
                            ? 'bg-gray-300 text-white' 
                            : isAdded 
                            ? 'bg-green-300 text-white' 
                            : 'dark:hover:bg-gray-700 dark:text-gray-300'
                        }`}
                        title="Add to Dictionary"
                        disabled={isAdding || isAdded}
                        animate={isAdded ? { backgroundColor: '#34D399' } : { }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                         <BookmarkPlus className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
                {
                  translation ? (
                    <div className='flex '>
                      <span className='text-sm font-medium text-gray-500 dark:text-gray-400'>{translation?.transcription}</span>
                  </div>
                  ) : ('')
                }
              </div>
              <button
                onClick={onClose}
                className='p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-500 hover:text-gray-700
                    dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300
                    dark:focus:ring-gray-700'
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
              
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 
                    border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent"/>
                </div>
              ) : (
                translation && (
                  <div className="space-y-6">
                    {
                      translation.baseFormWord !== translation.word && 
                      (
                        <div>
                          <h3 className='text-sm font-medium mb-2 text-gray-500 dark:text-gray-400'>
                            Base form
                          </h3>
                          <span className='break-all cursor-pointer hover:bg-opacity-20 rounded px-0.5 py-0.5 transition-colors duration-200 hover:bg-gray-600 dark:hover:bg-gray-400'
                            onClick={() => setSelectedWord(translation.baseFormWord)}>
                            {translation.baseFormWord}
                          </span>
                        </div>
                      )
                    }
                    <div>
                      <h3 className='text-sm font-medium mb-2 text-gray-500 dark:text-gray-400'>
                        Translation
                      </h3>
                      { translation.translations.map((text, index) => (
                        <p key={index}>
                          {index + 1}. {text}
                        </p>
                      ))}
                    </div>
  
                    <div>
                      <h3 className='text-sm font-medium mb-2 text-gray-500 dark:text-gray-400'>
                        Example
                      </h3>
                      <p className='p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 break-words'>
                        {translation.example}
                      </p>
                    </div>
                   
                    <div>
                      <h3 className='text-sm font-medium mb-2 text-gray-500 dark:text-gray-400'>
                        Notes
                      </h3>
                      <p className='italic text-gray-600 dark:text-white'>
                        {translation.translationNotes}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </div>
      );
    }
  );
  
  export default WordPopup;
  