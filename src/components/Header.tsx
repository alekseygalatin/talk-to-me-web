import { Link, useNavigate } from "react-router-dom";
import {
  UserCog,
  Globe,
  Menu as MenuIcon,
  X,
  ChevronDown,
  LogOut,
  Settings,
  BookMarked,
  LayoutDashboard,
  MessageCircleMore,
} from "lucide-react";
import { useAppContext } from "../contexts/AppContext";
import { Auth } from "aws-amplify";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, currentLanguage, isInitialized, clearData } =
    useAppContext();
  const { theme, toggleTheme } = useAppContext();

  const handleLogout = async () => {
    await Auth.signOut();
    clearData();
    navigate("/login");
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm relative">
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
                className={({ isActive }) =>
                  `flex items-center gap-1 p-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white text-sm font-medium ${
                    isActive ? "bg-gray-100 dark:bg-gray-700" : ""
                  }`
                }
              >
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </NavLink>
              {isInitialized && (
                <>
                  <NavLink
                    to="/words"
                    className={({ isActive }) =>
                      `flex items-center gap-1 p-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white text-sm font-medium ${
                        isActive ? "bg-gray-100 dark:bg-gray-700" : ""
                      }`
                    }
                  >
                    <BookMarked className="w-5 h-5" /> Dictionary
                  </NavLink>
                </>
              )}
            </div>
          </div>
          {/* Right Side: User Menu */}
          <div className="flex items-center">
            {/* User Dropdown */}
            {isInitialized && (
              <Menu>
                <MenuButton className="hidden md:flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white focus:outline-none">
                  <Settings className="w-5 h-5" />
                  <span className="ml-2 text-sm font-medium">
                    {preferences?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </MenuButton>

                <MenuItems
                  className={
                    "rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 mt-2"
                  }
                  anchor="bottom start"
                >
                  <MenuItem>
                    <Link
                      to="/user-preferences"
                      className="flex items-center gap-2 block px-6 pt-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <UserCog className="w-5 h-5" /> Profile Settings
                    </Link>
                  </MenuItem>
                  {/* Language Selector */}
                  {currentLanguage && (
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
                      <Link
                        to="/feedbacks"
                        className="flex items-center gap-2 block px-6 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <MessageCircleMore className="w-5 h-5" />
                        Feedback
                      </Link>
                    </MenuItem>
                  <MenuItem>
                    <button
                      onClick={ handleLogout }
                      className="flex items-center gap-2 w-full px-6 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </button>
                  </MenuItem>
                  <hr className="mt-2" />
                  <div className="flex items-center gap-2 px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                    <div className="inline-block">
                      <button
                        onClick={toggleTheme}
                        className="relative flex items-center px-2 py-1 w-10 h-5 rounded-full bg-gray-200 dark:bg-gray-600 transition-colors"
                      >
                        <span
                          className={`absolute top-0 left-0 w-5 h-5 bg-gray-400 rounded-full transition-transform ${
                            theme === "dark"
                              ? "transform translate-x-5 bg-blue-600"
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
                    <div className="flex items-center">
                      <span>Dark mode</span>
                    </div>
                  </div>
                </MenuItems>
              </Menu>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="w-full">
        <Menu>
          {({ open }) => (
            <>
              {/* Mobile Menu Button */}
              <div className="md:hidden ml-2 flex items-center absolute top-3 right-3">
                <MenuButton
                  className={
                    "rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  }
                >
                  {open ? (
                    <X className="block h-6 w-6 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <MenuIcon className="block h-6 w-6 text-gray-700 dark:text-gray-300" />
                  )}
                </MenuButton>
              </div>
              <div className="md:hidden">
                <AnimatePresence>
                  <MenuItems
                    as={motion.div}
                    initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                    animate={{ opacity: open ? 1 : 0, height: open ? "auto" : 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="origin-top"
                    static
                  >
                    <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
                      <MenuItem>
                        <NavLink
                          to="/select-partner"
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 ${
                              isActive ? "bg-gray-100 dark:bg-gray-700" : ""
                            }`
                          }
                        >
                          <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </NavLink>
                      </MenuItem>
                      <MenuItem>
                        <NavLink
                          to="/words"
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 ${
                              isActive ? "bg-gray-100 dark:bg-gray-700" : ""
                            }`
                          }
                        >
                          <BookMarked className="w-5 h-5" /> Dictionary
                        </NavLink>
                      </MenuItem>
                      {/* User Menu */}
                      <hr />
                      <MenuItem>
                        <NavLink
                          to="/user-preferences"
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 ${
                              isActive ? "bg-gray-100 dark:bg-gray-700" : ""
                            }`
                          }
                        >
                          <UserCog className="w-5 h-5" />
                          Profile Settings
                        </NavLink>
                      </MenuItem>
                      {currentLanguage && (
                        <MenuItem>
                          <NavLink
                            to="/select-language-to-learn"
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 ${
                                isActive ? "bg-gray-100 dark:bg-gray-700" : ""
                              }`
                            }
                          >
                            <Globe className="w-5 h-5" />
                            {currentLanguage?.name} (change)
                          </NavLink>
                        </MenuItem>
                      )}
                      <MenuItem>
                        <NavLink
                          to="/feedbacks"
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 ${
                              isActive ? "bg-gray-100 dark:bg-gray-700" : ""
                            }`
                          }
                        >
                          <MessageCircleMore className="w-5 h-5" />
                          Feedback
                        </NavLink>
                      </MenuItem>
                      <MenuItem>
                        <button
                          onClick={ handleLogout }
                          className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300"
                        >
                          <LogOut className="w-5 h-5" />
                          Log Out
                        </button>
                      </MenuItem>
                      <hr />
                      <div className="flex items-center gap-2 px-3 py-4 text-sm text-gray-700 dark:text-gray-200">
                        <div className="inline-block">
                          <button
                            onClick={toggleTheme}
                            className="relative flex items-center px-2 py-1 w-14 h-6 rounded-full bg-gray-200 dark:bg-gray-600 transition-colors"
                          >
                            <span
                              className={`absolute top-0 left-0 w-6 h-6 bg-gray-400 rounded-full transition-transform ${
                                theme === "dark"
                                  ? "transform translate-x-8 bg-blue-600"
                                  : "transform translate-x-0"
                              }`}
                            ></span>
                            <span
                              className={`absolute w-full flex items-center justify-between px-2 text-xs font-medium uppercase ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-600"
                              }`}
                            ></span>
                          </button>
                        </div>
                        <div className="flex items-center text-base">
                          <span>Dark mode</span>
                        </div>
                      </div>
                    </div>
                  </MenuItems>
                </AnimatePresence>
              </div>
            </>
          )}
        </Menu>
      </div>
    </header>
  );
};

export default Header;
