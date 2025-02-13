import { Link, useNavigate } from 'react-router-dom';
import {
    UserCog,
    Globe,
    Menu as MenuIcon,
    X,
    ChevronDown,
    LogOut,
    Settings,
    BookMarked,
    LayoutDashboard
  } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Auth } from 'aws-amplify';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { NavLink } from "react-router-dom";

const Header: React.FC = () => {

  const navigate = useNavigate();
  const { preferences, currentLanguage, isInitialized, clearData } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {theme, toggleTheme} = useAppContext();

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
              <div className="hidden md:flex md:items-center md:space-x-4 ml-8">
                <NavLink
                  to="/select-partner"
                  className={({isActive}) => `flex items-center gap-1 p-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white text-sm font-medium ${isActive ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                >
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </NavLink>
                { isInitialized ? (
                  <>
                    <NavLink
                    to="/words"
                    className={({isActive}) => `flex items-center gap-1 p-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white text-sm font-medium ${isActive ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                    >
                      <BookMarked className="w-5 h-5" /> Dictionary
                    </NavLink>
                  </>
                ) : ('') }
                
              </div>
            </div>
            {/* Right Side: User Menu */}
            <div className="flex items-center">
                {/* User Dropdown */}
          { isInitialized && (
                <Menu>
                  <MenuButton
                    className="hidden md:flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white focus:outline-none"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="ml-2 text-sm font-medium">
                      {preferences?.name}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </MenuButton>
                  
                    <MenuItems className={"rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 mt-2"} anchor="bottom start">
                    
                        <MenuItem>
                        <Link
                          to="/user-preferences"
                          className="flex items-center gap-2 block px-6 pt-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <UserCog className="w-5 h-5" /> Profile Settings
                        </Link>
                        </MenuItem>
                        {/* Language Selector */}
                        { currentLanguage && (
                          
                          <MenuItem>
                          <Link
                            to="/select-language-to-learn"
                            className="flex items-center gap-2 block px-6 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Globe className="w-5 h-5" />
                            {currentLanguage?.name} (change)
                          </Link>
                          </MenuItem>
                       
                        )}
                        
                        <MenuItem>
                        <button
                          onClick={() => {
                            Auth.signOut();
                            clearData();
                            navigate("/login");
                          }}
                          className="flex items-center gap-2 w-full px-6 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <LogOut className="w-5 h-5" />
                          Log Out
                        </button>
                        </MenuItem>
                        <hr className='mt-2'/>
                        <div className='flex items-center gap-2 px-6 py-4 text-sm text-gray-700 dark:text-gray-200'>
                          <div className='inline-block'>
                            <button
                              onClick={toggleTheme}
                              className="relative flex items-center px-2 py-1 w-10 h-5 rounded-full bg-gray-200 dark:bg-gray-600 transition-colors"
                            >
                              <span
                                className={`absolute top-0 left-0 w-5 h-5 bg-gray-400 rounded-full transition-transform ${
                                  theme === 'dark' ? 'transform translate-x-5 bg-blue-600' : 'transform translate-x-0'
                                }`}
                              ></span>
                              <span
                                className={`absolute w-full flex items-center justify-between px-2 text-xs font-medium uppercase ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}
                              >
                              </span>
                            </button>
                          </div>
                          <div className='flex items-center'>
                            <span>Dark mode</span>
                          </div>
                        </div>
                    </MenuItems>
                  
                </Menu>
                
              )}
            
              {/* Mobile Menu Button */}
              <div className="md:hidden ml-2 flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  {isMenuOpen ? (
                    <X className="block h-6 w-6 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <MenuIcon className="block h-6 w-6 text-gray-700 dark:text-gray-300" />
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
              <NavLink
                to="/select-partner"
                className={({isActive}) => `flex items-center gap-2 px-3 py-3 text-base font-medium text-gray-700 dark:text-gray-300 ${isActive ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </NavLink>
              <NavLink
                to="/words"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                Dictionary
              </NavLink>
 
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