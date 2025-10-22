/**
 * GPT-5-mini Prompt Builders for 30-Day Workbook Generation
 *
 * Constructs detailed prompts for generating personalized 30-day chakra workbook content.
 * Includes chakra score-based personalization and strict JSON structure requirements.
 *
 * Phase: v2.5 - 30 Napos Csakra Munkafüzet
 *
 * @module lib/openai/workbook-prompts-gpt5
 */

import type { ChakraScores } from '@/types';

// ============================================================================
// CHAKRA NAME MAPPING
// ============================================================================

/**
 * Maps chakra scores to Hungarian chakra names
 */
export const CHAKRA_NAMES: Record<keyof ChakraScores, string> = {
  Gyökércsakra: 'Gyökércsakra',
  'Szakrális csakra': 'Szakrális csakra',
  'Napfonat csakra': 'Napfonat csakra',
  'Szív csakra': 'Szív csakra',
  'Torok csakra': 'Torok csakra',
  'Harmadik szem': 'Harmadik szem',
  'Korona csakra': 'Korona csakra',
};

// ============================================================================
// CHAKRA DAY DISTRIBUTION CALCULATOR
// ============================================================================

/**
 * Calculates personalized day distribution based on chakra scores
 *
 * Rules:
 * - Blocked (4-7): 6-7 days
 * - Imbalanced (8-12): 4-5 days
 * - Healthy (13-16): 2-3 days
 * - Total must equal exactly 30 days
 *
 * @param chakraScores - User's chakra scores from quiz
 * @returns Chakra-to-days mapping
 */
export function calculateDaysPerChakra(
  chakraScores: ChakraScores
): Record<string, number> {
  const distribution: Record<string, number> = {};
  let totalDays = 0;

  // Categorize chakras by health level
  const blocked: string[] = [];
  const imbalanced: string[] = [];
  const healthy: string[] = [];

  Object.entries(chakraScores).forEach(([chakra, score]) => {
    if (score >= 4 && score <= 7) {
      blocked.push(chakra);
    } else if (score >= 8 && score <= 12) {
      imbalanced.push(chakra);
    } else if (score >= 13 && score <= 16) {
      healthy.push(chakra);
    }
  });

  // Assign days based on category
  // Blocked: 6-7 days (prioritize more days)
  blocked.forEach((chakra) => {
    const days = 6;
    distribution[chakra] = days;
    totalDays += days;
  });

  // Imbalanced: 4-5 days
  imbalanced.forEach((chakra) => {
    const days = 4;
    distribution[chakra] = days;
    totalDays += days;
  });

  // Healthy: 2-3 days
  healthy.forEach((chakra) => {
    const days = 2;
    distribution[chakra] = days;
    totalDays += days;
  });

  // Adjust to ensure exactly 30 days
  const remaining = 30 - totalDays;

  if (remaining > 0) {
    // Add remaining days to blocked chakras first, then imbalanced
    const priorityChakras = [...blocked, ...imbalanced];
    for (let i = 0; i < remaining && i < priorityChakras.length; i++) {
      distribution[priorityChakras[i]] += 1;
    }
  } else if (remaining < 0) {
    // Remove days from healthy chakras first, then imbalanced
    const deprioritizeChakras = [...healthy, ...imbalanced];
    let toRemove = Math.abs(remaining);
    for (let i = 0; i < toRemove && i < deprioritizeChakras.length; i++) {
      if (distribution[deprioritizeChakras[i]] > 1) {
        distribution[deprioritizeChakras[i]] -= 1;
      }
    }
  }

  return distribution;
}

// ============================================================================
// CHAKRA INTERPRETATION HELPERS
// ============================================================================

/**
 * Gets interpretation level for a chakra score
 */
function getChakraInterpretation(score: number): string {
  if (score >= 4 && score <= 7) return 'erősen blokkolt';
  if (score >= 8 && score <= 12) return 'kiegyensúlyozatlan';
  if (score >= 13 && score <= 16) return 'egészséges és kiegyensúlyozott';
  return 'ismeretlen';
}

// ============================================================================
// DAY RANGE GENERATOR
// ============================================================================

/**
 * Generates day assignments based on distribution
 *
 * Example output:
 * [
 *   { chakra: "Gyökércsakra", days: [1, 2, 3, 4, 5, 6] },
 *   { chakra: "Szakrális csakra", days: [7, 8, 9, 10] },
 *   ...
 * ]
 */
export function generateDayAssignments(
  distribution: Record<string, number>
): Array<{ chakra: string; days: number[] }> {
  const assignments: Array<{ chakra: string; days: number[] }> = [];
  let currentDay = 1;

  // Maintain chakra order (Root → Crown)
  const orderedChakras = [
    'Gyökércsakra',
    'Szakrális csakra',
    'Napfonat csakra',
    'Szív csakra',
    'Torok csakra',
    'Harmadik szem',
    'Korona csakra',
  ];

  orderedChakras.forEach((chakra) => {
    const numDays = distribution[chakra];
    if (numDays > 0) {
      const days: number[] = [];
      for (let i = 0; i < numDays; i++) {
        days.push(currentDay);
        currentDay += 1;
      }
      assignments.push({ chakra, days });
    }
  });

  return assignments;
}

// ============================================================================
// MAIN PROMPT BUILDER
// ============================================================================

/**
 * Builds GPT-5 prompt for generating 15 days of workbook content
 *
 * @param chakraScores - User's chakra scores
 * @param userName - User's first name
 * @param dayRange - "1-15" or "16-30"
 * @param distribution - Chakra day distribution
 * @returns Complete prompt string
 */
export function buildWorkbookPrompt(
  chakraScores: ChakraScores,
  userName: string,
  dayRange: '1-15' | '16-30',
  distribution: Record<string, number>
): string {
  const assignments = generateDayAssignments(distribution);

  // Determine which days this prompt covers
  const startDay = dayRange === '1-15' ? 1 : 16;
  const endDay = dayRange === '1-15' ? 15 : 30;

  // Build chakra context (score summaries)
  const chakraContext = Object.entries(chakraScores)
    .map(([chakra, score]) => {
      const interpretation = getChakraInterpretation(score);
      const days = distribution[chakra] || 0;
      return `- ${chakra}: ${score} pont (${interpretation}) → ${days} nap`;
    })
    .join('\n');

  // Build day assignment context for this range
  const relevantAssignments = assignments
    .filter((assignment) => {
      return assignment.days.some((day) => day >= startDay && day <= endDay);
    })
    .map((assignment) => {
      const daysInRange = assignment.days.filter(
        (day) => day >= startDay && day <= endDay
      );
      return `- ${assignment.chakra}: Napok ${daysInRange.join(', ')}`;
    })
    .join('\n');

  // Construct full prompt
  return `Te egy tapasztalt csakra terapeuta vagy, aki személyre szabott 30 napos csakra munkafüzetet készítesz ${userName} számára.

## FELADAT
Generálj **pontosan 15 nap** tartalmát a 30 napos csakra munkafüzethez (Napok ${startDay}-${endDay}).

## FELHASZNÁLÓ CSAKRA PONTSZÁMAI
${chakraContext}

## NAP BEOSZTÁS (ebből a ${startDay}-${endDay} napokat generáld)
${relevantAssignments}

## TARTALMI KÖVETELMÉNYEK (minden napra)

### 1. day_number
- Nap száma (${startDay} és ${endDay} között)

### 2. csakra
- A nap csakrájának pontos neve (pl. "Gyökércsakra", "Torok csakra")

### 3. napi_szandek
- Egyetlen motiváló mondat a napi fókuszról
- Tegező forma, direkt megszólítás
- **50-150 karakter** (KÖTELEZŐ)
- Példa: "Ma megtanulom elengedni a múltat és biztonságban érzem magam."

### 4. elmelet
- Rövid elméleti háttér: MIÉRT fontos ez a gyakorlat
- A csakra blokkoltságához/egészségéhez igazodva
- **200-400 karakter** (KÖTELEZŐ)
- Példa: "A Gyökércsakra a biztonságérzet központja. Amikor blokkolt, állandó szorongást érzel és nehezen bízol meg másokban. Ez a gyakorlat segít újra megtalálni a stabilitást."

### 5. gyakorlat_leiras
- Részletes, lépésenkénti gyakorlat leírás: HOGYAN csináld
- 4-5 konkrét lépés (hol, mikor, hogyan)
- **400-800 karakter** (KÖTELEZŐ)
- Példa: "1. Reggel felkelve keress egy csendes helyet, ahol 15 percig zavartalanul lehetsz. 2. Ülj le kényelmes pozícióban, lábad érintse a földet. 3. Csukd be a szemed és lélegezz mélyet 5 alkalommal. 4. Képzeld el, hogy a talpaidból gyökerek nőnek a földbe..."

### 6. journaling_kerdesek
- 3-5 önreflexiós kérdés naplózáshoz
- Közvetlen, személyes kérdések
- Példa:
  - "Mikor éreztem ma bizonytalanságot?"
  - "Mi az, ami miatt aggódom?"
  - "Hogyan érezném magam, ha teljesen biztonságban lennék?"

### 7. affirmacio
- Pozitív megerősítő mondat
- Jelen időben, első személyben
- **60-150 karakter** (KÖTELEZŐ)
- Példa: "Biztonságban vagyok. A földdel kapcsolatban állok. Megbízom az élet folyamatában."

### 8. motivacio
- Záró motiváció, bátorító üzenet
- Tegező forma, meleg hangvétel
- **80-200 karakter** (KÖTELEZŐ)
- Példa: "Emlékezz: a változás apró lépésekkel kezdődik. Ma egy kis lépést tettél a gyógyulás felé. Büszke lehetsz magadra!"

## PERSONALIZÁCIÓS SZABÁLYOK

### Blokkolt csakrák (4-7 pont):
- Hangsúlyozd a gyógyulás szükségességét
- Intenzívebb gyakorlatok (15-20 perc)
- Empátikus, támogató hangvétel
- Példa: "Tudom, hogy nehéz... de ma egy lépést teszünk..."

### Kiegyensúlyozatlan csakrák (8-12 pont):
- Figyelj a finomhangolásra
- Közepes intenzitású gyakorlatok (10-15 perc)
- Bátorító, építő jellegű
- Példa: "Már jó úton haladsz, ma még tovább erősítjük..."

### Egészséges csakrák (13-16 pont):
- Fenntartó gyakorlatok
- Rövid, megerősítő feladatok (5-10 perc)
- Elismerő hangvétel
- Példa: "Gyönyörűen egyensúlyban vagy, őrizd meg ezt..."

## NYELVI KÖVETELMÉNYEK
- **Nyelv:** 100% magyar
- **Hangvétel:** Meleg, támogató, empátikus
- **Megszólítás:** Tegező (te, neked, rád)
- **Célcsoport:** 35+ éves nők
- **Stílus:** Spirituális, de nem túlzottan ezoterikus

## JSON KIMENET FORMÁTUM

FONTOS: A válaszod **KIZÁRÓLAG** valid JSON legyen, SEMMI MÁS SZÖVEG!

{
  "days": [
    {
      "day_number": ${startDay},
      "csakra": "...",
      "napi_szandek": "...",
      "elmelet": "...",
      "gyakorlat_leiras": "...",
      "journaling_kerdesek": ["...", "...", "..."],
      "affirmacio": "...",
      "motivacio": "..."
    },
    ... (összesen 15 nap objektum)
  ]
}

## ELLENŐRZÉSI LISTA
✓ Pontosan 15 day objektum van?
✓ Minden day_number ${startDay} és ${endDay} között van?
✓ Minden szöveg 100% magyar?
✓ Karakterlimitek betartva? (napi_szandek: 50-150, elmelet: 200-400, stb.)
✓ 3-5 journaling kérdés mindenhol?
✓ Tegező forma mindenhol?
✓ Valid JSON formátum?

KEZDD EL A GENERÁLÁST!`;
}

// ============================================================================
// HELPER: FULL WORKBOOK CONTEXT BUILDER
// ============================================================================

/**
 * Builds context summary for the entire 30-day workbook
 * (used in PDF introduction page)
 *
 * @param chakraScores - User's chakra scores
 * @param userName - User's first name
 * @param distribution - Chakra day distribution
 * @returns Personalized introduction text
 */
export function buildWorkbookIntroduction(
  chakraScores: ChakraScores,
  userName: string,
  distribution: Record<string, number>
): string {
  // Find most blocked chakras
  const sortedChakras = Object.entries(chakraScores).sort(
    ([, scoreA], [, scoreB]) => scoreA - scoreB
  );

  const mostBlocked = sortedChakras
    .filter(([, score]) => score <= 7)
    .map(([chakra, score]) => `${chakra} (${score} pont)`)
    .slice(0, 2);

  const mostHealthy = sortedChakras
    .filter(([, score]) => score >= 13)
    .map(([chakra, score]) => `${chakra} (${score} pont)`)
    .slice(-2);

  let intro = `Kedves ${userName}!\n\n`;

  if (mostBlocked.length > 0) {
    intro += `Az általad kitöltött teszt alapján a következő csakrák igényelnek különösen nagy figyelmet: ${mostBlocked.join(', ')}. `;
    intro += `Ez a 30 napos program ezért több időt szentel ezeknek a területeknek - `;
    const blockedDays = mostBlocked
      .map((chakra) => {
        const name = chakra.split(' (')[0];
        return `${distribution[name]} nap`;
      })
      .join(' és ');
    intro += `${blockedDays} gyakorlásra és elmélyülésre.\n\n`;
  }

  if (mostHealthy.length > 0) {
    intro += `A ${mostHealthy.join(' és ')} viszont egészséges egyensúlyban van, így ezeken a területeken fenntartó gyakorlatokat kapsz.\n\n`;
  }

  intro += `Az elkövetkező 30 napban naponta kapsz egy személyre szabott gyakorlatot, journaling kérdéseket és affirmációkat. `;
  intro += `Minden nap egy lépéssel közelebb visz az egyensúly felé.\n\n`;
  intro += `Fontos: Ne siess! Ha egy nap kimaradt, egyszerűen folytasd másnap onnan, ahol abbahagytad. `;
  intro += `Ez a te utazásod a saját tempódban.\n\n`;
  intro += `Sok szeretettel,\nAz Eredeti Csakra Csapata`;

  return intro;
}
