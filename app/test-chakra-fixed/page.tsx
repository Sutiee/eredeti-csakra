'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Teszt adatok
const CHAKRAS = [
  { name: 'Gyökércsakra', emoji: '🔴', score: 6, level: 'blokkolt' },
  { name: 'Szakrális', emoji: '🟠', score: 9, level: 'kiegyensúlyozatlan' },
  { name: 'Napfonat', emoji: '🟡', score: 5, level: 'blokkolt' },
  { name: 'Szív', emoji: '💚', score: 11, level: 'kiegyensúlyozatlan' },
  { name: 'Torok', emoji: '🔵', score: 14, level: 'rendben' },
  { name: 'Harmadik szem', emoji: '🟣', score: 8, level: 'kiegyensúlyozatlan' },
  { name: 'Korona', emoji: '⚪', score: 7, level: 'blokkolt' },
];

export default function TestChakraFixed() {
  const [selected, setSelected] = useState(2); // Napfonat alapból
  const [showFloatingPanel, setShowFloatingPanel] = useState(false);
  const [displayMode, setDisplayMode] = useState<'compact' | 'grid' | 'floating'>('compact');

  const blockedCount = CHAKRAS.filter(c => c.level === 'blokkolt').length;
  const imbalancedCount = CHAKRAS.filter(c => c.level === 'kiegyensúlyozatlan').length;

  // Legproblémásabb csakra
  const mostProblematic = CHAKRAS.sort((a, b) => a.score - b.score)[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vezérlő panel - NEM sticky, hogy ne takarja a floating pill-t */}
      <div className="bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold text-center mb-4">Javított Csakra Megjelenítések</h1>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setDisplayMode('compact')}
            className={`px-4 py-2 rounded ${
              displayMode === 'compact' ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            Kompakt v2
          </button>
          <button
            onClick={() => setDisplayMode('grid')}
            className={`px-4 py-2 rounded ${
              displayMode === 'grid' ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            Grid v2
          </button>
          <button
            onClick={() => setDisplayMode('floating')}
            className={`px-4 py-2 rounded ${
              displayMode === 'floating' ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            Floating v2
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-4">Kedves Tesztelő Anna! 🙏</h1>
        <p className="text-gray-600">Az alábbiakban láthatod a csakráid elemzését.</p>
      </div>

      {/* VERZIÓ 1: Javított Kompakt státusz bar (nem scrollos mobilon) */}
      {displayMode === 'compact' && (
        <div className="container max-w-5xl mx-auto px-4 mb-8">
          {/* Figyelmeztető sáv */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-300 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl animate-pulse">⚠️</span>
              <div>
                <p className="font-bold text-gray-900">
                  {blockedCount} blokkolt és {imbalancedCount} kiegyensúlyozatlan csakrád van!
                </p>
                <p className="text-sm text-gray-600">
                  Legproblémásabb: {mostProblematic.emoji} {mostProblematic.name} ({mostProblematic.score}/16 pont)
                </p>
              </div>
            </div>

            {/* Desktop: 7 gomb egymás mellett */}
            <div className="hidden md:flex gap-1 justify-center">
              {CHAKRAS.map((chakra, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    hover:scale-110 transition-transform
                    ${selected === i ? 'ring-2 ring-purple-500' : ''}
                    ${chakra.level === 'blokkolt' ? 'bg-red-100' :
                      chakra.level === 'kiegyensúlyozatlan' ? 'bg-orange-100' : 'bg-green-100'}
                  `}
                  title={`${chakra.name}: ${chakra.score}/16`}
                >
                  <span className="text-xl">{chakra.emoji}</span>
                  {chakra.level === 'blokkolt' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  )}
                </button>
              ))}
            </div>

            {/* Mobil: 2x4 grid (nem scroll!) */}
            <div className="md:hidden grid grid-cols-4 gap-2">
              {CHAKRAS.map((chakra, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`
                    p-2 rounded-lg flex flex-col items-center gap-1
                    ${selected === i ? 'bg-purple-100 ring-1 ring-purple-500' :
                      chakra.level === 'blokkolt' ? 'bg-red-50' :
                      chakra.level === 'kiegyensúlyozatlan' ? 'bg-orange-50' : 'bg-green-50'}
                  `}
                >
                  <span className="text-2xl">{chakra.emoji}</span>
                  <span className="text-xs font-medium">
                    {chakra.score}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Aktív csakra részlet */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-2">
              {CHAKRAS[selected].emoji} {CHAKRAS[selected].name}
            </h2>
            <p className="text-gray-600 mb-4">
              Állapot: <span className={`font-bold ${
                CHAKRAS[selected].level === 'blokkolt' ? 'text-red-600' :
                CHAKRAS[selected].level === 'kiegyensúlyozatlan' ? 'text-orange-600' : 'text-green-600'
              }`}>{CHAKRAS[selected].level}</span> ({CHAKRAS[selected].score}/16 pont)
            </p>
            <div className="bg-purple-50 rounded p-4">
              <p>Itt jelenne meg a részletes elemzés...</p>
            </div>
          </div>

          {/* CTA közvetlenül utána */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-2">Személyre Szabott Csakra Elemzés</h3>
            <p className="mb-4">Csak 990 Ft (eredeti ár: 7.990 Ft)</p>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold">
              Megrendelem →
            </button>
          </div>
        </div>
      )}

      {/* VERZIÓ 2: Javított Grid (mobilon 2x4, tábleten 3x3, desktopnál 7x1) */}
      {displayMode === 'grid' && (
        <div className="container max-w-5xl mx-auto px-4 mb-8">
          {/* Összesítő fejléc */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Csakráid állapota</h2>
                <p className="text-sm text-gray-600">Kattints bármelyikre a részletekért</p>
              </div>
              <div className="flex gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">{blockedCount}</div>
                  <div className="text-xs text-gray-600">Blokkolt</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{imbalancedCount}</div>
                  <div className="text-xs text-gray-600">Figyelmet igényel</div>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive grid: mobil 2x4, tablet 3x3, desktop 7x1 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
            {CHAKRAS.map((chakra, i) => (
              <motion.button
                key={i}
                onClick={() => setSelected(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow
                  ${selected === i ? 'ring-2 ring-purple-500' : ''}
                  ${chakra.level === 'blokkolt' ? 'border-t-4 border-red-500' :
                    chakra.level === 'kiegyensúlyozatlan' ? 'border-t-4 border-orange-500' :
                    'border-t-4 border-green-500'}
                `}
              >
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-2">{chakra.emoji}</span>
                  <p className="text-xs font-semibold mb-1">{chakra.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        chakra.level === 'blokkolt' ? 'bg-red-500' :
                        chakra.level === 'kiegyensúlyozatlan' ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(chakra.score / 16) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{chakra.score}/16</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Részletek és CTA */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-2">
                {CHAKRAS[selected].emoji} {CHAKRAS[selected].name}
              </h2>
              <p className="text-gray-600 mb-4">
                Részletes elemzés itt jelenik meg...
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Személyre Szabott Elemzés</h3>
              <p className="mb-4">990 Ft (eredeti ár: 7.990 Ft)</p>
              <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold w-full">
                Megrendelem →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERZIÓ 3: Javított Floating - oldalt, nem középen */}
      {displayMode === 'floating' && (
        <>
          {/* Floating gomb - JOBBRA LENT (mobilon) vagy JOBBRA KÖZÉPEN (desktop) */}
          <div className="fixed right-4 bottom-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-40">
            {!showFloatingPanel ? (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setShowFloatingPanel(true)}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-shadow"
              >
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">⚠️</span>
                  <div className="text-left">
                    <p className="text-xs font-bold">{blockedCount + imbalancedCount}</p>
                    <p className="text-xs">csakra</p>
                  </div>
                </div>
              </motion.button>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="bg-white rounded-2xl shadow-2xl p-4 w-80"
                >
                  {/* Fejléc */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold">Csakráid állapota</h3>
                    <button
                      onClick={() => setShowFloatingPanel(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Figyelmeztetés */}
                  <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                    <p className="text-sm font-semibold text-red-700">
                      ⚠️ {blockedCount} blokkolt, {imbalancedCount} figyelmet igényel
                    </p>
                  </div>

                  {/* Csakra lista */}
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {CHAKRAS.map((chakra, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelected(i);
                          setShowFloatingPanel(false);
                        }}
                        className={`
                          w-full p-2 rounded-lg hover:bg-gray-50 flex items-center justify-between
                          ${selected === i ? 'bg-purple-50' : ''}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{chakra.emoji}</span>
                          <span className="text-sm font-medium">{chakra.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{chakra.score}/16</span>
                          {chakra.level === 'blokkolt' && (
                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                          )}
                          {chakra.level === 'kiegyensúlyozatlan' && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Fő tartalom */}
          <div className="container max-w-4xl mx-auto px-4 pb-32">
            {/* Kiemelt figyelmeztetés */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 mb-6">
              <p className="font-bold">
                ⚠️ Figyelem! A {mostProblematic.emoji} {mostProblematic.name} csakrád
                kritikusan blokkolt ({mostProblematic.score}/16 pont)
              </p>
            </div>

            {/* Aktív csakra */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {CHAKRAS[selected].emoji} {CHAKRAS[selected].name}
              </h2>
              <p className="text-gray-600 mb-4">
                Részletes elemzés...
              </p>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Személyre Szabott Csakra Elemzés</h3>
              <p className="mb-4">Csak 990 Ft</p>
              <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold">
                Megrendelem →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Alsó tartalom placeholder */}
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-500">További tartalom (testimonials, FAQ, stb.)</p>
        </div>
      </div>
    </div>
  );
}