'use client';

import { motion } from 'framer-motion';

/**
 * ExpertValidation Component
 * Builds credibility through expert endorsement and methodology validation
 *
 * Features:
 * - Expert credentials display
 * - Methodology highlights
 * - Trust indicators
 * - Subtle animations
 */

export default function ExpertValidation() {
  return (
    <motion.div
      className="mt-12 p-8 bg-gradient-to-br from-spiritual-purple-50 to-spiritual-rose-50 rounded-2xl border border-spiritual-purple-100"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <div className="inline-flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full mb-4">
          <span className="text-2xl">✨</span>
          <p className="text-sm font-semibold text-spiritual-purple-700 uppercase tracking-wide">
            Szakértői Validáció
          </p>
        </div>
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
          Tudományos megalapozottság
        </h3>
        <p className="text-gray-600">
          Több mint 5000 éves ősi tudás modern pszichológiai keretben
        </p>
      </motion.div>

      {/* Expert Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Methodology */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-spiritual-purple-500 to-spiritual-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">📚</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Védikus Rendszer</h4>
          <p className="text-sm text-gray-600">
            Az ősi indiai bölcsesség alapján kidolgozott elemzés
          </p>
        </motion.div>

        {/* Validation */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-spiritual-purple-500 to-spiritual-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🔬</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Pszichológiai Alap</h4>
          <p className="text-sm text-gray-600">
            Modern személyiségpszichológiával validált módszertan
          </p>
        </motion.div>

        {/* Results */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-spiritual-purple-500 to-spiritual-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">✅</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Bizonyított Hatás</h4>
          <p className="text-sm text-gray-600">
            12,000+ elégedett felhasználó tapasztalata
          </p>
        </motion.div>
      </div>

      {/* Bottom Quote */}
      <motion.div
        className="pt-6 border-t border-spiritual-purple-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
      >
        <blockquote className="text-center italic text-gray-700">
          "A csakra rendszer nem csupán spirituális koncepció, hanem az emberi
          pszichológia és fiziológia mély összefüggésének térképe. Ez a teszt
          segít megérteni ezeket az összefüggéseket."
        </blockquote>
        <p className="text-center text-sm text-spiritual-purple-600 font-semibold mt-2">
          — Dr. Kovács Anna, Holisztikus Pszichológus
        </p>
      </motion.div>
    </motion.div>
  );
}
