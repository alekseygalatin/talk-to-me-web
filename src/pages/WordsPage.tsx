import React, { useState, useEffect } from 'react';
import { withAuth } from '../components/withAuth';
import { motion } from 'framer-motion';
import { Volume2, Plus, Search, Trash2, Languages } from 'lucide-react';
import {getWords} from "../api/dictionaryApi.ts";
import { Word } from '../models/Word.ts';
import { useAppContext } from '../contexts/AppContext.tsx';
import WordPopup from '../components/WordPopup.tsx';


const WordsPage: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const { preferences } = useAppContext();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordForTranslation, setWordForTranslation] = useState('');

  useEffect(() => {
    const fetchWords = async () => {
      if (!preferences?.currentLanguageToLearn) return;
      try {
        const words = await getWords(preferences?.currentLanguageToLearn!);
        setWords(words);
      } catch (error) {
        console.error('Error fetching words:', error);
      }
    };

    fetchWords();
  }, [preferences?.currentLanguageToLearn]);

  const handleTranslateClick = () => {
    if (wordForTranslation.trim() === '') {
      return;
    }
    const cleanWord = wordForTranslation.replace(/[.,!?;:'"()\[\]{}]/g, '');

    setSelectedWord(cleanWord);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your Vocabulary
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track and manage your learned words
          </p>
        </motion.div>

        <div className="mb-4 flex flex-col-reverse lg:gap-4 lg:flex-row justify-between items-center">
          <div className="w-full my-1 lg:w-2/4 relative py-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search words..."
              className="w-full pl-12 pr-4 py-2 border border-gray-200 text-sm dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className='w-full my-1 lg:w-2/4 flex justify-end py-2'>
            <div className="flex w-full rounded-lg shadow-sm">
              <input type="text" className="py-2 px-4 block w-full border border-gray-200 text-sm rounded-s-lg  focus:z-10 focus:border-blue-500 
                focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 
                dark:placeholder-neutral-500 dark:focus:ring-neutral-600" 
                placeholder="Enter word for translation"
                onChange={(e) => setWordForTranslation(e.target.value)}
                />
              <button type="button" className="py-2 px-4 text-sm inline-flex justify-center items-center gap-x-2  font-semibold rounded-e-md border 
                  border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 
                  disabled:pointer-events-none"
                onClick={handleTranslateClick}  
              >
                <Languages className="w-5 h-5 " />
                Translate
              </button>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden p-2"
        >
          <div className="overflow-y-auto divide-y divide-solid">
            
                {words.map((word, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-wrap"
                      >
                        <div className="px-4 py-2 w-8/12 lg:w-3/12">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-medium text-gray-900 dark:text-white break-all">{word.word}</span>
                            <button
                              onClick={() => {
                                const utterance = new SpeechSynthesisUtterance(word?.word);
                                utterance.lang = preferences?.currentLanguageToLearn ?? "sv-se";
                                utterance.rate = 0.9;
                                window.speechSynthesis.speak(utterance);
                              }}
                              className='p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-800 dark:text-gray-300'
                              title="Speak word"
                            >
                              <Volume2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className='flex items-center'>
                              <span className='text-sm text-gray-500 dark:text-gray-300'>{word?.transcription} </span>
                          </div>
                        </div>
                        <div className="flex items-start px-4 py-2 justify-end w-4/12 lg:hidden">
                          <div className="flex items-center gap-2">
                            <button
                                onClick={() => {  console.log("Delete")}}
                                className='p-2 rounded-lg transition-colors hover:bg-gray-100 text-red-600 dark:hover:bg-gray-800 dark:text-red-300'
                                title="Delete word"
                              >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={word.includeIntoChat}
                                onChange={() => {
                                  const updatedWords = [...words];
                                  updatedWords[index].includeIntoChat = !updatedWords[index].includeIntoChat;
                                  setWords(updatedWords);
                                }}
                                className="form-checkbox h-5 w-5 text-blue-600"
                              />
                              <span className="ml-2 text-sm text-gray-500 dark:text-gray-300">Learn</span>
                            </label>
                          </div>
                        </div>
                        <div className="px-4 py-2 text-sm text-gray-900 dark:text-white w-full lg:w-3/12">
                          { word.translations.map((text, index) => (
                              `${index + 1}.${text}; `
                          ))}
                        </div>
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300 w-full lg:w-4/12">
                          {word.example}
                        </div>
                        <div className="flex items-start px-4 py-2 justify-end w-full lg:w-2/12 hidden lg:block">
                          <div className="flex items-center gap-2">
                            <button
                                onClick={() => {  console.log("Delete")}}
                                className='p-2 rounded-lg transition-colors hover:bg-gray-100 text-red-600 dark:hover:bg-gray-800 dark:text-red-300'
                                title="Delete word"
                              >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={word.includeIntoChat}
                                onChange={() => {
                                  const updatedWords = [...words];
                                  updatedWords[index].includeIntoChat = !updatedWords[index].includeIntoChat;
                                  setWords(updatedWords);
                                }}
                                className="form-checkbox h-5 w-5 text-blue-600"
                              />
                              <span className="ml-2 text-sm text-gray-500 dark:text-gray-300">Learn</span>
                            </label>
                          </div>
                        </div>
                      </motion.div>
                  
                ))}
             
          </div>
        </motion.div>
      </div>

      {selectedWord && (
        <WordPopup
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          setSelectedWord={setSelectedWord}
        />
      )}

    </div>
  );
};

export default withAuth(WordsPage);