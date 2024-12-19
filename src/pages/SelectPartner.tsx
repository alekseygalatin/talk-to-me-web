import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserCog,
  Globe,
  Menu,
  X,
  BookOpen,
  Coffee,
  Briefcase,
  BookMarked,
} from 'lucide-react';
import { withAuth } from '../components/withAuth';
import { useAppContext } from '../contexts/AppContext';
import Spinner from '../components/Spinner';

interface Partner {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: JSX.Element;
}

const partners: Partner[] = [
  {
    id: '1',
    name: 'Sarah',
    role: 'Language Teacher',
    description: 'Patient and methodical, perfect for beginners.',
    icon: <BookOpen className="w-8 h-8 text-blue-500" />,
  },
  {
    id: '2',
    name: 'Alex',
    role: 'Casual Conversation Partner',
    description: 'Friendly and chatty, great for practicing daily conversations.',
    icon: <Coffee className="w-8 h-8 text-blue-500" />,
  },
  {
    id: '3',
    name: 'Michael',
    role: 'Business Professional',
    description: 'Helps with business language and professional terms.',
    icon: <Briefcase className="w-8 h-8 text-blue-500" />,
  },
  {
    id: '4',
    name: 'Maria',
    role: 'Story Teller',
    description: 'A pretty good storyteller.',
    icon: <BookMarked className="w-8 h-8 text-blue-500" />,
  },
];

function SelectPartner() {
  const navigate = useNavigate();
  const { preferences, isLoading } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSelectPartner = (partnerId: string) => {
    navigate(`/chat/${partnerId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {isLoading ? (
        <Spinner
          isLoading={isLoading}
          label={'Loading preferences...'}
          global={true}
        />
      ) : (
        <>
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Logo and Nav Links */}
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <Link
                      to="/"
                      className="text-2xl font-bold text-blue-600 dark:text-white"
                    >
                      LanguageApp
                    </Link>
                  </div>
                  <div className="hidden md:ml-6 md:flex md:space-x-8">
                    <Link
                      to="/select-partner"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-blue-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                    >
                      Home
                    </Link>
                    <Link
                      to="/user-preferences"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-blue-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                    >
                      Preferences
                    </Link>
                    <Link
                      to="/select-language-to-learn"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-blue-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                    >
                      Languages
                    </Link>
                    <Link
                        to="/words"
                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-blue-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                    >
                      Dictionary
                    </Link>
                  </div>
                </div>
                {/* User Info and Mobile Menu Button */}
                <div className="flex items-center">
                  <div className="hidden md:flex md:items-center md:space-x-6">
                    {/* User Name */}
                    <Link
                      to="/user-preferences"
                      className="flex items-center space-x-2 hover:text-blue-500"
                    >
                      <UserCog className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                      <span className="text-sm font-medium text-gray-700 dark:text-white">
                        {preferences?.name}
                      </span>
                    </Link>
                    {/* Current Language */}
                    <Link
                      to="/select-language-to-learn"
                      className="flex items-center space-x-2 hover:text-blue-500"
                    >
                      <Globe className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                      <span className="text-sm font-medium text-gray-700 dark:text-white">
                        {preferences?.currentLanguageToLearn}
                      </span>
                    </Link>
                  </div>
                  {/* Mobile Menu Button */}
                  <div className="md:hidden ml-2 flex items-center">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    >
                      {isMenuOpen ? (
                        <X className="block h-6 w-6 text-gray-500 dark:text-gray-300" />
                      ) : (
                        <Menu className="block h-6 w-6 text-gray-500 dark:text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  <Link
                    to="/select-partner"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    Home
                  </Link>
                  <Link
                    to="/user-preferences"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    Preferences
                  </Link>
                  <Link
                    to="/select-language-to-learn"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    Languages
                  </Link>
                  {/* User Info */}
                  <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Link
                      to="/user-preferences"
                      className="flex items-center px-5 hover:text-blue-500"
                    >
                      <UserCog className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                      <span className="ml-3 text-base font-medium text-gray-700 dark:text-white">
                        {preferences?.name}
                      </span>
                    </Link>
                    <Link
                      to="/select-language-to-learn"
                      className="flex items-center px-5 mt-2 hover:text-blue-500"
                    >
                      <Globe className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                      <span className="ml-3 text-base font-medium text-gray-700 dark:text-white">
                        {preferences?.currentLanguageToLearn}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* Main Content */}
          <main className="py-8 px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Choose Your Conversation Partner
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Select the perfect partner for your language learning journey
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner, index) => (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectPartner(partner.id)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
                        {partner.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {partner.name}
                        </h3>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                          {partner.role}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {partner.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default withAuth(SelectPartner);