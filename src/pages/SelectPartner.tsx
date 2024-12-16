import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { User, BookOpen, Coffee, Briefcase, BookMarked} from 'lucide-react';
import { withAuth } from '../components/withAuth';

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
    role: 'Story Tailor',
    description: 'A pretty good storyteller.',
    icon: <BookMarked className="w-8 h-8 text-blue-500" />,
  },
];

function SelectPartner() {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectPartner = (partnerId: string) => {
    navigate(`/chat/${partnerId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      {!isSidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 p-2 rounded-full shadow-lg transition-transform transform hover:scale-110"
          onClick={() => setSidebarOpen(true)}
        >
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-gray-900 dark:bg-white"></span>
            <span className="block w-6 h-0.5 bg-gray-900 dark:bg-white"></span>
            <span className="block w-6 h-0.5 bg-gray-900 dark:bg-white"></span>
          </div>
        </button>
      )}

      <motion.div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-40 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          <button
            className="text-gray-900 dark:text-white mb-6"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Menu</h2>
          <Link
            to="/home"
            className="block text-gray-900 dark:text-white font-semibold mb-4 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-300"
            onClick={() => setSidebarOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/profile"
            className="block text-gray-900 dark:text-white font-semibold mb-4 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-300"
            onClick={() => setSidebarOpen(false)}
          >
            Profile
          </Link>
          <Link
            to="/words"
            className="block text-gray-900 dark:text-white font-semibold mb-4 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-300"
            onClick={() => setSidebarOpen(false)}
          >
            Words
          </Link>
          {/* Add more links as needed */}
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Conversation Partner
          </h1>
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
    </div>
  );
}

export default withAuth(SelectPartner);