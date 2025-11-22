/**
 * Light Quiz Questions
 * 7 questions (1 per chakra) designed to quickly identify the most blocked chakra
 * These are different from the full 28-question quiz to provide fresh content
 */

import type { Question } from "@/types";

/**
 * Light quiz questions - one high-impact question per chakra
 * Designed to trigger emotional recognition and create urgency
 */
export const LIGHT_QUESTIONS: Question[] = [
  // GYÖKÉRCSAKRA (Root) - Question 1
  {
    id: "light_root",
    chakra: "Gyökércsakra",
    text: "Milyen gyakran ébredsz úgy, hogy szorongás tölti el a mellkasodat a jövő miatt?",
    options: [
      { label: "Szinte minden reggel", score: 1 },
      { label: "Hetente többször", score: 2 },
      { label: "Néha előfordul", score: 3 },
      { label: "Ritkán vagy soha", score: 4 }
    ]
  },

  // SZAKRÁLIS CSAKRA (Sacral) - Question 2
  {
    id: "light_sacral",
    chakra: "Szakrális csakra",
    text: "Mikor érezted utoljára igazán élőnek és inspiráltnak magad?",
    options: [
      { label: "Nem emlékszem", score: 1 },
      { label: "Hónapokkal ezelőtt", score: 2 },
      { label: "Pár hete", score: 3 },
      { label: "A közelmúltban", score: 4 }
    ]
  },

  // NAPFONAT CSAKRA (Solar Plexus) - Question 3
  {
    id: "light_solar",
    chakra: "Napfonat csakra",
    text: "Mennyire érzed, hogy irányítod az életed fontos területeit?",
    options: [
      { label: "Kicsúszott a kezemből", score: 1 },
      { label: "Küzdök a kontrollért", score: 2 },
      { label: "Többnyire én döntök", score: 3 },
      { label: "Teljes kontrollt érzek", score: 4 }
    ]
  },

  // SZÍV CSAKRA (Heart) - Question 4
  {
    id: "light_heart",
    chakra: "Szív csakra",
    text: "Ha most magadra gondolsz, mit érzel?",
    options: [
      { label: "Csalódottságot és önkritikát", score: 1 },
      { label: "Elégedetlenséget", score: 2 },
      { label: "Elfogadást", score: 3 },
      { label: "Szeretetet és büszkeséget", score: 4 }
    ]
  },

  // TOROK CSAKRA (Throat) - Question 5
  {
    id: "light_throat",
    chakra: "Torok csakra",
    text: "Milyen gyakran nyelted már le, amit igazán mondani akartál?",
    options: [
      { label: "Folyamatosan", score: 1 },
      { label: "Gyakran", score: 2 },
      { label: "Néha", score: 3 },
      { label: "Ritkán", score: 4 }
    ]
  },

  // HARMADIK SZEM (Third Eye) - Question 6
  {
    id: "light_third_eye",
    chakra: "Harmadik szem",
    text: "Mennyire látod tisztán, merre tart az életed?",
    options: [
      { label: "Teljes ködben vagyok", score: 1 },
      { label: "Homályosan látom", score: 2 },
      { label: "Van egy irányom", score: 3 },
      { label: "Kristálytisztán látom", score: 4 }
    ]
  },

  // KORONA CSAKRA (Crown) - Question 7
  {
    id: "light_crown",
    chakra: "Korona csakra",
    text: "Mennyire érzed, hogy van értelme annak, amit csinálsz?",
    options: [
      { label: "Elveszettnek érzem magam", score: 1 },
      { label: "Keresem az értelmet", score: 2 },
      { label: "Többnyire látom", score: 3 },
      { label: "Mély értelmet érzek", score: 4 }
    ]
  }
];

/**
 * Chakra names in order (root to crown)
 */
export const CHAKRA_ORDER = [
  "Gyökércsakra",
  "Szakrális csakra",
  "Napfonat csakra",
  "Szív csakra",
  "Torok csakra",
  "Harmadik szem",
  "Korona csakra"
] as const;

/**
 * Get light question by chakra name
 */
export function getLightQuestionByChakra(chakraName: string): Question | undefined {
  return LIGHT_QUESTIONS.find((q) => q.chakra === chakraName);
}

/**
 * Total number of light questions
 */
export const TOTAL_LIGHT_QUESTIONS = LIGHT_QUESTIONS.length; // 7
