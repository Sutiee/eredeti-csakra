/**
 * Testimonials Data
 * Eredeti Csakra - User Success Stories
 *
 * 9 testimonials total:
 * - 6 for landing page (grid/carousel display)
 * - 3 for inter-quiz breaks (after questions 7, 14, 21)
 */

export type LandingTestimonial = {
  id: number;
  name: string;
  age: number;
  chakra: string;
  theme: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  beforeAfter: {
    before: string;
    after: string;
  };
  image?: string; // Optional profile image URL
};

export type InterQuizTestimonial = {
  id: number;
  position: 'after_question_7' | 'after_question_14' | 'after_question_21';
  name: string;
  age: number;
  chakra: string;
  title: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  gradient: string; // Tailwind gradient class
};

// Landing Page Testimonials (6 total)
export const landingTestimonials: LandingTestimonial[] = [
  {
    id: 1,
    name: "Anna",
    age: 42,
    chakra: "Torokcsakra",
    theme: "Kommunikáció",
    quote: "3 hónap után végre megértettem, miért nem tudtam kimondani az érzéseimet. A torokcsakra elemzés megnyitotta a szemem. Most már nem félek az igazam kimondásától.",
    rating: 5,
    beforeAfter: {
      before: "Zárkózott, visszahúzódó",
      after: "Nyílt kommunikáció, határozottság"
    }
  },
  {
    id: 2,
    name: "Eszter",
    age: 38,
    chakra: "Napfonat csakra",
    theme: "Önbizalom",
    quote: "A személyre szabott gyakorlatok konkrétan használhatók voltak. Nem spirituális klisék, hanem valódi eszközök. Az önbizalmam az egekbe szökött!",
    rating: 5,
    beforeAfter: {
      before: "Bizonytalan döntésekben",
      after: "Magabiztos, határozott"
    }
  },
  {
    id: 3,
    name: "Katalin",
    age: 51,
    chakra: "Harmadik szem",
    theme: "Intuíció",
    quote: "Az összefüggéseket mutatva végre értem, miért blokkolnak bizonyos területeim évek óta. A megérzéseim most már tiszták, mint a kristály.",
    rating: 5,
    beforeAfter: {
      before: "Fejében 'zaj'",
      after: "Tiszta belső tudás"
    }
  },
  {
    id: 4,
    name: "Réka",
    age: 35,
    chakra: "Szívcsakra",
    theme: "Szeretet & Kapcsolatok",
    quote: "A szív csakrám blokkja miatt évekig nem tudtam újra szeretni a válás után. Ez a teszt megmutatta az utat a gyógyuláshoz. Hálás vagyok!",
    rating: 5,
    beforeAfter: {
      before: "Zárkózott szív",
      after: "Nyitott, szeretetteljes kapcsolatok"
    }
  },
  {
    id: 5,
    name: "Mónika",
    age: 46,
    chakra: "Gyökércsakra",
    theme: "Biztonság & Pénzügyek",
    quote: "Nem gondoltam volna, hogy az anyagi bizonytalanságom a gyökércsakrámból ered. Az elsősegély terv konkrét lépésekkel segített stabilizálni az életem.",
    rating: 5,
    beforeAfter: {
      before: "Anyagi káosz",
      after: "Stabil alapok, tervezhetőség"
    }
  },
  {
    id: 6,
    name: "Judit",
    age: 40,
    chakra: "Szakrális csakra",
    theme: "Kreativitás & Érzelmek",
    quote: "Az érzelmeim évekig elfojtva voltak. A szakrális csakra gyakorlatok segítettek újra alkotni, érezni, élni. A kreativitásom visszatért!",
    rating: 5,
    beforeAfter: {
      before: "Érzelmileg kiégett",
      after: "Kreatív, lüktető életenergia"
    }
  }
];

// Inter-Quiz Testimonials (3 total - after questions 7, 14, 21)
export const interQuizTestimonials: InterQuizTestimonial[] = [
  {
    id: 7,
    position: 'after_question_7',
    name: "Anna",
    age: 42,
    chakra: "Gyökércsakra",
    title: "Találd meg a biztonságod!",
    quote: "Évekig a bizonytalanság rabja voltam. A gyökércsakra elemzés után végre megértettem: a stabilitás belülről jön, nem a külső körülményektől.\n\n3 hónap elteltével már nem félek a holnaptól. Az alapjaim szilárdak, a pénzügyi döntéseim magabiztosak. Ez az első lépés megváltoztatta az életem.",
    rating: 5,
    gradient: "from-red-500 via-rose-400 to-orange-400" // Gyökércsakra → Szakrális átmenet
  },
  {
    id: 8,
    position: 'after_question_14',
    name: "Eszter",
    age: 38,
    chakra: "Napfonat csakra",
    title: "Az erőd már benned van!",
    quote: "Mindig másoknak akartam megfelelni. A napfonat csakra teszt feltárta: az erőm sosem múlt el, csak mások véleményétől tettem függővé.\n\nMa már tudom, ki vagyok, és nem kérek engedélyt senkitől, hogy az legyek. Az önbizalmam visszatért - most már magamért élek.",
    rating: 5,
    gradient: "from-yellow-500 via-amber-400 to-green-400" // Napfonat → Szív átmenet
  },
  {
    id: 9,
    position: 'after_question_21',
    name: "Katalin",
    age: 51,
    chakra: "Harmadik szem",
    title: "Bízz a belső hangodban!",
    quote: "A megérzéseim mindig jók voltak, de sosem mertem rájuk hallgatni. A harmadik szem elemzés megerősített: az intuícióm nem véletlen, hanem ajándék.\n\nAzóta minden fontos döntésemet a belső tudásomra alapozom. A hibáim száma csökkent, az életem áramlik. Végre hallgatok magamra.",
    rating: 5,
    gradient: "from-purple-500 via-indigo-400 to-violet-300" // Harmadik Szem → Korona átmenet
  }
];
