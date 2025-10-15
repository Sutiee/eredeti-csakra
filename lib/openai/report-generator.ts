/**
 * OpenAI Report Generator
 * Generates personalized chakra analysis using GPT-4o-mini
 */

import { openai, OPENAI_MODEL } from "./client";
import { logger } from "@/lib/utils/logger";
import type { ChakraName, ChakraScores } from "@/types";
import { getInterpretationLevel } from "@/lib/quiz/scoring";

/**
 * Generated report data structure
 */
export type GeneratedReportData = {
  chakra_connections: Record<ChakraName, string>;
  first_aid_plans: Record<
    ChakraName,
    {
      step1: string;
      step2: string;
      step3: string;
    }
  >;
  weekly_plan: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  meditation_recommendations: {
    morning: string[];
    evening: string[];
  };
};

/**
 * Generate personalized report using GPT-4o-mini
 *
 * @param name - User's name
 * @param chakraScores - Chakra scores (4-16 for each chakra)
 * @returns Generated report data
 */
export async function generateDetailedReport(
  name: string,
  chakraScores: ChakraScores
): Promise<GeneratedReportData> {
  logger.info("Generating detailed report with GPT-4o-mini", {
    name,
    chakraScores,
  });

  // Calculate interpretation levels for each chakra
  const chakraLevels: Record<ChakraName, string> = {} as Record<
    ChakraName,
    string
  >;

  (Object.keys(chakraScores) as ChakraName[]).forEach((chakra) => {
    const score = chakraScores[chakra];
    const level = getInterpretationLevel(score);
    const levelText =
      level === "blocked"
        ? "Erősen blokkolt"
        : level === "imbalanced"
        ? "Kiegyensúlyozatlan"
        : "Egészséges";
    chakraLevels[chakra] = levelText;
  });

  // Build the prompt
  const prompt = buildPrompt(name, chakraScores, chakraLevels);

  try {
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Te egy empatikus, tapasztalt energiaterapeuta és csakra szakértő vagy. A feladatod személyre szabott, részletes és kivitelezhető csakra elemzések készítése.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Parse JSON response
    const reportData = JSON.parse(content) as GeneratedReportData;

    logger.info("Report generated successfully", {
      usage: response.usage,
      model: response.model,
    });

    return reportData;
  } catch (error) {
    logger.error("Failed to generate report", { error });
    throw new Error(`Report generation failed: ${error}`);
  }
}

/**
 * Build the GPT-4o-mini prompt
 */
function buildPrompt(
  name: string,
  chakraScores: ChakraScores,
  chakraLevels: Record<ChakraName, string>
): string {
  return `
Szerepkör: Energiaterapeuta és csakra szakértő

Feladat: Generálj személyre szabott csakra elemzést a következő adatok alapján:

**Felhasználó neve**: ${name}

**Csakra pontszámok és állapotok**:
${Object.entries(chakraScores)
  .map(([chakra, score]) => `- ${chakra}: ${score}/16 pont (${chakraLevels[chakra as ChakraName]})`)
  .join("\n")}

**Kérlek generálj**:

1. **Összefüggések térképe** (minden csakrára):
   - Miért van ez az állapot?
   - Hogyan kapcsolódik más csakrákhoz?
   - Mi az energiaáramlás mintázata?
   - 2-3 mondatos, konkrét elemzés

   Példa: "A torokcsakrád azért blokkolt, mert a szakrális csakrádból nem jön elég érzelmi energia. A napfonat csakrád túlműködik, ami azt jelenti, hogy az erővel próbálod kompenzálni a hiányzó önkifejezést."

2. **3 lépéses Elsősegély Terv** (minden blokkolt/kiegyensúlyozatlan csakrára):
   - **1. lépés**: Azonnali gyakorlat (konkrét, egyszerű, 1-2 mondat)
   - **2. lépés**: Napi rutin (fenntartható, 1-2 mondat)
   - **3. lépés**: Hosszú távú stratégia (mély gyógyulás, 1-2 mondat)

   Példa:
   - 1. lépés: "Minden reggel gyakorold a tükör előtt: mondj ki hangosan egy igazságot magadról, amit eddig visszatartottál."
   - 2. lépés: "Vezess naplót: írj le minden este 3 dolgot, amit aznap nem mertél kimondani, és írd meg, mit mondtál volna helyette."
   - 3. lépés: "Csatlakozz egy beszédklubhoz vagy terápiás csoporthoz, ahol biztonságos környezetben gyakorolhatod a hiteles kifejezést."

3. **Heti Gyakorlati Cselekvési Terv** (7 nap):
   - Minden napra 1 konkrét gyakorlat (1-2 mondat)
   - Fókusz a legblokkolabb csakrákon
   - Variáció és progresszió a hét során
   - Példa: "Hétfő: Földelő gyakorlat - járj mezítláb 15 percet a természetben, és képzeld el, hogy gyökerek nőnek a lábadból a földbe."

4. **Személyre Szabott Meditációs Ajánlások**:
   - Reggeli meditációs témák (3-5 téma, pl. "Földelő meditáció", "Napfelkelte mantra")
   - Esti meditációs témák (3-5 téma, pl. "Harmadik szem aktiváló vizualizáció", "Korona csakra megnyitás")

**Stílus**:
- Empátikus, támogató hangnem
- Konkrét, kivitelezhető tanácsok (NEM általános spirituális klisék!)
- Magyar nyelv, szakszerű de közérthető
- 35+ éves nők közönségnek optimalizálva

**FONTOS**: A válaszod CSAK JSON formátumú legyen, semmi más szöveg! A JSON struktúra:

{
  "chakra_connections": {
    "Gyökércsakra": "...",
    "Szakrális csakra": "...",
    "Napfonat csakra": "...",
    "Szív csakra": "...",
    "Torok csakra": "...",
    "Harmadik szem": "...",
    "Korona csakra": "..."
  },
  "first_aid_plans": {
    "Gyökércsakra": {
      "step1": "...",
      "step2": "...",
      "step3": "..."
    },
    "Szakrális csakra": { ... },
    "Napfonat csakra": { ... },
    "Szív csakra": { ... },
    "Torok csakra": { ... },
    "Harmadik szem": { ... },
    "Korona csakra": { ... }
  },
  "weekly_plan": {
    "monday": "...",
    "tuesday": "...",
    "wednesday": "...",
    "thursday": "...",
    "friday": "...",
    "saturday": "...",
    "sunday": "..."
  },
  "meditation_recommendations": {
    "morning": ["...", "...", "..."],
    "evening": ["...", "...", "..."]
  }
}
`.trim();
}
