/**
 * ChakraDetailPanel Component - Example Usage
 *
 * This example demonstrates how to use the ChakraDetailPanel component
 * to display detailed chakra information.
 */

"use client";

import { useState } from 'react';
import ChakraDetailPanel from './ChakraDetailPanel';
import type { ChakraScore } from '@/types';

/**
 * Example Usage Component
 */
export default function ChakraDetailPanelExample(): JSX.Element {
  // Sample chakra data (blocked root chakra)
  const sampleChakra: ChakraScore = {
    chakra: 'Gyökércsakra',
    score: 6,
    level: 'blocked',
    interpretation: {
      status: 'Erősen blokkolt',
      summary: 'Az alapjaid meginogtak. Jelenleg valószínűleg a bizonytalanság, a félelem és egyfajta gyökértelenség érzése dominál az életedben. Nehézséget okozhat a fizikai világban való eligazodás és a pénzügyi stabilitás megteremtése.',
      manifestations: [
        'Állandó anyagi gondok, hiánytudat',
        'A test elutasítása, elhízás vagy étkezési zavarok',
        'Félelem a változástól, merevség',
        'Fizikai szinten: derékfájás, immunrendszeri problémák',
      ],
      first_aid_plan: 'Azonnali fókusz a földelésre: tölts több időt a természetben, járj mezítláb, és végezz fizikai munkát. A piros színű ételek és ruhák viselése is segíthet.',
    },
  };

  // Sample balanced heart chakra
  const balancedChakra: ChakraScore = {
    chakra: 'Szív csakra',
    score: 15,
    level: 'balanced',
    interpretation: {
      status: 'Egészséges és kiegyensúlyozott',
      summary: 'A szíved nyitott és tele van szeretettel. Képes vagy a feltétel nélküli szeretetre önmagad és mások iránt. A kapcsolataid harmonikusak, és az együttérzés természetes része az életednek.',
      manifestations: [
        'Mély és harmonikus emberi kapcsolatok',
        'Képesség a megbocsátásra és elengedésre',
        'Belső béke és nyugalom',
        'Örömteli, adakozó természet',
      ],
      first_aid_plan: 'Oszd meg ezt a szeretetet! Egy kedves szó egy idegennek, egy önkéntes munka, vagy egyszerűen csak a pozitív energiád kisugárzása a világba erősíti ezt a központot.',
    },
  };

  // State to toggle between examples
  const [showBlocked, setShowBlocked] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-center text-gray-900 mb-4">
          ChakraDetailPanel Component Example
        </h1>

        <p className="text-center text-gray-600 mb-8">
          This component displays detailed information about a selected chakra.
        </p>

        {/* Toggle Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowBlocked(!showBlocked)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold shadow-lg transition-colors duration-300"
          >
            {showBlocked ? 'Show Balanced Chakra' : 'Show Blocked Chakra'}
          </button>
        </div>

        {/* ChakraDetailPanel Component */}
        <ChakraDetailPanel
          chakra={showBlocked ? sampleChakra : balancedChakra}
          isTopBlocked={showBlocked} // Only show "most blocked" badge when showing blocked chakra
        />

        {/* Usage Instructions */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            How to Use
          </h2>

          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Props:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">chakra: ChakraScore</code> -
                  The chakra data with score, level, and interpretation
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">isTopBlocked: boolean</code> -
                  Whether this is the most blocked chakra (shows special badge)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Animated transitions when switching chakras (Framer Motion)</li>
                <li>Color-coded status indicators (Red = Blocked, Orange = Imbalanced, Green = Balanced)</li>
                <li>Four main sections: Header, Summary, Manifestations, and Action Plan</li>
                <li>Responsive design (mobile-first)</li>
                <li>Chakra-colored gradients and visual elements</li>
                <li>Optional "Most Blocked" badge</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Example Usage:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`import ChakraDetailPanel from '@/components/result/ChakraDetailPanel';

<ChakraDetailPanel
  chakra={chakraScore}
  isTopBlocked={true}
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
