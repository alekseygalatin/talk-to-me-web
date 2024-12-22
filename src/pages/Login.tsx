import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { CognitoUser, AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js';
import AuthService from '../core/auth/authService';
import { getUserPreferences } from '../api/userPreferencesApi';
import { useAppContext } from '../contexts/AppContext';

const poolData = {
  UserPoolId: 'us-east-1_walDCpNcK',
  ClientId: '7o8tqlt2ucihqsbtthfopc9d4p'
};

const userPool = new CognitoUserPool(poolData);

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { setPreferences } = useAppContext();

  AuthService.clearToken();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const authenticationData = {
      Username: email,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: email,
      Pool: userPool
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: async (session) => {
        const token = session.getIdToken().getJwtToken();
        AuthService.storeToken(token);
        const userId = AuthService.getUserId();
        if (userId) {
          const preferences = await getUserPreferences(userId);
          setPreferences(preferences); 
        }
        setIsLoading(false);
        navigate('/select-partner');
      },
      onFailure: (err) => {
        setError(err.message || 'An error occurred during login');
        setIsLoading(false);
        console.error('Login error:', err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // Prompt user for new password
        const newPassword = prompt('Please enter a new password:');
        if (newPassword) {
          cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
            onSuccess: (session) => {
              const token = session.getIdToken().getJwtToken();
              AuthService.storeToken(token);
              setIsLoading(false);
              navigate('/select-partner');
            },
            onFailure: (err) => {
              setError(err.message || 'An error occurred during password change');
              setIsLoading(false);
              console.error('Password change error:', err);
            },
          });
        } else {
          setError('Password change was cancelled');
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in to continue learning</p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/50 dark:text-red-200 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 