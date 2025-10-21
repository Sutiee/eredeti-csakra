"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generatedTestimonials, type Testimonial } from "@/data/generated-testimonials";

/**
 * TestimonialsGridDynamic Component - 2025 Modern Carousel Design
 *
 * Displays customer testimonials with a modern featured-3 + expandable carousel pattern.
 * Optimized for mobile (no 5000px scroll).
 *
 * Features:
 * - Featured 3 testimonials always visible (desktop: 3 cols, mobile: 1-2 cols)
 * - "További vélemények" expandable section for remaining reviews
 * - Modern glassmorphism card design
 * - Responsive grid layout
 * - Smooth animations with Framer Motion
 *
 * @example
 * <TestimonialsGridDynamic />
 */

// Featured testimonials (first 3)
const FEATURED_COUNT = 3;

/**
 * Get chakra-specific styling
 */
function getChakraStyle(chakra: string): { emoji: string; color: string } {
  const styles: Record<string, { emoji: string; color: string }> = {
    Gyökércsakra: { emoji: "🔴", color: "text-red-600" },
    "Szakrális csakra": { emoji: "🟠", color: "text-orange-600" },
    "Napfonat csakra": { emoji: "🟡", color: "text-yellow-600" },
    "Szív csakra": { emoji: "💚", color: "text-green-600" },
    "Torok csakra": { emoji: "💙", color: "text-blue-600" },
    "Harmadik szem": { emoji: "💜", color: "text-purple-600" },
    "Korona csakra": { emoji: "⚪", color: "text-purple-700" },
  };
  return styles[chakra] || { emoji: "✨", color: "text-spiritual-purple-600" };
}

/**
 * Format date to Hungarian format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Render star rating
 */
function renderStars(rating: number): JSX.Element {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} csillag az 5-ből`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-amber-400 fill-current" : "text-gray-300"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Testimonial Card Component - Modern 2025 Design
 */
interface TestimonialCardProps {
  testimonial: Testimonial;
  featured?: boolean;
}

function TestimonialCard({ testimonial, featured = false }: TestimonialCardProps): JSX.Element {
  const chakraStyle = getChakraStyle(testimonial.chakra);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className={`
        bg-white
        border border-gray-200
        rounded-2xl
        p-6
        shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)]
        hover:shadow-[0_4px_16px_rgba(139,92,246,0.12),0_12px_32px_rgba(139,92,246,0.16)]
        hover:scale-[1.02]
        hover:border-spiritual-purple-300
        transition-all duration-300
        flex flex-col
        h-full
        ${featured ? "md:border-2 md:border-spiritual-purple-300" : ""}
      `}
    >
      {/* Header - Avatar + Name + Rating */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-3xl flex-shrink-0">
          {testimonial.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">
            {testimonial.name}
          </h3>
          <div className="flex items-center gap-2">
            {renderStars(testimonial.rating)}
            {testimonial.verified && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Hitelesített
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chakra Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
          <span className={chakraStyle.color}>{chakraStyle.emoji}</span>
          {testimonial.chakra}
        </span>
      </div>

      {/* Testimonial Text */}
      <p className="text-gray-700 leading-relaxed mb-4 flex-1 text-sm md:text-base">
        {testimonial.text}
      </p>

      {/* Timeframe Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-spiritual-purple-50 text-spiritual-purple-700 rounded-full text-xs font-medium">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {testimonial.timeframe} alatt
        </span>
      </div>

      {/* Before/After States */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs md:text-sm mb-4">
        <div>
          <span className="font-semibold text-red-600">Előtte:</span>{" "}
          <span className="text-gray-600 line-clamp-1">
            {testimonial.beforeState}
          </span>
        </div>
        <div>
          <span className="font-semibold text-green-600">Utána:</span>{" "}
          <span className="text-gray-600 line-clamp-1">
            {testimonial.afterState}
          </span>
        </div>
      </div>

      {/* Footer - Date + Helpful */}
      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
        <span>{formatDate(testimonial.date)}</span>
        <span className="flex items-center gap-1">
          👍 {testimonial.helpful} ember jelölte hasznosnak
        </span>
      </div>
    </motion.div>
  );
}

/**
 * Main Testimonials Component
 */
export default function TestimonialsGridDynamic(): JSX.Element {
  const [showAll, setShowAll] = useState<boolean>(false);

  const featuredTestimonials = generatedTestimonials.slice(0, FEATURED_COUNT);
  const remainingTestimonials = generatedTestimonials.slice(FEATURED_COUNT);

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              font-serif
              text-3xl md:text-4xl
              font-bold
              text-gray-900
              mb-4
            "
          >
            💬 Mit mondanak rólunk
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="
              text-gray-600
              text-base md:text-lg
              max-w-2xl mx-auto
            "
          >
            Több ezer nő már feloldotta csakráit
          </motion.p>
        </div>

        {/* Featured 3 Testimonials - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              featured={true}
            />
          ))}
        </div>

        {/* Expandable Section - Remaining Testimonials */}
        <AnimatePresence>
          {showAll && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {remainingTestimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <div className="text-center">
          <motion.button
            onClick={() => setShowAll(!showAll)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="
              px-8 py-3
              bg-gradient-to-r from-spiritual-purple-500 to-spiritual-rose-500
              text-white
              font-semibold
              rounded-full
              shadow-lg
              hover:shadow-xl
              transition-all duration-300
              inline-flex items-center gap-2
            "
          >
            <span>
              {showAll ? "Kevesebb vélemény" : `További ${remainingTestimonials.length} vélemény`}
            </span>
            <motion.svg
              animate={{ rotate: showAll ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </motion.button>
        </div>

        {/* Bottom CTA Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 text-base md:text-lg">
            Csatlakozz több ezer nőhöz, akik már megváltoztatták az életüket! ✨
          </p>
        </motion.div>
      </div>
    </section>
  );
}
