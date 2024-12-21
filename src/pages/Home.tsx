import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Globe, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export function Home() {
  return (
    <>
      <Helmet>
        <title>Learn Languages Through Conversation | YourAppName</title>
        <meta
          name="description"
          content="Practice any language with our AI-powered conversation partners. Natural, engaging, and personalized to your learning style."
        />
        <meta
          name="keywords"
          content="language learning, AI conversations, learn languages, language practice, multilingual education"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add more meta tags as needed */}
      </Helmet>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section
          aria-labelledby="hero-heading"
          className="text-center py-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1
              id="hero-heading"
              className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Learn Languages Through{' '}
              <span className="text-blue-600">Conversation</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Practice any language with our AI-powered conversation partners.
              Natural, engaging, and personalized to your learning style.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* Features Section */}
        <section aria-labelledby="features-heading" className="py-12">
          <h2 id="features-heading" className="sr-only">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <MessageSquare className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                Natural Conversations
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Practice real-world conversations with AI partners that adapt to
                your level.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <Globe className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                Multiple Languages
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose from a variety of languages and practice at your own pace.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <Brain className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                Smart Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant translations and corrections as you practice.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
} 