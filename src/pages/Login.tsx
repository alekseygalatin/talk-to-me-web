import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import LoginForm from "../components/LoginForm";
import CreateAccountForm from "../components/CreateAccountForm";
import ConfirmAccountForm from "../components/ConfirmAccountForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import { Auth } from 'aws-amplify';
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignInTab, setIsSignInTab] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true); 

  const tabVariants = {
    initial: { opacity: 0, x: 0 },
    animate: { opacity: 1, x: 0 },
  };

  const navigate = useNavigate();

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((currentUser) => {
        if (currentUser) {
          navigate("/select-partner");
        }
      })
      .catch((error) => {
        console.error("User not authenticated:", error);
      })
      .finally(() => setIsLoading(false)); 
  }, [navigate]);

  if (isLoading) {
    return (
      <Spinner 
        isLoading={isLoading}
        global={false}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center my-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Sign in to continue learning
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm px-8 py-4 pb-8">
          <div className="text-md font-bold text-center text-gray-500 dark:text-gray-400">
            <ul className="flex flex-wrap -mb-px justify-between">
              <li className="w-1/2 p-1">
                <a
                  href="#"
                  className={`block p-2 rounded-t-lg border-b-2 ${
                    isSignInTab
                      ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setIsSignInTab(true)}
                >
                  Sign In
                </a>
              </li>
              <li className="w-1/2 p-1">
                <a
                  href="#"
                  className={`block p-2 rounded-t-lg border-b-2 ${
                    !isSignInTab
                      ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setIsSignInTab(false)}
                >
                  Create account
                </a>
              </li>
            </ul>
          </div>

          {message && (
            <div className="p-3 mt-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/50 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}
          <AnimatePresence mode="wait">
            {isSignInTab ? (
              <motion.div
                key="signIn"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                {isForgotPassword ? (
                  <ForgotPasswordForm
                    email={email}
                    setEmail={setEmail}
                    setError={setError}
                    setMessage={setMessage}
                    setIsForgotPassword={setIsForgotPassword}
                  />
                ) : (
                  <LoginForm
                    email={email}
                    password={password}
                    setEmail={setEmail}
                    setPassword={setPassword}
                    setError={setError}
                    setIsConfirming={setIsConfirming}
                    setIsSignInTab={setIsSignInTab}
                    setIsForgotPassword={setIsForgotPassword}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="createAccount"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                {isConfirming ? (
                  <ConfirmAccountForm
                    email={email}
                    setError={setError}
                    setMessage={setMessage}
                    setIsConfirming={setIsConfirming}
                    setIsSignInTab={setIsSignInTab}
                  />
                ) : (
                  <CreateAccountForm
                    email={email}
                    password={password}
                    setEmail={setEmail}
                    setPassword={setPassword}
                    setError={setError}
                    setMessage={setMessage}
                    setIsConfirming={setIsConfirming}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
