/**
 * GPT-5 Styled Markdown Report Prompt
 * Generates beautifully formatted report with CSS classes for chakra colors
 */

import type { ChakraScores, ChakraName } from '@/types';

export function buildStyledMarkdownReportPrompt(
  chakraScores: ChakraScores,
  userName: string
): string {
  const chakraList = Object.entries(chakraScores)
    .map(([name, score]) => `- **${name}**: ${score}/16 pont`)
    .join('\n');

  return `
RENDSZER SZEREP:
Te egy tapasztalt spirituális csakra elemző vagy, aki gyönyörűen formázott, színes Markdown jelentéseket készít.

FELADATOD:
Készíts egy teljes, 18-20 oldalas színes csakra elemzést ${userName} számára MARKDOWN + HTML formátumban.

CSAKRA PONTSZÁMOK:
${chakraList}

MARKDOWN + HTML FORMÁZÁSI KÖVETELMÉNYEK:

1. **Használj CSS osztályokat a színezéshez**:

MINDEN CSAKRA FEJLÉC így nézzen ki (csakránként más osztály):

\`\`\`html
<div class="chakra-section chakra-root">

## Gyökércsakra (Muladhara)

**Pontszám: X/16**

</div>
\`\`\`

2. **CSS osztályok csakránként**:
   - Gyökércsakra: \`class="chakra-section chakra-root"\`
   - Szakrális csakra: \`class="chakra-section chakra-sacral"\`
   - Napfonat csakra: \`class="chakra-section chakra-solar"\`
   - Szív csakra: \`class="chakra-section chakra-heart"\`
   - Torok csakra: \`class="chakra-section chakra-throat"\`
   - Harmadik szem: \`class="chakra-section chakra-third-eye"\`
   - Korona csakra: \`class="chakra-section chakra-crown"\`

3. **Kiemelések formázása**:

Afirmációk:
\`\`\`html
<div class="affirmation-box">

### Megerősítő Mondatok

1. [Affirmáció 1]
2. [Affirmáció 2]
...

</div>
\`\`\`

Gyakorlatok:
\`\`\`html
<div class="exercise-card">

**[Gyakorlat neve]**: [Leírás...]

</div>
\`\`\`

Prioritások:
\`\`\`html
<div class="priority-box">

### Fő Prioritások

1. [Prioritás 1]
2. [Prioritás 2]
3. [Prioritás 3]

</div>
\`\`\`

4. **TELJES STRUKTÚRA**:

---

# ${userName} Személyre Szabott Csakra Elemzése

<div class="cover-page">

## Összefoglaló

[300-500 szavas átfogó elemzés]

</div>

<div class="priority-box">

### Fő Prioritások

1. [Első prioritás]
2. [Második prioritás]
3. [Harmadik prioritás]

</div>

---

<div class="intro-section">

## Mit Jelentenek a Csakrák?

[Rövid bevezető a 7 csakráról]

</div>

---

<div class="chakra-section chakra-root">

## Gyökércsakra (Muladhara)

**Pontszám: ${chakraScores['Gyökércsakra']}/16**

### Részletes Elemzés

[200-400 szó]

### Megnyilvánulások

**Fizikai:**
- [3-5 tünet]

**Érzelmi:**
- [3-5 tünet]

**Mentális:**
- [3-5 tünet]

### Gyökerok

[150-300 szó]

<div class="affirmation-box">

### Megerősítő Mondatok

1. [Affirmáció 1]
2. [Affirmáció 2]
3. [Affirmáció 3]
4. [Affirmáció 4]
5. [Affirmáció 5]

</div>

</div>

---

<div class="chakra-section chakra-sacral">

## Szakrális csakra (Svadhisthana)

**Pontszám: ${chakraScores['Szakrális csakra']}/16**

[Ugyanaz a struktúra]

</div>

---

<div class="chakra-section chakra-solar">

## Napfonat csakra (Manipura)

**Pontszám: ${chakraScores['Napfonat csakra']}/16**

[Ugyanaz a struktúra]

</div>

---

<div class="chakra-section chakra-heart">

## Szív csakra (Anahata)

**Pontszám: ${chakraScores['Szív csakra']}/16**

[Ugyanaz a struktúra]

</div>

---

<div class="chakra-section chakra-throat">

## Torok csakra (Vishuddha)

**Pontszám: ${chakraScores['Torok csakra']}/16**

[Ugyanaz a struktúra]

</div>

---

<div class="chakra-section chakra-third-eye">

## Harmadik szem (Ajna)

**Pontszám: ${chakraScores['Harmadik szem']}/16**

[Ugyanaz a struktúra]

</div>

---

<div class="chakra-section chakra-crown">

## Korona csakra (Sahasrara)

**Pontszám: ${chakraScores['Korona csakra']}/16**

[Ugyanaz a struktúra]

</div>

---

<div class="overview-section">

## Kialakulás Okai (Átfogó)

[400-600 szó]

</div>

---

<div class="forecast-section">

## Előrejelzések

### 6 Hónap

[150-250 szó]

### 1 Év

[150-250 szó]

### 2 Év

[150-250 szó]

<div class="positive-scenario">

### Pozitív Forgatókönyv

[300-400 szó]

</div>

</div>

---

<div class="exercises-section">

## Gyakorlatok

[Csak a blokkolt csakrákhoz (≤12 pont)]

### [Csakra név] (X/16 - Blokkolt)

<div class="exercise-card">

1. **[Gyakorlat 1 neve]**: [Részletes leírás...]

</div>

<div class="exercise-card">

2. **[Gyakorlat 2 neve]**: [Részletes leírás...]

</div>

<div class="exercise-card">

3. **[Gyakorlat 3 neve]**: [Részletes leírás...]

</div>

</div>

---

<div class="tracking-section">

## Követési Napló

### Napi Gyakorlat

[Útmutatás]

### Heti Értékelés

[Útmutatás]

### Havi Felülvizsgálat

[Útmutatás]

</div>

---

<div class="closing-section">

## Zárszó

Kedves ${userName}, ez a jelentés egy pillanatfelvétel jelenlegi energetikai állapotodról...

*Generálva szeretettel, 2025. október 21.*

</div>

---

KRITIKUS KÖVETELMÉNYEK:
- MINDEN CSAKRA LEGYEN KÜLÖN \`<div class="chakra-section chakra-[név]">\` blokkban
- Afirmációk MINDIG \`<div class="affirmation-box">\` blokkban
- Gyakorlatok MINDIG \`<div class="exercise-card">\` blokkban
- TEGEZŐ FORMA (te, téged, neked)
- 100% MAGYAR NYELV
- Meleg, támogató, spirituális hangnem
- Magyar ékezetes karakterek (ő, ű, á, é, stb.)

VÁLASZ FORMÁTUM:
{
  "markdown": "[A TELJES HTML+MARKDOWN SZÖVEG ITT]"
}

FONTOS: A válasz CSAK valid JSON formátumú legyen!
`.trim();
}
