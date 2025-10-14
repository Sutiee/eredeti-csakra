'use client';

/**
 * Client Component for 404 Not Found Page
 * Spiritual-themed page with animations
 */

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFoundClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          className="mb-6"
        >
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
            404
          </h1>
        </motion.div>

        {/* Spiritual Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
          className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100"
        >
          <svg
            className="w-10 h-10 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </motion.div>

        {/* Message */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4"
        >
          Ez az ösvény nem létezik
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-600 mb-8"
        >
          Úgy tűnik, eltévedtél az energiamezőkben. Ne aggódj, segítünk megtalálni az utat.
        </motion.p>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Vissza a kezdőlapra
          </Link>

          <Link
            href="/quiz"
            className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-full border-2 border-purple-600 hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Kezdd el a tesztet
          </Link>
        </motion.div>

        {/* Popular Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="pt-8 border-t border-gray-200"
        >
          <p className="text-sm text-gray-500 mb-4">Hasznos linkek:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/"
              className="text-purple-600 hover:text-purple-700 hover:underline transition-colors"
            >
              Kezdőlap
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/quiz"
              className="text-purple-600 hover:text-purple-700 hover:underline transition-colors"
            >
              Csakra Teszt
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/#about"
              className="text-purple-600 hover:text-purple-700 hover:underline transition-colors"
            >
              Rólunk
            </Link>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-purple-300"
        >
          <svg
            className="w-32 h-32 mx-auto"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <circle cx="50" cy="50" r="40" opacity="0.2" />
            <circle cx="50" cy="50" r="30" opacity="0.3" />
            <circle cx="50" cy="50" r="20" opacity="0.4" />
            <circle cx="50" cy="50" r="10" opacity="0.5" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
