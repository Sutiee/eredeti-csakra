/**
 * Quiz Questions Data Structure
 * 28 questions organized by 7 chakras (4 questions each)
 * Source: docs/questions.md
 */

import type { Question, PersonalField } from "@/types";

/**
 * Personal information fields for the quiz form
 */
export const PERSONAL_FIELDS: PersonalField[] = [
  {
    id: "full_name",
    label: "Név",
    type: "text",
    required: true
  },
  {
    id: "email",
    label: "E-mail cím",
    type: "email",
    required: true
  },
  {
    id: "age",
    label: "Kor",
    type: "number",
    required: false,
    min: 16,
    max: 99
  }
];

/**
 * All 28 quiz questions organized by chakra
 */
export const QUESTIONS: Question[] = [
  // GYÖKÉRCSAKRA (Root) - Questions 1-4
  {
    id: "root_1",
    chakra: "Gyökércsakra",
    text: "Amikor a pénzügyeidre gondolsz, mi az első érzésed?",
    options: [
      { label: "Állandó hiányérzet", score: 1 },
      { label: "Bizonytalanság", score: 2 },
      { label: "Rendben van", score: 3 },
      { label: "Bőség és nyugalom", score: 4 }
    ]
  },
  {
    id: "root_2",
    chakra: "Gyökércsakra",
    text: "Milyen a kapcsolatod a testeddel?",
    options: [
      { label: "Idegenkedem tőle", score: 1 },
      { label: "Elfogadom, de nem szeretem", score: 2 },
      { label: "Jóban vagyunk", score: 3 },
      { label: "Otthon érzem magam benne", score: 4 }
    ]
  },
  {
    id: "root_3",
    chakra: "Gyökércsakra",
    text: "Ha váratlan változás történik az életedben, hogyan reagálsz?",
    options: [
      { label: "Összeomlok", score: 1 },
      { label: "Nehezen alkalmazkodom", score: 2 },
      { label: "Megoldom", score: 3 },
      { label: "Izgatottan várom", score: 4 }
    ]
  },
  {
    id: "root_4",
    chakra: "Gyökércsakra",
    text: "Milyen gyakran érzed magad két lábbal a földön?",
    options: [
      { label: "Szinte soha", score: 1 },
      { label: "Ingadozó", score: 2 },
      { label: "Többnyire stabil", score: 3 },
      { label: "Mindig szilárdan állok", score: 4 }
    ]
  },

  // SZAKRÁLIS CSAKRA (Sacral) - Questions 5-8
  {
    id: "sacral_1",
    chakra: "Szakrális csakra",
    text: "Amikor utoljára valami újat alkottál, hogyan érezted magad?",
    options: [
      { label: "Kínlódás volt", score: 1 },
      { label: "Nehezen indult be", score: 2 },
      { label: "Élveztem a folyamatot", score: 3 },
      { label: "Teljesen flow-ban voltam", score: 4 }
    ]
  },
  {
    id: "sacral_2",
    chakra: "Szakrális csakra",
    text: "Hogyan éled meg az érzelmeidet?",
    options: [
      { label: "Elfojtom őket", score: 1 },
      { label: "Csak pozitívakat engedek meg", score: 2 },
      { label: "Megélem, de kontrolláltan", score: 3 },
      { label: "Szabadon áramlanak", score: 4 }
    ]
  },
  {
    id: "sacral_3",
    chakra: "Szakrális csakra",
    text: "Mi a viszonyod az élvezetekhez az életben?",
    options: [
      { label: "Bűntudatot érzek", score: 1 },
      { label: "Csak mértékkel engedem meg", score: 2 },
      { label: "Fontosnak tartom", score: 3 },
      { label: "Az élet ünneplésének része", score: 4 }
    ]
  },
  {
    id: "sacral_4",
    chakra: "Szakrális csakra",
    text: "Mennyire érzed magad vonzónak és szenvedélyesnek?",
    options: [
      { label: "Egyáltalán nem", score: 1 },
      { label: "Ritkán", score: 2 },
      { label: "Többnyire igen", score: 3 },
      { label: "Ez az alapállapotom", score: 4 }
    ]
  },

  // NAPFONAT CSAKRA (Solar Plexus) - Questions 9-12
  {
    id: "solar_1",
    chakra: "Napfonat csakra",
    text: "Mennyire vagy magabiztos a döntéseidben?",
    options: [
      { label: "Soha nem vagyok biztos", score: 1 },
      { label: "Néha bizonytalan", score: 2 },
      { label: "Általában magabiztos", score: 3 },
      { label: "Mindig biztos vagyok", score: 4 }
    ]
  },
  {
    id: "solar_2",
    chakra: "Napfonat csakra",
    text: "Hogyan kezeled a stresszt?",
    options: [
      { label: "Teljesen elnyomom", score: 1 },
      { label: "Időnként pánikolok", score: 2 },
      { label: "Törekszem kezelni", score: 3 },
      { label: "Nyugodt maradok", score: 4 }
    ]
  },
  {
    id: "solar_3",
    chakra: "Napfonat csakra",
    text: "Mennyire bírod a kihívásokat?",
    options: [
      { label: "Gyorsan feladom", score: 1 },
      { label: "Néha megpróbálkozom", score: 2 },
      { label: "Kitartó vagyok", score: 3 },
      { label: "Keresem a kihívásokat", score: 4 }
    ]
  },
  {
    id: "solar_4",
    chakra: "Napfonat csakra",
    text: "Milyen gyakran érzed erősnek az akaratodat?",
    options: [
      { label: "Nagyon ritkán", score: 1 },
      { label: "Időnként", score: 2 },
      { label: "Gyakran", score: 3 },
      { label: "Mindig", score: 4 }
    ]
  },

  // SZÍV CSAKRA (Heart) - Questions 13-16
  {
    id: "heart_1",
    chakra: "Szív csakra",
    text: "Mennyire vagy képes megbocsátani másoknak?",
    options: [
      { label: "Soha", score: 1 },
      { label: "Néha nehéz", score: 2 },
      { label: "Többnyire megbocsátok", score: 3 },
      { label: "Könnyen megbocsátok", score: 4 }
    ]
  },
  {
    id: "heart_2",
    chakra: "Szív csakra",
    text: "Mennyire érzed magad szeretetre méltónak?",
    options: [
      { label: "Egyáltalán nem", score: 1 },
      { label: "Gyakran kételkedem", score: 2 },
      { label: "Többnyire igen", score: 3 },
      { label: "Teljes mértékben", score: 4 }
    ]
  },
  {
    id: "heart_3",
    chakra: "Szív csakra",
    text: "Milyen gyakran mutatsz empátiát mások iránt?",
    options: [
      { label: "Nagyon ritkán", score: 1 },
      { label: "Néha", score: 2 },
      { label: "Gyakran", score: 3 },
      { label: "Mindig", score: 4 }
    ]
  },
  {
    id: "heart_4",
    chakra: "Szív csakra",
    text: "Mennyire élvezed a kapcsolataidat?",
    options: [
      { label: "Nem élvezem", score: 1 },
      { label: "Ingadozó", score: 2 },
      { label: "Jó", score: 3 },
      { label: "Nagyon jó", score: 4 }
    ]
  },

  // TOROK CSAKRA (Throat) - Questions 17-20
  {
    id: "throat_1",
    chakra: "Torok csakra",
    text: "Mennyire tudod őszintén kifejezni magad?",
    options: [
      { label: "Soha", score: 1 },
      { label: "Néha nehéz", score: 2 },
      { label: "Többnyire képes vagyok rá", score: 3 },
      { label: "Mindig", score: 4 }
    ]
  },
  {
    id: "throat_2",
    chakra: "Torok csakra",
    text: "Hogyan kezeled a konfliktusokat?",
    options: [
      { label: "Elkerülöm", score: 1 },
      { label: "Néha túlreagálom", score: 2 },
      { label: "Próbálok kommunikálni", score: 3 },
      { label: "Nyíltan és tisztelettel megbeszélem", score: 4 }
    ]
  },
  {
    id: "throat_3",
    chakra: "Torok csakra",
    text: "Mennyire érzed magad meghallgatottnak a kapcsolataidban?",
    options: [
      { label: "Sosem", score: 1 },
      { label: "Ritkán", score: 2 },
      { label: "Gyakran", score: 3 },
      { label: "Mindig", score: 4 }
    ]
  },
  {
    id: "throat_4",
    chakra: "Torok csakra",
    text: "Mennyire tudsz határozottan igent vagy nemet mondani?",
    options: [
      { label: "Soha", score: 1 },
      { label: "Néha bizonytalan", score: 2 },
      { label: "Gyakran", score: 3 },
      { label: "Mindig", score: 4 }
    ]
  },

  // HARMADIK SZEM (Third Eye) - Questions 21-24
  {
    id: "third_eye_1",
    chakra: "Harmadik szem",
    text: "Mennyire bízol az intuíciódban?",
    options: [
      { label: "Soha", score: 1 },
      { label: "Néha megkérdőjelezem", score: 2 },
      { label: "Többnyire bízom benne", score: 3 },
      { label: "Mindig követem", score: 4 }
    ]
  },
  {
    id: "third_eye_2",
    chakra: "Harmadik szem",
    text: "Mennyire vagy nyitott az új perspektívákra?",
    options: [
      { label: "Nem vagyok nyitott", score: 1 },
      { label: "Inkább ellenállok", score: 2 },
      { label: "Nyitott vagyok", score: 3 },
      { label: "Aktívan keresem azokat", score: 4 }
    ]
  },
  {
    id: "third_eye_3",
    chakra: "Harmadik szem",
    text: "Mennyire érzed, hogy világosak a céljaid?",
    options: [
      { label: "Soha nem világosak", score: 1 },
      { label: "Időnként tisztulnak", score: 2 },
      { label: "Többnyire világosak", score: 3 },
      { label: "Mindig világosak", score: 4 }
    ]
  },
  {
    id: "third_eye_4",
    chakra: "Harmadik szem",
    text: "Milyen gyakran foglalkozol önreflexióval?",
    options: [
      { label: "Nagyon ritkán", score: 1 },
      { label: "Időnként", score: 2 },
      { label: "Gyakran", score: 3 },
      { label: "Mindig", score: 4 }
    ]
  },

  // KORONA CSAKRA (Crown) - Questions 25-28
  {
    id: "crown_1",
    chakra: "Korona csakra",
    text: "Mennyire érzed magad kapcsolatban a környezeteddel/egésszel?",
    options: [
      { label: "Soha", score: 1 },
      { label: "Néha", score: 2 },
      { label: "Gyakran", score: 3 },
      { label: "Mindig", score: 4 }
    ]
  },
  {
    id: "crown_2",
    chakra: "Korona csakra",
    text: "Mennyire érzed, hogy része vagy egy nagyobb tervnek/értelemnek?",
    options: [
      { label: "Nem hiszek benne", score: 1 },
      { label: "Kételkedem", score: 2 },
      { label: "Hiszek benne", score: 3 },
      { label: "Biztos vagyok benne", score: 4 }
    ]
  },
  {
    id: "crown_3",
    chakra: "Korona csakra",
    text: "Mennyire vagy hálás a mindennapokért?",
    options: [
      { label: "Soha", score: 1 },
      { label: "Ritkán", score: 2 },
      { label: "Gyakran", score: 3 },
      { label: "Mindig", score: 4 }
    ]
  },
  {
    id: "crown_4",
    chakra: "Korona csakra",
    text: "Milyen gyakran meditálsz vagy csendesedsz el?",
    options: [
      { label: "Soha", score: 1 },
      { label: "Ritkán", score: 2 },
      { label: "Gyakran", score: 3 },
      { label: "Mindig", score: 4 }
    ]
  }
];

/**
 * Get questions by chakra name
 */
export function getQuestionsByChakra(chakraName: string): Question[] {
  return QUESTIONS.filter((q) => q.chakra === chakraName);
}

/**
 * Get question by ID
 */
export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

/**
 * Get total number of questions
 */
export const TOTAL_QUESTIONS = QUESTIONS.length; // 28
