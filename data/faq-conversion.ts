/**
 * Conversion-Focused FAQ for Result Page
 *
 * 7 strategically crafted questions to address objections,
 * build trust, and create urgency for the personalized report purchase.
 *
 * Categories:
 * - benefits: Why chakra work matters
 * - urgency: Time-sensitive motivation
 * - product: What's included
 * - trust: Credibility and accessibility
 */

export type FAQItem = {
  id: number;
  question: string;
  answer: string;
  category: 'benefits' | 'urgency' | 'product' | 'trust';
};

export const faqConversionItems: FAQItem[] = [
  {
    id: 1,
    question: "Miért fontos a csakrák harmonizálása?",
    answer: "A blokkolt csakrák hatása messze túlmutat a spirituális dimenzión. Amikor egy csakra energiaáramlása elakad, az konkrét fizikai tünetekben jelentkezhet: krónikus fáradtság, alvászavarok, emésztési problémák vagy tartós feszültség. Mentálisan szorongást, döntésképtelenséget, önbizalomhiányt okozhat. Kapcsolatainkban pedig érzelmi távolságként, kommunikációs nehézségként vagy ismétlődő konfliktusokként mutatkozik meg. A harmonikus csakrarendszer viszont biztosítja azt az energetikai alapot, ami nélkül sem egészség, sem boldogság nem valósulhat meg igazán.",
    category: 'benefits',
  },
  {
    id: 2,
    question: "Mennyi idő alatt látok eredményt?",
    answer: "A legtöbb nő már 2-3 hét rendszeres gyakorlás után észrevehető változásokat tapasztal. Például a gyökércsakra erősítésével javul az alvásminőség és csökken a szorongás. A torokcsakra felszabadításával könnyebbé válik az őszinte kommunikáció. A szívcsakra nyitásával mélyülnek a kapcsolatok. A kulcs a következetesség: napi 10-15 perces gyakorlással a kezdeti eredmények akár 1 hét alatt is megmutatkozhatnak, míg a mélyebb átalakulás 4-6 hét alatt bontakozik ki. A személyre szabott elemzésedben olyan gyakorlatokat kapsz, amelyek pontosan a TE blokkjaidra fókuszálnak, így gyorsabb eredményt érhetsz el.",
    category: 'trust',
  },
  {
    id: 3,
    question: "Mi történik, ha nem oldok fel egy blokkolt csakrát?",
    answer: "A blokkolt csakrák nem javulnak maguktól – sőt, idővel súlyosbodnak. 6 hónap múlva: az enyhe fáradtság kimerültséggé válik, az alkalmankénti szorongás napi küzdelemmé. 1 év múlva: a blokkok domino effektust indítanak – egy blokkolt torokcsakra elnyomhatja a szívcsakrát is, érzelmi kiégéshez vezetve. 2 év múlva: a tartós energetikai kiegyensúlyozatlanság krónikus fizikai betegségekben, súlyos mentális problémákban vagy teljesen tönkrement kapcsolatokban csúcsosodhat ki. Azok a nők, akik most lépnek, gyakran mesélnek arról, hogy \"bárcsak korábban elkezdtem volna\" – mert minden nap, amit vársz, egy nap a gyógyulásból.",
    category: 'urgency',
  },
  {
    id: 4,
    question: "Hogyan működik a személyre szabott elemzés?",
    answer: "Az elemzés a te egyedi kvíz válaszaidon alapul – nincs két egyforma jelentés. Pontosan látod, hogy melyik csakráid blokkoltak, mi okozza ezt, és mi történik, ha most nem lépsz. A rendszer részletesen elemzi az energetikai állapotod, és egy 7 napos, napi bontású akciótervet állít össze, ami konkrét gyakorlatokat tartalmaz: meditációkat, affirmációkat, mozgásgyakorlatokat és táplálkozási tanácsokat. Minden gyakorlat a TE csakrajaidra van szabva, így nem kell hetekig kísérletezned, hogy mi működik – azonnal a lényegre koncentrálhatsz.",
    category: 'product',
  },
  {
    id: 5,
    question: "Miért csak 2,990 Ft most?",
    answer: "Ez egy bevezető akció azoknak, akik most készek elkezdeni a változást. A teljes személyre szabott elemzés normál ára 7,990 Ft lenne – amit az egyedi tartalom, a részletes elemzés és a konkrét gyakorlati útmutató bőven megér. De célom, hogy minél több nő hozzáférjen az eszközökhöz, amire szüksége van. Ez az ár csak most, ezen az oldalon érhető el, és bármikor visszavonhatom. Ha most lépsz, befektetsz önmagadba – egy éttermi ebéd áráért kapod meg azt a tudást, ami évekig szolgál majd.",
    category: 'urgency',
  },
  {
    id: 6,
    question: "Bárki használhatja, vagy kell hozzá előképzettség?",
    answer: "Egyáltalán nem kell hozzá semmiféle előképzettség vagy spirituális tapasztalat! A személyre szabott elemzés kifejezetten azoknak készült, akik most kezdik a csakrákkal való tudatos munkát. Minden fogalmat érthetően elmagyarázunk, minden gyakorlat részletes, lépésről lépésre útmutatóval érkezik. Nincs bonyolult teória, nincs ezoterikus zsargon – csak tiszta, gyakorlatias tudás, amit azonnal alkalmazhatsz. Ha nyitott vagy a fejlődésre és érzed, hogy valami több kellene az életedben, akkor pontosan neked szól ez az elemzés.",
    category: 'trust',
  },
  {
    id: 7,
    question: "Mit tartalmaz pontosan az elemzés?",
    answer: "A személyre szabott PDF elemzés teljes körű útmutató a csakrák harmonizálásához. Tartalmazza: (1) Részletes elemzés minden egyes csakrádról – mi okozza a blokkot, milyen élethelyzetekből ered. (2) Időbeli következmények – mit tapasztalsz 6 hónap, 1 év és 2 év múlva, ha nem lépsz. (3) 7 napos akcióterv – napi bontásban, konkrét gyakorlatokkal (meditációk, affirmációk, mozgások). (4) Életstílus tanácsok – táplálkozás, színterápia, aromaterápia a csakrajaidhoz szabva. (5) Hosszú távú fenntartási terv – hogyan maradj egyensúlyban a jövőben. Mindez egy könnyen érthető, szép formázású PDF-ben, amit azonnal letölthetsz és bármikor újraolvashatod.",
    category: 'product',
  },
];

/**
 * Helper function to get FAQs by category
 */
export function getFAQsByCategory(category: FAQItem['category']): FAQItem[] {
  return faqConversionItems.filter(item => item.category === category);
}

/**
 * Helper function to get all FAQ categories
 */
export function getFAQCategories(): Array<FAQItem['category']> {
  return ['benefits', 'urgency', 'product', 'trust'];
}
