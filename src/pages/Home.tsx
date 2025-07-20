import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  MessageSquare,
  Globe,
  Brain,
  BookCopy,
  NotebookPen,
  Drama,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { LuSquareCheckBig } from "react-icons/lu";

export function Home() {
  const benefit = useRef(null);
  const benefitIsInView = useInView(benefit, { once: true, margin: "-300px" });
  const chat = useRef(null);
  const chatIsInView = useInView(chat, { once: true, margin: "-300px" });

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
      <main>
        {/* Hero Section */}
        <section
          aria-labelledby="hero-heading"
          className="bg-white dark:bg-gray-800 py-16 px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <h1
              id="hero-heading"
              className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Learn Languages Through{" "}
              <span className="text-blue-600 dark:text-blue-300">
                Conversation
              </span>
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
        <section aria-labelledby="features-heading" className="py-16 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <div className="flex gap-4 items-center">
                <MessageSquare className="w-12 h-12 text-blue-600 dark:text-blue-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Natural Conversations
                </h3>
              </div>

              <p className="text-gray-600 dark:text-gray-300">
                Practice real-world conversations with AI partners that adapt to
                your level.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.2 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <div className="flex gap-4 items-center">
                <Brain className="w-12 h-12 text-blue-600 dark:text-blue-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Smart Learning
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant translations and corrections as you practice.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.2 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <div className="flex gap-4 items-center">
                <BookCopy className="w-12 h-12 text-blue-600 dark:text-blue-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Interactive Grammar
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Understand grammar with AI explanations and quizzes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.2 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <div className="flex gap-4 items-center">
                <NotebookPen className="w-12 h-12 text-blue-600 dark:text-blue-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Vocabulary Mastery
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Learn and use new words through AI-powered practice
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.2 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <div className="flex gap-4 items-center">
                <Drama className="w-12 h-12 text-blue-600 dark:text-blue-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Role Play Scenarios
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Practice real-world dialogues in different situations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.2 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <div className="flex gap-4 items-center">
                <Globe className="w-12 h-12 text-blue-600 dark:text-blue-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Multiple Languages
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Choose from a variety of languages and practice at your own
                pace.
              </p>
            </motion.div>
          </div>
        </section>

        <motion.section
          ref={benefit}
          className="bg-white dark:bg-gray-800 py-16 px-6"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold dark:text-white mb-6">
              Why Learn with Our AI Assistant?
            </h2>

            <ul className="text-left space-y-4 text-lg max-w-3xl mx-auto">
              {[
                "Personalized feedback on your grammar, vocabulary, and speaking",
                "Practice language skills in realistic, meaningful contexts",
                "Accessible anywhere—no scheduling or human tutor needed",
                "Adaptive learning that remembers your progress and weaknesses",
                "Supports multiple languages and skill levels",
              ].map((text, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  animate={benefitIsInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: idx * 0.15, duration: 0.4 }}
                  className="flex gap-4 items-start"
                >
                  <LuSquareCheckBig className="h-10 w-10 text-blue-600 dark:text-blue-300 flex-shrink-0" />
                  <span className="dark:text-gray-200">{text}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>

        <motion.section ref={chat} className="py-16 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
            All-in-One AI-Powered Language Learning Experience
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={chatIsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-2 dark:text-blue-300">
                🗨️ Conversation Chat
              </h3>
              <p className="dark:text-gray-200">
                Engage in natural, free-form conversations with the AI on
                various topics. Get instant grammar correction and word
                suggestions to build fluency and confidence.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={chatIsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-2 dark:text-blue-300">
                🧠 Grammar Learning Chat
              </h3>
              <p className="dark:text-gray-200">
                Choose grammar topics from a curated list. The assistant
                explains rules, answers your questions, and gives you short
                tests with feedback to strengthen understanding.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={chatIsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-2 dark:text-blue-300">
                📘 Vocabulary Learning Chat
              </h3>
              <p className="dark:text-gray-200">
                Learn new words through interactive exercises. Make example
                sentences, take quizzes, and master vocabulary with AI-guided
                repetition and correction.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={chatIsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-2 dark:text-blue-300">
                📖 Narrative Assistant
              </h3>
              <p className="dark:text-gray-200">
                Improve comprehension and speaking by reading short AI-generated
                stories and retelling them. The assistant assesses your
                retelling and helps refine your expression.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={chatIsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1, duration: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-2 dark:text-blue-300">
                🎭 Role Play Chat
              </h3>
              <p className="dark:text-gray-200">
                Simulate real-life conversations: ordering food, going to the
                doctor, job interviews, and more. Learn practical language
                through immersive dialog practice.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={chatIsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-2 dark:text-blue-300">
                🎙️ Audio Chat
              </h3>
              <p className="dark:text-gray-200">
                Train your speaking and listening skills in a fully voice-based
                chat. Get real-time feedback on pronunciation, fluency, and
                comprehension—all hands-free.
              </p>
            </motion.div>
          </div>
        </motion.section>
        <section
          id="get-started"
          className="bg-blue-900 text-white text-center py-16 px-4"
        >
          <h2 className="text-3xl font-bold mb-4">
            Start Practicing in Minutes
          </h2>
          <p className="text-lg mb-6 max-w-xl mx-auto">
            Sign up now and get access to your personal AI-powered language
            tutor
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 text-lg font-medium bg-white text-blue-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Join Free Now
          </Link>
        </section>

        <footer className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-200">
          &copy; 2025 TalkNLearn. All rights reserved.
        </footer>
      </main>
    </>
  );
}
