'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Teszt adatok
const CHAKRAS = [
  { name: 'Gyökércsakra', shortName: 'Gyökér', emoji: '🔴', score: 6, level: 'blokkolt' },
  { name: 'Szakrális csakra', shortName: 'Szakrális', emoji: '🟠', score: 9, level: 'kiegyensúlyozatlan' },
  { name: 'Napfonat csakra', shortName: 'Napfonat', emoji: '🟡', score: 5, level: 'blokkolt' },
  { name: 'Szív csakra', shortName: 'Szív', emoji: '💚', score: 11, level: 'kiegyensúlyozatlan' },
  { name: 'Torok csakra', shortName: 'Torok', emoji: '🔵', score: 14, level: 'rendben' },
  { name: 'Harmadik szem', shortName: '3. szem', emoji: '🟣', score: 8, level: 'kiegyensúlyozatlan' },
  { name: 'Korona csakra', shortName: 'Korona', emoji: '⚪', score: 7, level: 'blokkolt' },
];

export default function TestChakraOptimal() {
  const [selected, setSelected] = useState(2); // Napfonat alapból
  const [expandedView, setExpandedView] = useState(false);
  const [displayMode, setDisplayMode] = useState<'minimal' | 'inline' | 'sidebar'>('minimal');

  const blockedCount = CHAKRAS.filter(c => c.level === 'blokkolt').length;
  const imbalancedCount = CHAKRAS.filter(c => c.level === 'kiegyensúlyozatlan').length;
  const mostProblematic = CHAKRAS.sort((a, b) => a.score - b.score)[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vezérlő panel */}
      <div className="bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold text-center mb-4">Optimalizált Csakra Megjelenítések</h1>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setDisplayMode('minimal')}
            className={`px-4 py-2 rounded ${
              displayMode === 'minimal' ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            Minimális Figyelmeztetés
          </button>
          <button
            onClick={() => setDisplayMode('inline')}
            className={`px-4 py-2 rounded ${
              displayMode === 'inline' ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            Inline Navigáció
          </button>
          <button
            onClick={() => setDisplayMode('sidebar')}
            className={`px-4 py-2 rounded ${
              displayMode === 'sidebar' ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            Oldalsáv
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-4">Kedves Tesztelő Anna! 🙏</h1>
        <p className="text-gray-600">Az alábbiakban láthatod a csakráid elemzését.</p>
      </div>

      {/* MEGOLDÁS 1: Minimális Figyelmeztetés + Expandable */}
      {displayMode === 'minimal' && (
        <div className="container max-w-4xl mx-auto px-4">
          {/* Ultra-kompakt figyelmeztetés (csak 50px magas!) */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg px-4 py-2 mb-6 cursor-pointer hover:shadow-lg transition-shadow"
               onClick={() => setExpandedView(!expandedView)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl animate-pulse">⚠️</span>
                <p className="text-sm font-bold">
                  {blockedCount + imbalancedCount} csakrád igényel figyelmet!
                  <span className="ml-2 opacity-90">Kattints a részletekért →</span>
                </p>
              </div>
              <motion.div
                animate={{ rotate: expandedView ? 180 : 0 }}
                className="text-xl"
              >
                ▼
              </motion.div>
            </div>
          </div>

          {/* Expandált nézet */}
          <AnimatePresence>
            {expandedView && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white rounded-lg shadow-md p-4 mb-6 overflow-hidden"
              >
                <p className="text-sm text-gray-600 mb-3">Kattints egy csakrára a részletes elemzéshez:</p>
                <div className="flex flex-wrap gap-2">
                  {CHAKRAS.map((chakra, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelected(i);
                        setExpandedView(false);
                      }}
                      className={`
                        px-3 py-2 rounded-lg flex items-center gap-2 text-sm
                        ${selected === i ? 'bg-purple-100 ring-2 ring-purple-500' :
                          chakra.level === 'blokkolt' ? 'bg-red-50 hover:bg-red-100' :
                          chakra.level === 'kiegyensúlyozatlan' ? 'bg-orange-50 hover:bg-orange-100' :
                          'bg-green-50 hover:bg-green-100'}
                      `}
                    >
                      <span className="text-lg">{chakra.emoji}</span>
                      <span className="font-medium">{chakra.shortName}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        chakra.level === 'blokkolt' ? 'bg-red-200 text-red-800' :
                        chakra.level === 'kiegyensúlyozatlan' ? 'bg-orange-200 text-orange-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {chakra.score}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Aktív csakra tartalom */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{CHAKRAS[selected].emoji}</span>
              <div>
                <h2 className="text-2xl font-bold">{CHAKRAS[selected].name}</h2>
                <p className={`text-sm font-semibold ${
                  CHAKRAS[selected].level === 'blokkolt' ? 'text-red-600' :
                  CHAKRAS[selected].level === 'kiegyensúlyozatlan' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {CHAKRAS[selected].level === 'blokkolt' ? '⚠️ Blokkolt' :
                   CHAKRAS[selected].level === 'kiegyensúlyozatlan' ? '⚠️ Kiegyensúlyozatlan' :
                   '✅ Rendben'} ({CHAKRAS[selected].score}/16 pont)
                </p>
              </div>
            </div>
            <div className="bg-purple-50 rounded p-4">
              <p>Itt jelenne meg a részletes elemzés...</p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">Személyre Szabott Csakra Elemzés</h3>
            <p className="mb-4">Csak 990 Ft (eredeti ár: 7.990 Ft)</p>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold">
              Megrendelem →
            </button>
          </div>
        </div>
      )}

      {/* MEGOLDÁS 2: Inline Navigáció (a tartalom felett) */}
      {displayMode === 'inline' && (
        <div className="container max-w-4xl mx-auto px-4">
          {/* Kritikus infó + navigáció egyben */}
          <div className="bg-white rounded-lg shadow-md p-3 mb-6">
            {/* Figyelmeztetés sor */}
            <div className="flex items-center gap-2 text-sm mb-3 text-red-600 font-semibold">
              <span className="animate-pulse">⚠️</span>
              <span>{blockedCount} blokkolt és {imbalancedCount} kiegyensúlyozatlan csakra</span>
            </div>

            {/* Csakra választó gombok - 1 sorban, de látszik a név! */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {CHAKRAS.map((chakra, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`
                    flex-shrink-0 flex flex-col items-center p-2 rounded-lg transition-all
                    ${selected === i ?
                      'bg-purple-100 shadow-md scale-105' :
                      'hover:bg-gray-50'}
                  `}
                  style={{ minWidth: '65px' }}
                >
                  <span className="text-2xl mb-1">{chakra.emoji}</span>
                  <span className="text-xs font-medium">{chakra.shortName}</span>
                  {/* Státusz indikátor */}
                  <div className={`w-full h-1 rounded-full mt-1 ${
                    chakra.level === 'blokkolt' ? 'bg-red-500' :
                    chakra.level === 'kiegyensúlyozatlan' ? 'bg-orange-500' :
                    'bg-green-500'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* Aktív csakra részletei */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-2">
                {CHAKRAS[selected].emoji} {CHAKRAS[selected].name}
              </h2>
              <p className={`font-semibold mb-4 ${
                CHAKRAS[selected].level === 'blokkolt' ? 'text-red-600' :
                CHAKRAS[selected].level === 'kiegyensúlyozatlan' ? 'text-orange-600' :
                'text-green-600'
              }`}>
                Állapot: {CHAKRAS[selected].level} ({CHAKRAS[selected].score}/16)
              </p>
              <div className="bg-gray-50 rounded p-4">
                <p>Részletes elemzés...</p>
              </div>
            </div>

            {/* CTA mellette */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg p-6 flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-2">Teljes Csakra Elemzés</h3>
              <p className="text-3xl font-bold mb-1">990 Ft</p>
              <p className="text-sm opacity-90 line-through mb-4">7.990 Ft</p>
              <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold w-full">
                Megrendelem →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEGOLDÁS 3: Fix oldalsáv (desktop) / Alsó sáv (mobil) */}
      {displayMode === 'sidebar' && (
        <>
          {/* Desktop: Bal oldali fix sáv */}
          <div className="hidden md:block fixed left-0 top-1/2 -translate-y-1/2 z-30">
            <div className="bg-white shadow-2xl rounded-r-2xl p-2">
              {/* Minimális nézet */}
              <div className="space-y-1">
                {CHAKRAS.map((chakra, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`
                      w-14 h-14 rounded-lg flex flex-col items-center justify-center
                      hover:bg-gray-100 transition-all relative group
                      ${selected === i ? 'bg-purple-100 shadow-inner' : ''}
                    `}
                  >
                    <span className="text-2xl">{chakra.emoji}</span>
                    {/* Pontszám badge */}
                    <span className={`text-xs font-bold ${
                      chakra.level === 'blokkolt' ? 'text-red-600' :
                      chakra.level === 'kiegyensúlyozatlan' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {chakra.score}
                    </span>

                    {/* Tooltip hover-re */}
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
                                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                                    whitespace-nowrap z-50">
                      {chakra.name}
                    </div>

                    {/* Státusz pont */}
                    {chakra.level === 'blokkolt' && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </button>
                ))}
              </div>

              {/* Összesítő a végén */}
              <div className="mt-2 pt-2 border-t text-center">
                <div className="text-xs text-gray-600">
                  <span className="text-red-600 font-bold">{blockedCount}</span>
                  <span className="mx-1">+</span>
                  <span className="text-orange-600 font-bold">{imbalancedCount}</span>
                </div>
                <div className="text-xs text-gray-500">probléma</div>
              </div>
            </div>
          </div>

          {/* Mobil: Alsó fix sáv */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
            <div className="flex items-center px-2 py-2">
              {/* Figyelmeztetés ikon */}
              <div className="px-2">
                <span className="text-red-500 text-xl animate-pulse">⚠️</span>
              </div>

              {/* Csakra gombok */}
              <div className="flex-1 flex gap-1 overflow-x-auto">
                {CHAKRAS.map((chakra, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`
                      flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center
                      ${selected === i ? 'bg-purple-100' : 'bg-gray-50'}
                    `}
                  >
                    <span className="text-xl">{chakra.emoji}</span>
                    <span className={`text-xs font-bold ${
                      chakra.level === 'blokkolt' ? 'text-red-600' :
                      chakra.level === 'kiegyensúlyozatlan' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {chakra.score}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fő tartalom */}
          <div className="container max-w-4xl mx-auto px-4 md:pl-24 pb-20 md:pb-8">
            {/* Figyelmeztetés */}
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
              <p className="text-red-700 font-semibold">
                ⚠️ A {mostProblematic.emoji} {mostProblematic.name} csakrád kritikusan blokkolt!
              </p>
            </div>

            {/* Aktív csakra */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {CHAKRAS[selected].emoji} {CHAKRAS[selected].name}
              </h2>
              <p className="text-gray-600 mb-4">Részletes elemzés...</p>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Személyre Szabott Elemzés</h3>
              <p className="mb-4">990 Ft</p>
              <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold">
                Megrendelem →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Placeholder tartalom */}
      <div className="container max-w-4xl mx-auto px-4 py-12 mt-8">
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-500">További tartalom...</p>
        </div>
      </div>
    </div>
  );
}