import React, { useState, useEffect } from 'react';
import { withAuth } from '../components/withAuth';
import { motion } from 'framer-motion';
import { Volume2, Search, Trash2, Languages, BookOpenCheck } from 'lucide-react';
import {getWords, deleteWord, setIncludeIntoChat} from "../api/dictionaryApi.ts";
import { Word } from '../models/Word.ts';
import { useAppContext } from '../contexts/AppContext.tsx';
import WordPopup from '../components/WordPopup.tsx';
import Spinner from '../components/Spinner.tsx';
import { useNavigate } from 'react-router-dom';

const WordsPage: React.FC = () => {
  const [isLoadingWords, setIsWordsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isIncluding, setIsIncluding] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { preferences } = useAppContext();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordForTranslation, setWordForTranslation] = useState('');

  const navigate = useNavigate();

  const fetchWords = async () => {
    if (!preferences?.currentLanguageToLearn) return;
    try {
      const words = await getWords(preferences?.currentLanguageToLearn!);
      setWords(words);
      setIsWordsLoading(false);
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [preferences?.currentLanguageToLearn]);

  const filteredWords = words.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTranslateClick = () => {
    
    const cleanWord: string = wordForTranslation.trim().replace(/[^\p{L}\p{N}\s\-]/gu, '').toLowerCase();
    if (!cleanWord) {
      return;
    }
    console.log(cleanWord);
    setSelectedWord(cleanWord.toString());
  };

  const handleWordAdded = async () => {
    setSelectedWord(null);
    fetchWords();
  };

  const handleDeleteWord = async (index: number, language: string, word: string) => {
    if (confirm("Are you sure you want to delete the word?")) {
      setIsDeleting(true);
      try {
        await deleteWord(language, word);
        const updatedWords = [...words];
        updatedWords.splice(index, 1); 
        setWords(updatedWords);
      }
      catch (error) {
        alert('Deleting failed');
        console.error('Error fetching words:', error);
      }
      finally {
        setIsDeleting(false);
      }
    }
  }

  const handleIncludeIntoChat= async (index: number, word: Word) => {
    setIsIncluding(true);
    try {
      await setIncludeIntoChat(word.language, word.word, !word.includeIntoChat);
      const updatedWords = [...words];
      updatedWords[index].includeIntoChat = !updatedWords[index].includeIntoChat;
      setWords(updatedWords);
    }
    catch (error) {
      alert('Saving failed');
      console.error('Error fetching words:', error);
    }
    finally {
      setIsIncluding(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-center items-center mb-3"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">
            Your Vocabulary
          </h1>
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="my-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm py-2 px-6 cursor-pointer"
              onClick={() => navigate(`/chat/5`) }
            >
              <div className="flex items-start space-x-3 items-center">
                <div className={`p-2 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-white'}`}>
                <BookOpenCheck className='w-5 h-5'/>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                    Practice words
                  </h3>
                  
                </div>
              </div>
            </motion.div>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-gray-200 focus:outline-none text-sm dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className='w-full my-1 lg:w-2/4 flex justify-end py-2'>
            <div className="flex w-full rounded-lg shadow-sm">
              <input type="text" className="w-full px-4 py-2 border border-gray-200 focus:outline-none text-sm dark:border-gray-700 rounded-s-lg focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" 
                placeholder="Enter word for translation"
                maxLength={50}
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2"
        >
          <div className="divide-y divide-solid">
              {isLoadingWords ? 
              (
                <div>
                  <Spinner 
                    isLoading={isLoadingWords}
                    global={false}
                    label='Loading words...'/>
                </div>
              ) :
              (
              <>
                {filteredWords.map((word, index) => (
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
                      <div className="flex items-center justify-end gap-2">
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={word.includeIntoChat}
                            onChange={() => handleIncludeIntoChat(index, word)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-300">Learn</span>
                        </label>
                        <button
                            onClick={() => handleDeleteWord(index, word.language, word.word)}
                            className='p-2 rounded-lg transition-colors hover:bg-gray-100 text-red-600 dark:hover:bg-gray-800 dark:text-red-300'
                            title="Delete word"
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-2 text-sm text-gray-900 dark:text-white w-full lg:w-3/12">
                      { word.translations.map((text, indexTr) => (
                          `${indexTr + 1}.${text}; `
                      ))}
                    </div>
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300 w-full lg:w-4/12">
                      {word.example}
                    </div>
                    <div className="flex items-start px-4 py-2 w-full lg:w-2/12 hidden lg:block">
                      <div className="flex items-center justify-end gap-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={word.includeIntoChat}
                            onChange={() => handleIncludeIntoChat(index, word)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-300">Learn</span>
                        </label>
                        <button
                            onClick={() => handleDeleteWord(index, word.language, word.word)}
                            className='p-2 rounded-lg transition-colors hover:bg-gray-100 text-red-600 dark:hover:bg-gray-800 dark:text-red-300'
                            title="Delete word"
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        
                      </div>
                    </div>
                  </motion.div>
              
            ))}
          </>
          )
          }
          </div>
        </motion.div>
      </div>

      {selectedWord && (
        <WordPopup
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          setSelectedWord={setSelectedWord}
          onWordAdded={handleWordAdded}
        />
      )}

    {isDeleting || isIncluding && (
        <Spinner
          isLoading={isDeleting || isIncluding}
          global={true}
        />
      )}

    </div>
  );
};

export default withAuth(WordsPage);