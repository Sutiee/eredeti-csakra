'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChakraScore, ChakraName } from '@/types';

// Teszt adatok - egy tipikus eredmény
const MOCK_RESULT = {
  name: 'Tesztelő Anna',
  email: 'test@example.com',
  interpretations: [
    { chakra: 'Gyökércsakra' as ChakraName, score: 6, level: 'blocked' as const },
    { chakra: 'Szakrális csakra' as ChakraName, score: 9, level: 'imbalanced' as const },
    { chakra: 'Napfonat csakra' as ChakraName, score: 5, level: 'blocked' as const },
    { chakra: 'Szív csakra' as ChakraName, score: 11, level: 'imbalanced' as const },
    { chakra: 'Torok csakra' as ChakraName, score: 14, level: 'balanced' as const },
    { chakra: 'Harmadik szem' as ChakraName, score: 8, level: 'imbalanced' as const },
    { chakra: 'Korona csakra' as ChakraName, score: 7, level: 'blocked' as const },
  ] as ChakraScore[],
};

// Chakra emoji helper
function getChakraEmoji(position: number): string {
  const emojis: Record<number, string> = {
    1: '🔴', 2: '🟠', 3: '🟡', 4: '💚', 5: '🔵', 6: '🟣', 7: '⚪'
  };
  return emojis[position] || '✨';
}

// Chakra pozíciók
const chakraPositions: Record<ChakraName, number> = {
  'Gyökércsakra': 1,
  'Szakrális csakra': 2,
  'Napfonat csakra': 3,
  'Szív csakra': 4,
  'Torok csakra': 5,
  'Harmadik szem': 6,
  'Korona csakra': 7,
};

export default function TestChakraDisplayPage() {
  const [activeChakra, setActiveChakra] = useState<ChakraName>('Napfonat csakra');
  const [displayMode, setDisplayMode] = useState<'compact' | 'progressive' | 'split' | 'floating'>('compact');

  // Számoljuk a problémás csakrákat
  const blockedCount = MOCK_RESULT.interpretations.filter(c => c.level === 'blocked').length;
  const imbalancedCount = MOCK_RESULT.interpretations.filter(c => c.level === 'imbalanced').length;
  const balancedCount = MOCK_RESULT.interpretations.filter(c => c.level === 'balanced').length;

  // Legproblémásabb csakra
  const mostBlockedChakra = MOCK_RESULT.interpretations.sort((a, b) => a.score - b.score)[0];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-spiritual-purple-50">
      {/* Vezérlő panel a teszteléshez */}
      <div className="sticky top-0 z-50 bg-gray-900 text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="font-bold text-lg mb-4 text-center">Csakra Megjelenítés Tesztelő</h1>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setDisplayMode('compact')}
              className={`px-4 py-2 rounded transition-colors ${
                displayMode === 'compact'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Kompakt Státusz Bar
            </button>
            <button
              onClick={() => setDisplayMode('progressive')}
              className={`px-4 py-2 rounded transition-colors ${
                displayMode === 'progressive'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Progressive Disclosure
            </button>
            <button
              onClick={() => setDisplayMode('split')}
              className={`px-4 py-2 rounded transition-colors ${
                displayMode === 'split'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Split Screen
            </button>
            <button
              onClick={() => setDisplayMode('floating')}
              className={`px-4 py-2 rounded transition-colors ${
                displayMode === 'floating'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Floating Pill
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section - mint az eredetiben */}
      <section className="pt-16 pb-8">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Kedves {MOCK_RESULT.name}! 🙏
            </h1>
            <p className="text-lg text-gray-600">
              Gratulálok, hogy kitöltötted a kérdőívet! Az alábbiakban láthatod a csakráid részletes elemzését.
            </p>
          </motion.div>
        </div>
      </section>

      {/* OPCIÓ 1: Kompakt Státusz Bar */}
      {displayMode === 'compact' && (
        <section className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-50 via-amber-50 to-red-50 rounded-xl p-4 shadow-md border border-red-200"
          >
            <div className="flex items-center justify-between">
              {/* Bal oldal: Figyelmeztetés */}
              <div className="flex items-center gap-3">
                <div className="text-2xl animate-pulse">⚠️</div>
                <div>
                  <p className="font-bold text-gray-900">
                    {blockedCount} blokkolt és {imbalancedCount} kiegyensúlyozatlan csakrád van!
                  </p>
                  <p className="text-sm text-gray-600">
                    Kattints a csakrákra a részletekért
                  </p>
                </div>
              </div>

              {/* Jobb oldal: Mini csakra indikátorok - Desktop */}
              <div className="hidden md:flex items-center gap-1">
                {MOCK_RESULT.interpretations.map((chakra) => {
                  const position = chakraPositions[chakra.chakra];
                  const emoji = getChakraEmoji(position);

                  return (
                    <button
                      key={chakra.chakra}
                      onClick={() => setActiveChakra(chakra.chakra)}
                      className="group relative"
                      title={`${chakra.chakra}: ${chakra.score}/16 pont`}
                    >
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-lg
                        transition-all hover:scale-110
                        ${activeChakra === chakra.chakra ? 'ring-2 ring-purple-500' : ''}
                        ${chakra.score <= 7 ? 'bg-red-100' :
                          chakra.score <= 12 ? 'bg-amber-100' : 'bg-green-100'}
                      `}>
                        {emoji}
                      </div>
                      {/* Mini státusz pont */}
                      {chakra.score <= 7 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobil: Horizontális scroll */}
            <div className="md:hidden mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {MOCK_RESULT.interpretations.map((chakra) => {
                const position = chakraPositions[chakra.chakra];
                const emoji = getChakraEmoji(position);

                return (
                  <button
                    key={chakra.chakra}
                    onClick={() => setActiveChakra(chakra.chakra)}
                    className={`
                      flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium
                      ${activeChakra === chakra.chakra ?
                        'bg-purple-600 text-white' :
                        chakra.score <= 7 ? 'bg-red-100 text-red-700' :
                        chakra.score <= 12 ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'}
                    `}
                  >
                    {emoji} {chakra.chakra}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}

      {/* OPCIÓ 2: Progressive Disclosure */}
      {displayMode === 'progressive' && (
        <>
          {/* Kritikus infó bar */}
          <div className="bg-gradient-to-r from-red-500 to-amber-500 text-white py-3 px-4">
            <div className="container mx-auto flex items-center justify-center gap-2">
              <span className="text-lg">⚠️</span>
              <p className="font-semibold text-center">
                Figyelem! {blockedCount} blokkolt és {imbalancedCount} kiegyensúlyozatlan csakrád van.
                <button
                  className="underline ml-2 hover:no-underline"
                  onClick={() => {
                    const element = document.getElementById('chakra-navigation');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Részletek →
                </button>
              </p>
            </div>
          </div>

          {/* Legproblémásabb csakra rövid összefoglalója */}
          <section className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h2 className="font-bold text-lg mb-2">
                🚨 Legsürgősebb: {mostBlockedChakra.chakra} ({mostBlockedChakra.score}/16 pont)
              </h2>
              <p className="text-gray-700 mb-3">
                Ez a csakrád erősen blokkolt állapotban van. Sürgős figyelmet igényel a testi és lelki egyensúlyod helyreállításához.
              </p>
              <button
                onClick={() => setActiveChakra(mostBlockedChakra.chakra)}
                className="text-red-600 font-semibold hover:underline"
              >
                Teljes elemzés megtekintése →
              </button>
            </div>
          </section>
        </>
      )}

      {/* OPCIÓ 3: Split Screen (Desktop only) */}
      {displayMode === 'split' && (
        <div className="container mx-auto px-4">
          <div className="md:grid md:grid-cols-5 gap-6">
            {/* Bal oldal: Fő tartalom */}
            <div className="md:col-span-3">
              {/* Itt lenne a ChakraDetailPanel */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Aktív csakra: {activeChakra}</h2>
                <p className="text-gray-600">Itt jelenne meg a részletes elemzés...</p>
              </div>

              {/* CTA közvetlenül utána */}
              <div className="bg-gradient-to-r from-purple-600 to-rose-500 text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Személyre Szabott Csakra Elemzés</h3>
                <p className="mb-4">Csak 990 Ft (eredeti ár: 7.990 Ft)</p>
                <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold">
                  Megrendelem →
                </button>
              </div>
            </div>

            {/* Jobb oldal: Csakra navigáció - STICKY */}
            <div className="md:col-span-2 mt-6 md:mt-0">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <h3 className="font-bold mb-3">Csakráid állapota</h3>
                  <div className="space-y-2">
                    {MOCK_RESULT.interpretations.map((chakra) => {
                      const position = chakraPositions[chakra.chakra];
                      const emoji = getChakraEmoji(position);

                      return (
                        <button
                          key={chakra.chakra}
                          onClick={() => setActiveChakra(chakra.chakra)}
                          className={`
                            w-full p-3 rounded-lg hover:bg-gray-50 flex items-center justify-between
                            ${activeChakra === chakra.chakra ? 'bg-purple-50 border-l-4 border-purple-500' : ''}
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{emoji}</span>
                            <span className="font-medium text-sm">{chakra.chakra}</span>
                          </div>
                          <div className={`
                            px-2 py-1 rounded-full text-xs font-bold
                            ${chakra.score <= 7 ? 'bg-red-100 text-red-600' :
                              chakra.score <= 12 ? 'bg-amber-100 text-amber-600' :
                              'bg-green-100 text-green-600'}
                          `}>
                            {chakra.score <= 7 ? 'Blokkolt' :
                             chakra.score <= 12 ? 'Figyelj rá' : 'OK'}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Összesítő */}
                  <div className="mt-4 pt-4 border-t flex justify-around text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-600">{blockedCount}</div>
                      <div className="text-xs text-gray-600">Blokkolt</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">{imbalancedCount}</div>
                      <div className="text-xs text-gray-600">Kiegyensúlyozatlan</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{balancedCount}</div>
                      <div className="text-xs text-gray-600">Rendben</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OPCIÓ 4: Floating Pill */}
      {displayMode === 'floating' && (
        <>
          <FloatingPillNav
            blockedCount={blockedCount}
            imbalancedCount={imbalancedCount}
            chakras={MOCK_RESULT.interpretations}
            activeChakra={activeChakra}
            onChakraSelect={setActiveChakra}
          />

          {/* Normál tartalom */}
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Aktív csakra: {activeChakra}</h2>
              <p className="text-gray-600">Itt jelenne meg a részletes elemzés...</p>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-rose-500 text-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Személyre Szabott Csakra Elemzés</h3>
              <p className="mb-4">Csak 990 Ft (eredeti ár: 7.990 Ft)</p>
              <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold">
                Megrendelem →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Placeholder a többi tartalomnak */}
      <div id="chakra-navigation" className="container mx-auto px-4 py-16">
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-500">Itt folytatódna a többi tartalom...</p>
          <p className="text-sm text-gray-400 mt-2">(Testimonials, FAQ, stb.)</p>
        </div>
      </div>

      {/* Sticky CTA - mint az eredetiben */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <p className="font-bold">Személyre szabott elemzés</p>
            <p className="text-sm text-gray-600">990 Ft helyett 7.990 Ft</p>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-rose-500 text-white px-6 py-3 rounded-lg font-bold">
            Megrendelem
          </button>
        </div>
      </div>
    </main>
  );
}

// Floating Pill komponens
function FloatingPillNav({
  blockedCount,
  imbalancedCount,
  chakras,
  activeChakra,
  onChakraSelect
}: {
  blockedCount: number;
  imbalancedCount: number;
  chakras: ChakraScore[];
  activeChakra: ChakraName;
  onChakraSelect: (chakra: ChakraName) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white rounded-full shadow-2xl border-2 border-red-400 px-4 py-2"
      >
        <div className="flex items-center gap-3">
          <span className="text-red-600 font-bold animate-pulse">
            ⚠️ {blockedCount + imbalancedCount} csakra igényel figyelmet
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600"
          >
            {isExpanded ? 'Bezár ×' : 'Mutasd →'}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2
                       bg-white rounded-lg shadow-xl p-3 w-[90vw] max-w-md"
          >
            <div className="grid grid-cols-7 gap-2">
              {chakras.map((chakra) => {
                const position = chakraPositions[chakra.chakra];
                const emoji = getChakraEmoji(position);

                return (
                  <button
                    key={chakra.chakra}
                    onClick={() => {
                      onChakraSelect(chakra.chakra);
                      setIsExpanded(false);
                    }}
                    className={`
                      p-2 rounded-lg hover:bg-gray-100
                      ${activeChakra === chakra.chakra ? 'ring-2 ring-purple-500' : ''}
                    `}
                    title={`${chakra.chakra}: ${chakra.score}/16`}
                  >
                    <div className="text-2xl">{emoji}</div>
                    <div className={`
                      text-xs mt-1
                      ${chakra.score <= 7 ? 'text-red-600 font-bold' :
                        chakra.score <= 12 ? 'text-amber-600' : 'text-green-600'}
                    `}>
                      {chakra.score}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}