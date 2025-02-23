import React from "react";
import UserPreferencesForm from "../components/UserPreferencesForm";
import { motion } from 'framer-motion';
import { UserCog } from 'lucide-react';
import { withAuth } from '../components/withAuth';

const UserPreferences: React.FC = () => {
  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
        >
        
        <div className="text-center my-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <UserCog className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User preferences</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Fill user preferences to continue learning</p>
        </div>
    
        <UserPreferencesForm />
      </motion.div>
    </div>
  );
};

export default withAuth(UserPreferences);
