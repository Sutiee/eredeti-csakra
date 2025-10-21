/**
 * GPT-5 Prompt Builders
 * Generates prompts for 3-phase report generation
 *
 * CRITICAL REQUIREMENTS:
 * - TEGEZŐ FORM (informal Hungarian "you" for 35+ women)
 * - 100% Hungarian language (no English terms)
 * - Empathetic, warm, spiritual tone
 * - CSAK elemzés, NINCS megoldás (analysis only, NO solutions)
 * - NO elsősegély terv mention
 */

import type { ChakraScores, ChakraName } from '@/types';
import { getChakraByName } from '@/lib/quiz/chakras';

/**
 * Phase 1: Build Master Analysis Prompt
 * Gets overall energy pattern and top priorities
 */
export function buildMasterPrompt(
  chakraScores: ChakraScores,
  userName: string
): string {
  const chakraList = Object.entries(chakraScores)
    .map(([name, score]) => `- ${name}: ${score}/16 pont`)
    .join('\n');

  return `
RENDSZER SZEREP:
Te egy tapasztalt spirituális csakra elemző vagy, aki nőknek (35+ éves) segít megérteni energetikai állapotukat.

FELADATOD:
Készíts egy átfogó összefoglalót ${userName} csakra állapotáról az alábbi pontszámok alapján.

CSAKRA PONTSZÁMOK (4-16 skála):
${chakraList}

AMIT KÉRÜNK:

1. **Összefoglaló elemzés** (400-600 karakter):
   - Milyen az általános energetikai mintázata?
   - Mely csakrák a legerősebbek/leggyengébbek?
   - Mi a fő energiaáramlási probléma?
   - Tegező formában, meleg, támogató hangnemben

2. **Fő prioritások** (pontosan 3 prioritás):
   - A 3 legfontosabb csakra, amire figyelni kell
   - Rövid (1 mondatos) indoklással mindegyikre

3. **Kialakulási okok** (400-600 karakter):
   - Milyen életmintázatok vezethettek ehhez az állapothoz?
   - Milyen múltbeli tapasztalatok okozhatták?
   - Milyen érzelmi/mentális minták láthatók?

FONTOS SZABÁLYOK:
- 100% magyar nyelv (NO English terms!)
- Tegező forma (te, neked, a tied stb.)
- Empátikus, meleg, spirituális hangnem
- CSAK ELEMZÉS - semmilyen megoldást, javaslatot vagy tennivalót NE adj!
- Személyre szabott, NEM általános klisék!
- 35+ éves nők számára optimalizálva

VÁLASZ FORMÁTUM (CSAK JSON):
{
  "osszefoglalo": "...",
  "fo_prioritasok": ["...", "...", "..."],
  "kialakulasi_okok": "..."
}
`.trim();
}

/**
 * Phase 2: Build Chakra Deep Dive Prompt
 * Gets detailed analysis for single chakra
 */
export function buildChakraPrompt(
  chakraName: ChakraName,
  score: number,
  answers: number[],
  masterContext: string
): string {
  const chakraMetadata = getChakraByName(chakraName);
  const chakraInfo = chakraMetadata
    ? `${chakraMetadata.sanskritName} - ${chakraMetadata.location} - ${chakraMetadata.element}`
    : chakraName;

  const interpretationLevel =
    score <= 7
      ? 'Erősen blokkolt'
      : score <= 12
      ? 'Kiegyensúlyozatlan'
      : 'Egészséges és kiegyensúlyozott';

  return `
RENDSZER SZEREP:
Te egy csakra szakértő vagy, aki részletes elemzéseket készít egy adott csakráról.

FELADATOD:
Készíts részletes elemzést a ${chakraName} csakráról az alábbi adatok alapján.

CSAKRA INFORMÁCIÓK:
- Név: ${chakraName}
- Pontszám: ${score}/16 pont
- Állapot: ${interpretationLevel}
- Részletek: ${chakraInfo}
- Válaszok (1-4 skála, 4 kérdés): ${answers.join(', ')}

ÁTFOGÓ KONTEXTUS:
${masterContext}

AMIT KÉRÜNK:

1. **Részletes elemzés** (200-600 karakter):
   - Milyen az aktuális állapota ennek a csakrának?
   - Hogyan nyilvánul meg a blokkoltság/kiegyensúlyozatlanság az életében?
   - Miért pont ez az állapot alakult ki?
   - Személyre szabottan, a pontszám alapján

2. **Megnyilvánulások** (8-10 konkrét tünet):
   - Fizikai: 2-4 testi tünet (pl. "Gyakori hátfájás", "Energia hiány")
   - Érzelmi: 2-4 érzelmi minta (pl. "Nehézség a döntéshozatalban", "Szorongás")
   - Mentális: 2-3 gondolati minta (pl. "Állandó aggodalom", "Önbizalom hiány")

3. **Gyökerok** (100-400 karakter):
   - Milyen életesemények, gyermekkori tapasztalatok vezethettek ide?
   - Milyen trauma vagy mintázat állhat a háttérben?
   - Személyre szabott spekuláció (empatikusan)

4. **Megerősítő mondatok** (pontosan 5 db):
   - "Én..." kezdetű affirmációk
   - Specifikusak ehhez a csakrához
   - Magyar nyelven, tegező formában
   - Példa: "Én biztonságban vagyok a testemben és a világban."

FONTOS SZABÁLYOK:
- 100% magyar nyelv
- Tegező forma
- Empátikus, meleg hangnem
- CSAK ELEMZÉS - NE adj megoldást, tennivalót vagy elsősegély tervet!
- NE említsd meg a "megoldás", "terv", "gyakorlat" szavakat!
- Személyre szabott, konkrét elemzés

VÁLASZ FORMÁTUM (CSAK JSON):
{
  "nev": "${chakraName}",
  "reszletes_elemzes": "...",
  "megnyilvánulasok": {
    "fizikai": ["...", "...", "..."],
    "erzelmi": ["...", "...", "..."],
    "mentalis": ["...", "..."]
  },
  "gyokerok": "...",
  "megerosito_mondatok": ["...", "...", "...", "...", "..."]
}
`.trim();
}

/**
 * Phase 3: Build Forecast Prompt
 * Gets 3 time-horizon predictions + positive scenario
 */
export function buildForecastPrompt(
  chakraScores: ChakraScores,
  masterSummary: string
): string {
  const chakraList = Object.entries(chakraScores)
    .map(([name, score]) => `- ${name}: ${score}/16 pont`)
    .join('\n');

  // Identify top 3 most blocked chakras
  const blockedChakras = Object.entries(chakraScores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([name, score]) => `${name} (${score}/16)`)
    .join(', ');

  return `
RENDSZER SZEREP:
Te egy spirituális előrejelző és energia elemző vagy, aki segít megérteni az energetikai állapot jövőbeli alakulását.

FELADATOD:
Készíts 3 időhorizontú előrejelzést és egy pozitív forgatókönyvet az alábbi csakra állapot alapján.

CSAKRA PONTSZÁMOK:
${chakraList}

ÁTFOGÓ ELEMZÉS:
${masterSummary}

LEGBLOKKOLABB CSAKRÁK:
${blockedChakras}

AMIT KÉRÜNK:

1. **6 hónapos előrejelzés** (400-600 karakter):
   - Ha semmi nem változik, mi fog történni 6 hónap múlva?
   - Milyen problémák mélyülhetnek el?
   - Milyen új tünetek jelenhetnek meg?
   - Realisztikus, figyelmeztető hangnem

2. **1 éves előrejelzés** (400-600 karakter):
   - Ha a jelenlegi állapot folytatódik 1 évig?
   - Milyen hosszú távú következményei lehetnek?
   - Hogyan hathat a kapcsolatokra, munkára, egészségre?
   - Komoly, de empatikus hangnem

3. **2 éves előrejelzés** (400-600 karakter):
   - Mi történhet 2 év múlva változatlan állapotban?
   - Milyen mély életváltozások várhatók?
   - Milyen krízisek vagy áttörések lehetségesek?
   - Őszinte, de támogató hangnem

4. **Pozitív forgatókönyv** (600-800 karakter):
   - Mi történne, ha odafigyel a csakráira?
   - Milyen pozitív változások várhatók?
   - Hogyan alakulna az élete 6-12 hónapon belül?
   - Inspiráló, reménykeltő hangnem
   - FONTOS: Ne adj konkrét tennivalókat, csak írd le a lehetséges állapotot!

FONTOS SZABÁLYOK:
- 100% magyar nyelv
- Tegező forma
- Empátikus, de őszinte hangnem
- CSAK ELŐREJELZÉS - NE adj megoldást vagy tennivalót!
- Realisztikus, nem félelmetes (támogató figyelmeztetés)
- Személyre szabott, konkrét leírás

VÁLASZ FORMÁTUM (CSAK JSON):
{
  "hat_honap": "...",
  "egy_ev": "...",
  "ket_ev": "...",
  "pozitiv_forgatokonyvv": "..."
}
`.trim();
}

/**
 * COMPLETE REPORT - Single API Call
 * Generates master, all 7 chakras, and forecasts in one go
 */
export function buildCompleteReportPrompt(
  chakraScores: ChakraScores,
  answers: number[],
  userName: string
): string {
  const chakraList = Object.entries(chakraScores)
    .map(([name, score]) => `- ${name}: ${score}/16 pont`)
    .join('\n');

  const chakraNames: ChakraName[] = [
    'Gyökércsakra',
    'Szakrális csakra',
    'Napfonat csakra',
    'Szív csakra',
    'Torok csakra',
    'Harmadik szem',
    'Korona csakra',
  ];

  return `
RENDSZER SZEREP:
Te egy tapasztalt spirituális csakra elemző vagy, aki TELJES KÖRŰ elemzést készít ${userName} számára.

CSAKRA PONTSZÁMOK (4-16 skála):
${chakraList}

FELADATOD:
Készíts EGY TELJES ELEMZÉST amely tartalmazza:
1. Átfogó összefoglalót
2. Mind a 7 csakra részletes elemzését
3. Előrejelzéseket 3 időhorizontra + pozitív forgatókönyvet

FONTOS SZABÁLYOK:
- 100% magyar nyelv
- Tegező forma (te, neked, a tied)
- Empátikus, meleg, spirituális hangnem
- CSAK ELEMZÉS - NE adj megoldást vagy tennivalót!
- Rövid, tömör megfogalmazás (max 400-500 karakter/szekció)

KRITIKUS: A válasz CSAK valid JSON formátumú legyen, semmi más szöveg!

KÖTELEZŐ VÁLASZ FORMÁTUM (STRICT JSON):
{
  "master": {
    "osszefoglalo": "Átfogó elemzés (200-1000 karakter)",
    "fo_prioritasok": ["Prioritás 1", "Prioritás 2", "Prioritás 3"],
    "kialakulasi_okok": "Okok leírása (200-1000 karakter)"
  },
  "chakras": [
    {
      "nev": "Gyökércsakra",
      "reszletes_elemzes": "Részletes elemzés (100-1000 karakter)",
      "megnyilvánulasok": {
        "fizikai": ["Fizikai tünet 1", "Fizikai tünet 2", "Fizikai tünet 3"],
        "erzelmi": ["Érzelmi tünet 1", "Érzelmi tünet 2", "Érzelmi tünet 3"],
        "mentalis": ["Mentális tünet 1", "Mentális tünet 2"]
      },
      "gyokerok": "Gyökérokok (50-600 karakter)",
      "megerosito_mondatok": ["Én...", "Én...", "Én...", "Én...", "Én..."]
    },
    {
      "nev": "Szakrális csakra",
      "reszletes_elemzes": "...",
      "megnyilvánulasok": { "fizikai": [...], "erzelmi": [...], "mentalis": [...] },
      "gyokerok": "...",
      "megerosito_mondatok": [...]
    }
    ... (MIND A 7 CSAKRA - Gyökércsakra, Szakrális csakra, Napfonat csakra, Szív csakra, Torok csakra, Harmadik szem, Korona csakra)
  ],
  "forecasts": {
    "hat_honap": "6 hónap előrejelzés (200-1000 karakter)",
    "egy_ev": "1 év előrejelzés (200-1000 karakter)",
    "ket_ev": "2 év előrejelzés (200-1000 karakter)",
    "pozitiv_forgatokonyvv": "Pozitív forgatókönyv (300-1200 karakter)"
  }
}

FONTOS:
- A "megnyilvánulasok" mező KÖTELEZŐ minden csakránál!
- Minden csakra objektumnak tartalmaznia KELL: nev, reszletes_elemzes, megnyilvánulasok, gyokerok, megerosito_mondatok
- Pontosan 7 csakra elemzés kell!
`.trim();
}

/**
 * Phase 2 COMBINED: Build All Chakras Prompt
 * Gets all 7 chakra analyses in a single API call
 */
export function buildAllChakrasPrompt(
  chakraScores: ChakraScores,
  answers: number[],
  masterContext: string
): string {
  const chakraNames: ChakraName[] = [
    'Gyökércsakra',
    'Szakrális csakra',
    'Napfonat csakra',
    'Szív csakra',
    'Torok csakra',
    'Harmadik szem',
    'Korona csakra',
  ];

  const chakraDataList = chakraNames.map((chakraName, index) => {
    const score = chakraScores[chakraName];
    const chakraAnswers = answers.slice(index * 4, (index + 1) * 4);
    const chakraMetadata = getChakraByName(chakraName);
    const chakraInfo = chakraMetadata
      ? `${chakraMetadata.sanskritName} - ${chakraMetadata.location} - ${chakraMetadata.element}`
      : chakraName;

    const interpretationLevel =
      score <= 7
        ? 'Erősen blokkolt'
        : score <= 12
        ? 'Kiegyensúlyozatlan'
        : 'Egészséges és kiegyensúlyozott';

    return `
## ${chakraName}
- Pontszám: ${score}/16 pont
- Állapot: ${interpretationLevel}
- Részletek: ${chakraInfo}
- Válaszok (1-4 skála): ${chakraAnswers.join(', ')}
`;
  }).join('\n');

  return `
RENDSZER SZEREP:
Te egy csakra szakértő vagy, aki egyszerre készít részletes elemzést mind a 7 csakráról.

FELADATOD:
Készíts részletes elemzést MIND A 7 CSAKRÁRÓL az alábbi adatok alapján.

ÁTFOGÓ KONTEXTUS:
${masterContext}

CSAKRÁK ADATAI:
${chakraDataList}

AMIT KÉRÜNK MINDEN CSAKRÁRA:

1. **Részletes elemzés** (200-600 karakter):
   - Milyen az aktuális állapota ennek a csakrának?
   - Hogyan nyilvánul meg a blokkoltság/kiegyensúlyozatlanság az életében?
   - Miért pont ez az állapot alakult ki?
   - Személyre szabottan, a pontszám alapján

2. **Megnyilvánulások** (8-10 konkrét tünet):
   - Fizikai: 2-4 testi tünet (pl. "Gyakori hátfájás", "Energia hiány")
   - Érzelmi: 2-4 érzelmi minta (pl. "Nehézség a döntéshozatalban", "Szorongás")
   - Mentális: 2-3 gondolati minta (pl. "Állandó aggodalom", "Önbizalom hiány")

3. **Gyökerok** (100-400 karakter):
   - Milyen életesemények, gyermekkori tapasztalások vezethettek ide?
   - Milyen trauma vagy mintázat állhat a háttérben?
   - Személyre szabott spekuláció (empatikusan)

4. **Megerősítő mondatok** (pontosan 5 db):
   - "Én..." kezdetű affirmációk
   - Specifikusak ehhez a csakrához
   - Magyar nyelven, tegező formában
   - Példa: "Én biztonságban vagyok a testemben és a világban."

FONTOS SZABÁLYOK:
- 100% magyar nyelv
- Tegező forma
- Empátikus, meleg hangnem
- CSAK ELEMZÉS - NE adj megoldást, tennivalót vagy elsősegély tervet!
- NE említsd meg a "megoldás", "terv", "gyakorlat" szavakat!
- Személyre szabott, konkrét elemzés

VÁLASZ FORMÁTUM (CSAK JSON):
{
  "chakras": [
    {
      "nev": "Gyökércsakra",
      "reszletes_elemzes": "...",
      "megnyilvánulasok": {
        "fizikai": ["...", "...", "..."],
        "erzelmi": ["...", "...", "..."],
        "mentalis": ["...", "..."]
      },
      "gyokerok": "...",
      "megerosito_mondatok": ["...", "...", "...", "...", "..."]
    },
    ... (total 7 chakras)
  ]
}
`.trim();
}
