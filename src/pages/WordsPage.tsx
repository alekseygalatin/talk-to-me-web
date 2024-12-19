import React, { useState, useEffect } from 'react';
import { withAuth } from '../components/withAuth';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Plus, Search } from 'lucide-react';

interface Word {
  word: string;
  translation: string;
  transcript: string;
  example: string;
  includeIntoChat: boolean;
}

const WordsPage: React.FC = () => {
  const token = localStorage.getItem('idToken'); // Assume token is already stored
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch('https://w9urvqhqc6.execute-api.us-east-1.amazonaws.com/Prod/api/Words', {
          method: 'get',
          headers: new Headers({
            'Authorization': token ?? ""
          })});
        const data = await response.json();
        setWords(data);
      } catch (error) {
        console.error('Error fetching words:', error);
      }
    };

    fetchWords();
  }, []);

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

        <div className="mb-6 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search words..."
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            Add New Word
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Word
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Translation
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usage Example
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Include in Chat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {words.map((word, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Book className="w-5 h-5 text-blue-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{word.word}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {word.translation}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {word.example}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-300">Include in Chat</span>
                      </label>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default withAuth(WordsPage);