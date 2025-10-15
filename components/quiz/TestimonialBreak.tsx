'use client';

import { motion } from 'framer-motion';
import { InterQuizTestimonial } from '@/data/testimonials';

/**
 * TestimonialBreak Component
 * Displays during quiz flow after questions 7, 14, and 21
 *
 * Purpose: Build trust and motivation during quiz completion
 * Features:
 * - Full-screen immersive design
 * - Chakra-specific gradient backgrounds
 * - Success story with before/after transformation
 * - Continue button to resume quiz
 */

interface TestimonialBreakProps {
  testimonial: InterQuizTestimonial;
  onContinue: () => void;
}

export default function TestimonialBreak({ testimonial, onContinue }: TestimonialBreakProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-3xl mx-auto">
        {/* Card Container */}
        <motion.div
          className={`bg-gradient-to-br ${testimonial.gradient} rounded-3xl p-8 md:p-12 shadow-2xl text-white relative overflow-hidden`}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Decorative blur orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative z-10">
            {/* Progress indicator */}
            <motion.p
              className="text-white/80 text-sm uppercase tracking-wide mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Mások tapasztalata
            </motion.p>

            {/* Title */}
            <motion.h2
              className="text-3xl md:text-4xl font-serif font-bold mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {testimonial.title}
            </motion.h2>

            {/* Stars */}
            <motion.div
              className="flex gap-1 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[...Array(testimonial.rating)].map((_, i) => (
                <motion.span
                  key={i}
                  className="text-2xl"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  ⭐
                </motion.span>
              ))}
            </motion.div>

            {/* Quote */}
            <motion.blockquote
              className="text-lg md:text-xl leading-relaxed mb-8 whitespace-pre-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              "{testimonial.quote}"
            </motion.blockquote>

            {/* Author */}
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold">
                {testimonial.name[0]}
              </div>
              <div>
                <p className="font-semibold text-lg">{testimonial.name}, {testimonial.age}</p>
                <p className="text-sm text-white/80">{testimonial.chakra}</p>
              </div>
            </motion.div>

            {/* Continue Button */}
            <motion.button
              onClick={onContinue}
              className="w-full bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300 shadow-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Folytatom a tesztet →
            </motion.button>
          </div>
        </motion.div>

        {/* Bottom hint */}
        <motion.p
          className="text-center text-gray-600 text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          Már csak néhány kérdés, és meglátod az eredményeidet!
        </motion.p>
      </div>
    </motion.div>
  );
}
