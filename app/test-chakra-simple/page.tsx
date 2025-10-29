'use client';

import { useState } from 'react';

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

export default function TestChakraSimple() {
  const [selected, setSelected] = useState(2); // Napfonat alapból

  const blockedCount = CHAKRAS.filter(c => c.level === 'blokkolt').length;
  const imbalancedCount = CHAKRAS.filter(c => c.level === 'kiegyensúlyozatlan').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Fejléc */}
      <h1 className="text-3xl font-bold text-center mb-8 mt-8">
        Csakra Megjelenítés Tesztelő - Egyszerű Verzió
      </h1>

      {/* VERZIÓ 1: Kompakt státusz bar */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-xl font-bold mb-4">1. Kompakt Státusz Bar</h2>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            {/* Figyelmeztetés */}
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">⚠️</span>
              <div>
                <p className="font-bold">{blockedCount} blokkolt és {imbalancedCount} kiegyensúlyozatlan csakrád van!</p>
                <p className="text-sm text-gray-600">Kattints a csakrákra a részletekért</p>
              </div>
            </div>

            {/* Mini csakra gombok */}
            <div className="hidden md:flex gap-1">
              {CHAKRAS.map((chakra, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    hover:scale-110 transition-transform
                    ${selected === i ? 'ring-2 ring-purple-500' : ''}
                    ${chakra.level === 'blokkolt' ? 'bg-red-100' :
                      chakra.level === 'kiegyensúlyozatlan' ? 'bg-orange-100' : 'bg-green-100'}
                  `}
                  title={`${chakra.name}: ${chakra.score}/16`}
                >
                  {chakra.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Mobil gombok */}
          <div className="md:hidden mt-3 flex gap-2 overflow-x-auto">
            {CHAKRAS.map((chakra, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`
                  px-3 py-1 rounded-full text-sm whitespace-nowrap
                  ${selected === i ? 'bg-purple-600 text-white' :
                    chakra.level === 'blokkolt' ? 'bg-red-100' :
                    chakra.level === 'kiegyensúlyozatlan' ? 'bg-orange-100' : 'bg-green-100'}
                `}
              >
                {chakra.emoji} {chakra.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VERZIÓ 2: Kártyás grid */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-xl font-bold mb-4">2. Kártyás Grid</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CHAKRAS.map((chakra, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`
                bg-white rounded-lg p-3 shadow hover:shadow-lg transition-shadow
                ${selected === i ? 'ring-2 ring-purple-500' : ''}
                ${chakra.level === 'blokkolt' ? 'border-l-4 border-red-500' :
                  chakra.level === 'kiegyensúlyozatlan' ? 'border-l-4 border-orange-500' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl">{chakra.emoji}</span>
                {chakra.level === 'blokkolt' &&
                  <span className="text-xs font-bold text-red-600">Figyelj!</span>
                }
              </div>
              <p className="text-sm font-semibold">{chakra.name}</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    chakra.level === 'blokkolt' ? 'bg-red-500' :
                    chakra.level === 'kiegyensúlyozatlan' ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(chakra.score / 16) * 100}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* VERZIÓ 3: Lista nézet */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-xl font-bold mb-4">3. Lista Nézet</h2>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4 pb-3 border-b">
            <h3 className="font-bold">Csakráid állapota</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-red-600 font-bold">{blockedCount} blokkolt</span>
              <span className="text-orange-600 font-bold">{imbalancedCount} figyelmet igényel</span>
            </div>
          </div>

          <div className="space-y-2">
            {CHAKRAS.map((chakra, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`
                  w-full p-3 rounded-lg hover:bg-gray-50 flex items-center justify-between
                  ${selected === i ? 'bg-purple-50 border-l-4 border-purple-500' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{chakra.emoji}</span>
                  <div className="text-left">
                    <p className="font-semibold">{chakra.name}</p>
                    <p className="text-sm text-gray-600">{chakra.score}/16 pont</p>
                  </div>
                </div>
                <span className={`
                  px-2 py-1 rounded text-xs font-bold
                  ${chakra.level === 'blokkolt' ? 'bg-red-100 text-red-600' :
                    chakra.level === 'kiegyensúlyozatlan' ? 'bg-orange-100 text-orange-600' :
                    'bg-green-100 text-green-600'}
                `}>
                  {chakra.level === 'blokkolt' ? 'Blokkolt' :
                   chakra.level === 'kiegyensúlyozatlan' ? 'Figyelj rá' : 'OK'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kiválasztott csakra infó */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-2">
            {CHAKRAS[selected].emoji} {CHAKRAS[selected].name}
          </h2>
          <p className="text-gray-600">
            Ez a csakra jelenleg {CHAKRAS[selected].level} állapotban van.
            Pontszám: {CHAKRAS[selected].score}/16
          </p>
          <div className="mt-4 p-4 bg-purple-50 rounded">
            <p className="font-semibold">Itt jelenne meg a részletes elemzés...</p>
          </div>
        </div>
      </div>

      {/* CTA példa */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">Személyre Szabott Csakra Elemzés</h3>
          <p className="mb-4">Csak 990 Ft (eredeti ár: 7.990 Ft)</p>
          <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100">
            Megrendelem →
          </button>
        </div>
      </div>
    </div>
  );
}