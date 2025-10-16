/**
 * Generate Meditation Scripts
 *
 * Generates 7 personalized meditation scripts (one per chakra) using OpenAI GPT-4.
 * Each script is tailored to help unblock and heal a specific chakra.
 *
 * Usage:
 *   npm run generate-meditation-scripts
 *
 * Output:
 *   Creates 7 text files in public/meditations/scripts/
 */

import OpenAI from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chakra metadata
const CHAKRAS = [
  {
    key: 'root',
    name: 'Gyökércsakra',
    nameEn: 'Root Chakra',
    sanskrit: 'Muladhara',
    color: 'vörös',
    position: 'a gerinc alján',
    element: 'föld',
    keywords: ['biztonság', 'stabilitás', 'földi gyökerek', 'túlélés', 'fizikai test'],
    focus: 'A fizikai biztonságérzet, a megélhetés, a földdel való kapcsolat megerősítése.',
  },
  {
    key: 'sacral',
    name: 'Szakrális csakra',
    nameEn: 'Sacral Chakra',
    sanskrit: 'Svadhisthana',
    color: 'narancssárga',
    position: 'az alhasi területen',
    element: 'víz',
    keywords: ['kreativitás', 'érzelmek', 'szexualitás', 'öröm', 'flow'],
    focus: 'Az érzelmek szabad áramlása, a kreativitás felszabadítása, az öröm megengedése.',
  },
  {
    key: 'solar',
    name: 'Napfonat csakra',
    nameEn: 'Solar Plexus Chakra',
    sanskrit: 'Manipura',
    color: 'sárga',
    position: 'a gyomortájékon',
    element: 'tűz',
    keywords: ['erő', 'önbizalom', 'akarat', 'személyes hatalom', 'cselekvés'],
    focus: 'A személyes erő visszaszerzése, az önbizalom építése, a határok kijelölése.',
  },
  {
    key: 'heart',
    name: 'Szív csakra',
    nameEn: 'Heart Chakra',
    sanskrit: 'Anahata',
    color: 'zöld/rózsaszín',
    position: 'a szív tájékán',
    element: 'levegő',
    keywords: ['szeretet', 'együttérzés', 'megbocsátás', 'harmónia', 'kapcsolat'],
    focus: 'A szeretet befogadása és kisugárzása, a múltbeli sérelmek gyógyítása, az önszeretet gyakorlása.',
  },
  {
    key: 'throat',
    name: 'Torok csakra',
    nameEn: 'Throat Chakra',
    sanskrit: 'Vishuddha',
    color: 'kék',
    position: 'a torok tájékán',
    element: 'éter',
    keywords: ['kommunikáció', 'igazság', 'önkifejezés', 'kreativitás', 'hitelesség'],
    focus: 'Az őszinte önkifejezés megengedése, az igazság kimondása, a belső hang meghallása.',
  },
  {
    key: 'third_eye',
    name: 'Harmadik szem',
    nameEn: 'Third Eye Chakra',
    sanskrit: 'Ajna',
    color: 'indigó',
    position: 'a homlok közepén',
    element: 'fény',
    keywords: ['intuíció', 'bölcsesség', 'látásmód', 'belső tudás', 'képzelet'],
    focus: 'Az intuíció erősítése, a belső látás fejlesztése, a magasabb tudatosság elérése.',
  },
  {
    key: 'crown',
    name: 'Korona csakra',
    nameEn: 'Crown Chakra',
    sanskrit: 'Sahasrara',
    color: 'lila/fehér',
    position: 'a fejtetőn',
    element: 'éter/gondolat',
    keywords: ['spiritualitás', 'összekapcsoltság', 'transzcendencia', 'egység', 'tudatosság'],
    focus: 'A spirituális kapcsolat mélyítése, az egységtudat megtapasztalása, a felsőbb énnel való kapcsolódás.',
  },
];

async function generateMeditationScript(chakra: typeof CHAKRAS[0]): Promise<string> {
  console.log(`🧘 Generating meditation script for ${chakra.name}...`);

  const prompt = `Írj egy 3-4 perces vezetett meditációs szöveget a ${chakra.name} (${chakra.sanskrit}, ${chakra.nameEn}) gyógyítására és harmonizálására.

**Csakra részletei:**
- **Pozíció**: ${chakra.position}
- **Szín**: ${chakra.color}
- **Elem**: ${chakra.element}
- **Kulcsszavak**: ${chakra.keywords.join(', ')}
- **Fókusz**: ${chakra.focus}

**A meditáció követelményei:**

1. **Hangnem**: Nyugodt, empátikus, spirituális. 35+ éves nők számára készül, akik önfejlesztéssel, spiritualitással foglalkoznak.

2. **Struktúra** (3-4 perc):
   - **0:00-0:30** - Bevezetés (helyzetbe hozás, légzés)
   - **0:30-1:00** - A csakra lokalizálása (figyelem irányítása a ${chakra.position})
   - **1:00-2:30** - Vezetett vizualizáció (${chakra.color} fény, ${chakra.element} elem, energiaáramlás)
   - **2:30-3:30** - Megerősítő affirmációk (${chakra.keywords.join(', ')})
   - **3:30-4:00** - Lezárás (köszönetnyilvánítás, visszavezetés)

3. **Stílus**:
   - Magyar nyelvű, természetes folyamatos szöveg (NEM kell időbélyeg)
   - Kimondható formában (ahogy a narrátor elmondja)
   - Tartalmazza a szüneteket ("...vegyél egy mély lélegzetet...", "hagyd, hogy ez az érzés megtöltsön...")
   - Személyes megszólítás (te/téged/neked forma)
   - Vizualizációs elemek (színek, fények, érzések)

4. **Tartalmi elemek**:
   - Konkrét vizualizáció: ${chakra.color} színű fény/energia ${chakra.position}
   - Az ${chakra.element} elem megjelenítése metaforikusan
   - 3-5 megerősítő affirmáció beépítve a szövegbe (pl. "Érzékeld, ahogy ${chakra.keywords[0]} betölt...")
   - A csakra feloldásának érzete (meleg, tágulás, áramlás)

5. **NE legyen benne**:
   - Túl szakmai/tudományos hang
   - Túl ezoterikus/bonyolult fogalmak
   - Időbélyegek, címek, feliratok
   - Instrukciók a narrátornak (csak a tiszta szöveg)

**Példa stílus** (NE másold le, csak a hangnemet vedd át):

"Telepedj le kényelmesen... Engedd, hogy a tested teljesen ellazuljon... Vegyél egy mély lélegzetet, és lassan engedd ki... Irányítsd most a figyelmedet a szív tájékára... Képzeld el, ahogy egy gyöngéd, zöld fény kezd kibomlani ebből a pontból... Ez a fény a szeretet energiája..."

**Most generáld a ${chakra.name} meditációs szövegét** (kimondható, folyamatos szöveg, 3-4 perc hosszúságban):`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'Te egy tapasztalt meditációs coach vagy, aki spirituális, gyógyító meditációkat készít magyar nyelven. A szövegeid természetesek, nyugtatóak, és mélyen személyesek.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const script = completion.choices[0].message.content?.trim() || '';

  console.log(`✅ Generated ${script.length} characters for ${chakra.name}`);

  return script;
}

async function main() {
  console.log('🌟 Meditation Script Generator');
  console.log('================================\n');

  // Validate API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in .env.local');
    process.exit(1);
  }

  // Create output directory
  const outputDir = join(process.cwd(), 'public', 'meditations', 'scripts');
  await mkdir(outputDir, { recursive: true });
  console.log(`📁 Output directory: ${outputDir}\n`);

  // Generate scripts for all 7 chakras
  for (const chakra of CHAKRAS) {
    try {
      const script = await generateMeditationScript(chakra);

      // Save to file
      const filename = `${chakra.key}.txt`;
      const filepath = join(outputDir, filename);
      await writeFile(filepath, script, 'utf-8');

      console.log(`💾 Saved: ${filename}`);
      console.log(`   Length: ${script.length} characters`);
      console.log(`   Words: ~${script.split(/\s+/).length} words\n`);

      // Rate limiting (avoid OpenAI API throttling)
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Error generating ${chakra.name}:`, error);
    }
  }

  console.log('\n✨ All meditation scripts generated successfully!');
  console.log(`📂 Scripts saved to: ${outputDir}`);
  console.log('\n📋 Next steps:');
  console.log('1. Review the generated scripts in public/meditations/scripts/');
  console.log('2. Edit if needed (adjust tone, length, affirmations)');
  console.log('3. Run: npm run generate-meditation-audio');
}

main().catch(console.error);
