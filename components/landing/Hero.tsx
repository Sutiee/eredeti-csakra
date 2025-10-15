'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-mystical">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-spiritual-purple-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-spiritual-rose-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Subtitle */}
          <motion.p
            className="text-spiritual-purple-600 font-medium text-sm md:text-base uppercase tracking-wider mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Ingyenes csakra elemzés
          </motion.p>

          {/* Main headline */}
          <motion.h1
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-spiritual-purple-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Fedezd fel, mi tartja vissza
            <br />
            <span className="bg-gradient-to-r from-spiritual-purple-600 to-spiritual-rose-600 bg-clip-text text-transparent">
              valódi éneded kibontakozását
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            3 perces elemzés, amely megmutatja, melyik csakrád blokkolt, és hogyan
            oldhatod fel az energiáidat
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Button href="/kviz" size="lg" variant="primary" aria-label="Kezdem az ingyenes csakra elemzést - 3 perc alatt">
              Kezdem az elemzést →
            </Button>
          </motion.div>

          {/* Trust indicator */}
          <motion.p
            className="mt-8 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            ✨ Teljesen ingyenes • Nincs regisztráció • 3 perc
          </motion.p>
        </motion.div>

        {/* Decorative mandala-like element */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 0.6, rotate: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <div className="w-24 h-24 border-2 border-spiritual-purple-300 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-spiritual-rose-300 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-spiritual rounded-full animate-pulse-slow" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-6 h-10 border-2 border-spiritual-purple-400 rounded-full flex justify-center">
          <motion.div
            className="w-1.5 h-1.5 bg-spiritual-purple-600 rounded-full mt-2"
            animate={{
              y: [0, 16, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
