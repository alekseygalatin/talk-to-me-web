import { motion } from 'framer-motion';
import { withAuth } from '../components/withAuth';
import {  } from "lucide-react";
import SubscriptionForm from "../components/SubscriptionForm";
import { LuSquareCheckBig } from "react-icons/lu";

const SubscriptionPage: React.FC = () => {

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
        >
        
        <div className="text-center my-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <LuSquareCheckBig className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Request subscription</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Interested in using the app without limits? Let us know you'd like to see a subscription option!</p>
        </div>
        
        <SubscriptionForm />
            
      </motion.div>
    </div>
  );
};

export default withAuth(SubscriptionPage);
