import { Link, useNavigate } from 'react-router-dom';
import {
    UserCog,
    Globe,
    Menu,
    X,
    ChevronDown,
    LogOut,
  } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Auth } from 'aws-amplify';


const Header: React.FC = () => {

  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { preferences, currentLanguage, isInitialized, clearData } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left Side: Logo and Navigation */}
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link
                  to="/"
                  className="text-2xl font-bold text-blue-600 dark:text-white"
                >
                  Talk&Learn
                </Link>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden md:flex md:items-center md:space-x-6 ml-8">
                <Link
                  to="/select-partner"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white text-sm font-medium"
                >
                  Home
                </Link>
                { isInitialized ? (
                  <>
                    <Link
                    to="/words"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white text-sm font-medium"
                    >
                      Dictionary
                    </Link>
                    <Link
                      to="/select-language-to-learn"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white text-sm font-medium"
                    >
                      Languages
                    </Link>
                  </>
                ) : ('') }
                
              </div>
            </div>
            {/* Right Side: User Menu */}
            <div className="flex items-center">
              {/* Language Selector */}
              { currentLanguage ? (
                <div className="hidden md:flex items-center">
                <Link
                  to="/select-language-to-learn"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white"
                >
                  <Globe className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">
                    {currentLanguage?.name}
                  </span>
                </Link>
              </div>
              ):('')}
              
              {/* User Dropdown */}
              { isInitialized ? (
                  <div className="relative ml-4">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white focus:outline-none"
                  >
                    <UserCog className="w-6 h-6" />
                    <span className="ml-2 text-sm font-medium">
                      {preferences?.name}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link
                          to="/user-preferences"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        >
                          Profile Settings
                        </Link>
                        <Link
                          to="/select-language-to-learn"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        >
                          Change Language
                        </Link>
                        <button
                          onClick={() => {
                            Auth.signOut();
                            clearData();
                            navigate("/login");
                          }}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ):("")}
              
              {/* Mobile Menu Button */}
              <div className="md:hidden ml-2 flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  {isMenuOpen ? (
                    <X className="block h-6 w-6 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <Menu className="block h-6 w-6 text-gray-700 dark:text-gray-300" />
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
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                Home
              </Link>
              <Link
                to="/words"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                Dictionary
              </Link>
              <Link
                to="/select-language-to-learn"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                Languages
              </Link>
              {/* User Menu */}
              <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="px-3">
                  <Link
                    to="/user-preferences"
                    className="flex items-center py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <UserCog className="w-5 h-5 mr-2" />
                    Profile Settings
                  </Link>
                  <Link
                    to="/select-language-to-learn"
                    className="flex items-center py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    Change Language
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(!isMenuOpen);
                      Auth.signOut();
                      navigate("/login");
                    }}
                    className="flex items-center w-full py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    );
  } 

  export default Header;