"use client";

import { motion } from "framer-motion";
import { generatedTestimonials, type Testimonial } from "@/data/generated-testimonials";

/**
 * TestimonialsGridDynamic Component
 *
 * Displays a grid of Hungarian testimonials from generated data.
 * Shows 12-15 testimonials with full details including ratings, verification,
 * before/after states, and helpful counts.
 *
 * Features:
 * - Desktop: 3-column grid
 * - Mobile: 1-2 columns
 * - Each card includes: avatar emoji, name, age, rating, chakra badge, review text,
 *   before/after states, timeframe, date, verified badge, helpful count
 * - Stagger animation for cards appearing
 * - Hover effects with scale and shadow
 */
export default function TestimonialsGridDynamic(): JSX.Element {
  // Use all testimonials (15 total)
  const displayedTestimonials = generatedTestimonials;

  // Stagger animation for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Format date to Hungarian
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Render star rating
  const renderStars = (rating: number): JSX.Element => {
    return (
      <div className="flex gap-0.5" aria-label={`${rating} csillagos értékelés`}>
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`text-lg ${
              index < rating ? "text-[#F59E0B]" : "text-gray-300"
            }`}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Get chakra emoji and color
  const getChakraStyle = (chakra: string): { emoji: string; color: string } => {
    const chakraMap: Record<string, { emoji: string; color: string }> = {
      "Gyökércsakra": { emoji: "🔴", color: "border-red-200 bg-red-50" },
      "Szakrális csakra": { emoji: "🟠", color: "border-orange-200 bg-orange-50" },
      "Napfonat csakra": { emoji: "🟡", color: "border-yellow-200 bg-yellow-50" },
      "Szív csakra": { emoji: "💚", color: "border-green-200 bg-green-50" },
      "Torok csakra": { emoji: "💙", color: "border-blue-200 bg-blue-50" },
      "Harmadik szem": { emoji: "💜", color: "border-indigo-200 bg-indigo-50" },
      "Korona csakra": { emoji: "⚪", color: "border-purple-200 bg-purple-50" },
    };
    return chakraMap[chakra] || { emoji: "✨", color: "border-gray-200 bg-gray-50" };
  };

  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            💬 Mit mondanak mások?
          </h2>
          <p className="text-lg text-gray-600">
            Több ezer nő már feloldotta csakráit
          </p>
        </div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayedTestimonials.map((testimonial: Testimonial) => {
            const chakraStyle = getChakraStyle(testimonial.chakra);

            return (
              <motion.div
                key={testimonial.id}
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col"
              >
                {/* Card Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="text-4xl flex-shrink-0">
                    {testimonial.avatar}
                  </div>

                  <div className="flex-1">
                    {/* Name */}
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {testimonial.name}
                    </h3>

                    {/* Rating */}
                    <div className="mb-2">{renderStars(testimonial.rating)}</div>

                    {/* Verified Badge */}
                    {testimonial.verified && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <span className="font-bold">✓</span>
                        <span>Verified Purchase</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chakra Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${chakraStyle.color}`}
                  >
                    <span>{chakraStyle.emoji}</span>
                    <span>{testimonial.chakra}</span>
                  </span>
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 leading-relaxed mb-4 flex-1">
                  {testimonial.text}
                </p>

                {/* Timeframe */}
                <div className="text-sm text-purple-600 font-medium mb-3">
                  ⏱️ {testimonial.timeframe} alatt
                </div>

                {/* Before/After States */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-red-600">Előtte:</span>{" "}
                    <span className="text-gray-600">
                      {testimonial.beforeState}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-green-600">Utána:</span>{" "}
                    <span className="text-gray-600">
                      {testimonial.afterState}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
                  {/* Date */}
                  <time dateTime={testimonial.date}>{formatDate(testimonial.date)}</time>

                  {/* Helpful Count */}
                  <span className="flex items-center gap-1">
                    👍 {testimonial.helpful} ember jelölte hasznosnak
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-700 font-medium">
            Csatlakozz több ezer nőhöz, akik már megváltoztatták az életüket! ✨
          </p>
        </div>
      </div>
    </section>
  );
}
