'use client';

import { motion } from 'framer-motion';
import { landingTestimonials, LandingTestimonial } from '@/data/testimonials';

/**
 * TestimonialsSection Component
 * Displays 6 user testimonials on the landing page
 *
 * Features:
 * - 3-column grid on desktop, 1 column on mobile
 * - Staggered fade-in animations
 * - Hover effects for engagement
 * - Before/After transformation highlights
 * - 5-star ratings
 */

function TestimonialCard({
  testimonial,
  index
}: {
  testimonial: LandingTestimonial;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-purple-100 flex flex-col h-full"
    >
      {/* Star Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <span key={i} className="text-2xl">
            ⭐
          </span>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-gray-700 leading-relaxed mb-6 italic flex-grow">
        "{testimonial.quote}"
      </blockquote>

      {/* Author Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-spiritual-purple-500 to-spiritual-rose-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {testimonial.name[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {testimonial.name}, {testimonial.age}
          </p>
          <p className="text-sm text-purple-600">{testimonial.chakra}</p>
        </div>
      </div>

      {/* Before/After */}
      {testimonial.beforeAfter && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">
            Változás:
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-700">
              <span className="text-red-500 font-semibold">Előtte:</span>{' '}
              {testimonial.beforeAfter.before}
            </p>
            <p className="text-sm text-gray-700">
              <span className="text-green-500 font-semibold">Utána:</span>{' '}
              {testimonial.beforeAfter.after}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 via-white to-rose-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-serif font-bold text-center mb-4 bg-gradient-to-r from-spiritual-purple-600 to-spiritual-rose-600 bg-clip-text text-transparent"
        >
          Amit mások mondanak
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto"
        >
          Több mint 12,000 nő találta meg már a választ a csakra teszttel
        </motion.p>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {landingTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
