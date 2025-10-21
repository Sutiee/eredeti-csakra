"use client";

import { motion } from "framer-motion";

interface SoftUpsellBoxProps {
  position?: "top" | "bottom"; // For A/B testing later
  onCtaClick?: (position: string) => void; // Analytics tracking
}

/**
 * SoftUpsellBox Component
 *
 * Displays the value proposition for the paid complete plan
 * with 3 bullet points, mini price anchor, and CTA button.
 *
 * **Positioning**:
 * - Top: Below FreeChakraSummary (default, v2.1 launch)
 * - Bottom: After chakra accordion (later A/B test)
 */
export default function SoftUpsellBox({
  position = "top",
  onCtaClick,
}: SoftUpsellBoxProps) {
  // Helper: Smooth scroll to pricing section
  const handleCtaClick = () => {
    // Analytics tracking
    if (onCtaClick) {
      onCtaClick(position);
    }

    // Scroll to pricing
    const pricingSection = document.getElementById("pricing-section");
    if (pricingSection) {
      pricingSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto px-4 py-8"
    >
      <div className="relative bg-gradient-to-br from-spiritual-purple-50 via-spiritual-rose-50 to-spiritual-gold-50 rounded-3xl shadow-xl border-2 border-spiritual-purple-200 overflow-hidden">
        {/* Decorative gradient overlay */}
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-spiritual-gold-300/20 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Sparkle decorations */}
        <motion.div
          className="absolute top-6 right-6 text-spiritual-gold-400 text-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        >
          ✨
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-8 text-spiritual-purple-400 text-2xl"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -10, 0],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          aria-hidden="true"
        >
          💫
        </motion.div>

        <div className="relative z-10 p-6 sm:p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-3"
            >
              Mit kapsz a teljes tervben?
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-base text-gray-600"
            >
              Mindent, amire szükséged van a csakráid harmóniájának
              visszaállításához
            </motion.p>
          </div>

          {/* 3 Value Bullets */}
          <div className="grid gap-6 sm:grid-cols-3 mb-8">
            {/* Bullet 1: Heti gyakorlatok */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spiritual-purple-400 to-spiritual-purple-600 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl" aria-hidden="true">📖</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Heti személyre szabott gyakorlatok
              </h4>
              <p className="text-sm text-gray-600">
                Konkrét gyakorlatok minden csakrádhoz a mindennapokba építve
              </p>
            </motion.div>

            {/* Bullet 2: Megerősítő affirmációk */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spiritual-rose-400 to-spiritual-rose-600 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl" aria-hidden="true">✨</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Megerősítő affirmációk
              </h4>
              <p className="text-sm text-gray-600">
                Mindennapi használatra készült, személyre szabott
                megerősítések
              </p>
            </motion.div>

            {/* Bullet 3: Vezetett meditációk */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spiritual-gold-400 to-spiritual-gold-600 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl" aria-hidden="true">🎧</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                7 vezetett csakra meditáció
              </h4>
              <p className="text-sm text-gray-600">
                70+ perc professzionális audio meditáció magyar nyelven
              </p>
            </motion.div>
          </div>

          {/* Price Anchor + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-center border-t-2 border-spiritual-purple-200 pt-6"
          >
            {/* Mini Price Anchor */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">
                Teljes értéke külön-külön vásárolva:
              </p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl text-gray-400 line-through font-semibold">
                  24,970 Ft
                </span>
                <span className="text-4xl font-bold text-spiritual-purple-700">
                  6,990 Ft
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-full px-4 py-2">
                <span className="text-emerald-700 font-semibold text-sm">
                  ✓ 72% megtakarítás
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={handleCtaClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-spiritual-purple-600 to-spiritual-rose-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group"
              style={{
                boxShadow:
                  "0 10px 40px rgba(139, 92, 246, 0.3), 0 4px 12px rgba(236, 72, 153, 0.2)",
              }}
            >
              <span>Megnézem, mit kapok</span>
              <motion.span
                className="text-2xl"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                aria-hidden="true"
              >
                →
              </motion.span>
            </motion.button>

            {/* Trust micro-signal */}
            <p className="text-xs text-gray-500 mt-4">
              ✓ 14 napos pénzvisszafizetési garancia
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
