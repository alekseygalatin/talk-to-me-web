import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Coffee, Briefcase } from 'lucide-react';

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
];

export function SelectPartner() {
  const navigate = useNavigate();

  const handleSelectPartner = (partnerId: string) => {
    navigate(`/chat/${partnerId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
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