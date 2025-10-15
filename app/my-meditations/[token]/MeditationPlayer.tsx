"use client";

/**
 * MeditationPlayer Client Component
 * Displays all 7 chakra meditations with audio players
 */

import { motion } from 'framer-motion';
import { MEDITATION_SCRIPTS } from '@/data/meditation-scripts';
import AudioPlayer from '@/components/meditations/AudioPlayer';

interface MeditationPlayerProps {
  email: string;
  productType: string;
  accessGrantedAt: string;
}

export default function MeditationPlayer({ email, productType, accessGrantedAt }: MeditationPlayerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-gradient-spiritual bg-clip-text text-transparent">
            Csakra Aktivizáló Meditációid
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            7 irányított meditáció a csakráid harmonizálásához
          </p>
          <p className="text-sm text-gray-500">
            Hozzáférés biztosítva: {new Date(accessGrantedAt).toLocaleDateString('hu-HU')}
          </p>
        </motion.div>

        {/* Meditation Cards */}
        <div className="space-y-6">
          {MEDITATION_SCRIPTS.map((meditation, index) => (
            <motion.div
              key={meditation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-l-4 hover:shadow-2xl transition-shadow"
              style={{ borderLeftColor: meditation.color }}
            >
              {/* Meditation Header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0"
                  style={{ backgroundColor: meditation.color }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-1">
                    {meditation.chakra}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    {meditation.title}
                  </p>
                </div>
                <div className="text-right text-gray-500 text-sm md:text-base flex-shrink-0">
                  <div className="font-semibold">{meditation.duration} perc</div>
                  <div className="text-xs text-gray-400">Meditáció</div>
                </div>
              </div>

              {/* Audio Player */}
              <AudioPlayer
                src={`/api/meditation-audio/${meditation.chakraKey}`}
                chakraColor={meditation.color}
                title={meditation.title}
              />
            </motion.div>
          ))}
        </div>

        {/* Instructions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 bg-gradient-to-br from-purple-50 to-rose-50 rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-serif font-bold mb-6 text-gray-900">
            Hogyan használd a meditációkat?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  Ülj vagy feküdj kényelmes helyen, ahol nem zavarnak
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  Használj fülhallgatót a jobb élményért
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  Kezdd a legblokkolabb csakrád meditációjával
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  Gyakorold naponta vagy hetente rendszeresen
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  Meditálás előtt ne egyél nehéz ételt
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  Engedd, hogy a meditáció átformáljon
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Tipp a hatékonyabb meditációhoz</h4>
              <p className="text-gray-700 text-sm">
                A legjobb eredmény érdekében végezd el a meditációkat sorrendben, kezdve a gyökércsakrával és
                haladva felfelé a korona csakráig. Ez az energia természetes áramlásának megfelelő sorrend.
                Egy teljes ciklus kb. 2 órát vesz igénybe, de választhatsz külön-külön is bármelyik meditációt.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-8 text-center text-gray-600 text-sm"
        >
          <p>
            Kérdésed van? Írj nekünk:{' '}
            <a
              href="mailto:info@eredeticsakra.hu"
              className="text-purple-600 hover:text-purple-800 font-semibold underline"
            >
              info@eredeticsakra.hu
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Ez a link személyes és bizalmas. Ne oszd meg másokkal.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
