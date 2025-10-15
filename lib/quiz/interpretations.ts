/**
 * Chakra Interpretations Generator
 * Generates detailed interpretations based on result.md content
 */

import type { ChakraName, ChakraScore, ChakraScores, InterpretationData } from '@/types';
import { getScoreRangeKey, getInterpretationLevel } from './scoring';

/**
 * Interpretation data structure matching result.md
 * This data is sourced from /docs/result.md
 */
type ChakraInterpretationsData = {
  title: string;
  '4-7': InterpretationData;
  '8-12': InterpretationData;
  '13-16': InterpretationData;
};

type InterpretationsDatabase = {
  [key in ChakraName]: ChakraInterpretationsData;
};

/**
 * Interpretations data from result.md
 * Embedded directly to avoid JSON import issues
 */
const interpretationsData: InterpretationsDatabase = {
  'Gyökércsakra': {
    title: 'Gyökércsakra (Muladhara) - A Stabilitás és Biztonság Központja',
    '4-7': {
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
    '8-12': {
      status: 'Kiegyensúlyozatlan',
      summary: 'A stabilitásod ingadozó. Vannak időszakok, amikor biztonságban érzed magad, de egy váratlan esemény könnyen kibillenthet az egyensúlyodból. Hajlamos lehetsz a túlzott aggodalomra a jövő miatt.',
      manifestations: [
        'Ingadozó pénzügyi helyzet',
        'Hajlam a halogatásra',
        'Nehéz kapcsolódás a jelen pillanathoz',
        'Szükség a kontrollra a biztonságérzetért',
      ],
      first_aid_plan: 'Fókuszálj a rutinok kialakítására. Egy rendszeres reggeli vagy esti szertartás (akár csak egy 5 perces nyújtás) segíthet a stabilitás érzetének megerősítésében.',
    },
    '13-16': {
      status: 'Egészséges és kiegyensúlyozott',
      summary: 'Stabil alapokon állsz. Biztonságban érzed magad a világban és a saját bőrödben is. Képes vagy magabiztosan kezelni az élet kihívásait, és bízol abban, hogy minden szükségleted ki lesz elégítve.',
      manifestations: [
        'Egészséges viszony a pénzhez és a testhez',
        'Bátorság az új dolgok kipróbálásához',
        'Erős fizikai vitalitás',
        'Képesség a jelen pillanat megélésére',
      ],
      first_aid_plan: 'Tartsd meg ezt a nagyszerű állapotot! A rendszeres testmozgás és a természettel való kapcsolat segít fenntartani ezt a harmonikus szintet.',
    },
  },
  'Szakrális csakra': {
    title: 'Szakrális Csakra (Svadhisthana) - Az Érzelmek és Kreativitás Forrása',
    '4-7': {
      status: 'Erősen blokkolt',
      summary: 'Az érzelmeid és a kreatív energiáid megrekedtek. Lehetséges, hogy elfojtod, amit érzel, vagy nehézséget okoz az öröm és az élvezetek megélése. A kapcsolataidban hiányozhat a szenvedély.',
      manifestations: [
        'Kreatív blokk, inspiráció hiánya',
        'Érzelmi ridegség vagy túláradó drámaiság',
        'Bűntudat az élvezetekkel kapcsolatban',
        'Szexuális problémák, intimitástól való félelem',
      ],
      first_aid_plan: 'Engedd meg magadnak, hogy érezz! Kezdj el egy kreatív hobbit nyomás nélkül (pl. firkálás, tánc), és fogyassz narancssárga ételeket (pl. sárgarépa, narancs).',
    },
    '8-12': {
      status: 'Kiegyensúlyozatlan',
      summary: 'Az érzelmi és kreatív áramlásod akadozik. Néha képes vagy flow-ba kerülni és megélni az érzéseidet, máskor viszont bezárulsz vagy túlzottan ragaszkodsz valamihez. A kapcsolataidban hullámzó lehet az intimitás.',
      manifestations: [
        'Függőségi hajlamok (munka, kapcsolatok, stb.)',
        'Hangulatingadozások',
        'Nehézség az érzelmi határok meghúzásában',
        'Túlzott ragaszkodás vagy elköteleződéstől való félelem',
      ],
      first_aid_plan: 'Fókuszálj a vizes elemmel való kapcsolódásra. Egy forró fürdő, úszás vagy akár csak egy pohár víz tudatos elfogyasztása segíthet az energiák áramlásában.',
    },
    '13-16': {
      status: 'Egészséges és kiegyensúlyozott',
      summary: 'Az érzelmeid szabadon és egészségesen áramlanak. Képes vagy mélyen kapcsolódni másokhoz, és a kreativitás természetes része az életednek. Élvezed az életet és annak minden örömét.',
      manifestations: [
        'Könnyed, örömteli alkotóerő',
        'Egészséges érzelmi intelligencia',
        'Képesség a mély, szenvedélyes kapcsolatokra',
        'Rugalmasság és alkalmazkodóképesség',
      ],
      first_aid_plan: 'Ünnepeld az életed! Tudatosan keress új élményeket, ízeket és kalandokat, hogy tápláld ezt a pezsgő energiát.',
    },
  },
  'Napfonat csakra': {
    title: 'Napfonat Csakra (Manipura) - Az Erő és Önbizalom Központja',
    '4-7': {
      status: 'Erősen blokkolt',
      summary: 'Hiányzik a belső erőd és az önbizalmad. Gyakran érzed magad áldozatnak, döntésképtelennek, és nehezen állsz ki magadért. A stressz könnyen legyűr, és alacsony lehet az energiaszinted.',
      manifestations: [
        'Alacsony önértékelés, önkritika',
        'Döntésképtelenség, felelősségvállalástól való félelem',
        'Passzivitás, másoknak való megfelelési kényszer',
        'Emésztési problémák, gyomorfájdalom',
      ],
      first_aid_plan: 'Tűzz ki egy apró, de elérhető célt, és valósítsd meg! A sikerélmény táplálja ezt a csakrát. A sárga szín (pl. citrom, napraforgó) viselése és a hasi légzés gyakorlása is segít.',
    },
    '8-12': {
      status: 'Kiegyensúlyozatlan',
      summary: 'Az erőd és az önbizalmad ingadozó. Néha határozott és magabiztos vagy, máskor viszont elbizonytalanodsz és átadod az irányítást. Hajlamos lehetsz a kontrollmániára vagy éppen a teljes passzivitásra.',
      manifestations: [
        'Perfekcionizmus vagy halogatás',
        'Hatalmi harcok a kapcsolatokban',
        'Túlzott versenyszellem',
        'A kritika nehéz kezelése',
      ],
      first_aid_plan: 'Gyakorold a tudatos \'nem\'-et mondást olyan dolgokra, amik nem szolgálnak téged. Ez segít visszavenni az irányítást és megerősíteni a belső határaidat.',
    },
    '13-16': {
      status: 'Egészséges és kiegyensúlyozott',
      summary: 'Rendelkezel a belső erő és a cselekvőképesség tüzével. Magabiztos vagy, tiszteled önmagad és másokat, és képes vagy felelősséget vállalni az életedért. Céltudatosan és hatékonyan haladsz előre.',
      manifestations: [
        'Egészséges önbizalom és önbecsülés',
        'Képesség a határok meghúzására',
        'Belső motiváció és tettrekészség',
        'Jó problémamegoldó képesség',
      ],
      first_aid_plan: 'Inspirálj másokat! A te kiegyensúlyozott energiád példaként szolgálhat mások számára. Oszd meg a tudásodat és a tapasztalataidat.',
    },
  },
  'Szív csakra': {
    title: 'Szív Csakra (Anahata) - A Szeretet és Kapcsolódás Központja',
    '4-7': {
      status: 'Erősen blokkolt',
      summary: 'Bezártad a szívedet. Nehézséget okoz a szeretet adása és elfogadása, a megbocsátás és az együttérzés. Magányosnak érezheted magad még egy kapcsolatban is, és falakat építesz magad köré.',
      manifestations: [
        'Kapcsolati problémák, elszigeteltség',
        'Neheztelés, régi sérelmek cipelése',
        'Félelem az elutasítástól',
        'Fizikai szinten: szív- és tüdőproblémák, magas vérnyomás',
      ],
      first_aid_plan: 'Kezdj el egy hála-naplót! Minden este írj le 3 dolgot, amiért hálás vagy aznap. Ez segít megnyitni a szívedet a pozitív dolgok felé. A zöld szín és a rózsakvarc kristály is támogat.',
    },
    '8-12': {
      status: 'Kiegyensúlyozatlan',
      summary: 'A szíved hol nyitva, hol zárva van. Képes vagy a szeretetre, de gyakran feltételekhez kötöd. Hajlamos lehetsz a túlzott önfeláldozásra vagy éppen az érzelmi távolságtartásra.',
      manifestations: [
        'Féltékenység, birtoklási vágy',
        'Társfüggőség',
        'Nehézség az egyedülléttel',
        'Túlzott adakozás, miközben magadról megfeledkezel',
      ],
      first_aid_plan: 'Gyakorold az önszeretetet. Tegyél valami jót csak magadért, anélkül, hogy bárki másnak szólnál róla. Lehet az egy finom kávé, egy séta, vagy 10 perc csend.',
    },
    '13-16': {
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
  },
  'Torok csakra': {
    title: 'Torok Csakra (Vishuddha) - Az Önkifejezés és Kommunikáció Központja',
    '4-7': {
      status: 'Erősen blokkolt',
      summary: 'Nem mered vagy nem tudod kifejezni az igazságodat. Gyakran érzed, hogy senki sem hallgat meg, és elfojtod a véleményedet, érzéseidet. Ez a blokk megakadályoz abban, hogy a valódi önmagadat mutasd a világnak.',
      manifestations: [
        'Félelem a nyilvános beszédtől',
        'Képtelenség \'nem\'-et mondani',
        'Gyakori hazugságok, pletykálkodás',
        'Fizikai szinten: torokfájás, pajzsmirigy problémák, nyaki merevség',
      ],
      first_aid_plan: 'Kezdj el naplót írni, ahol cenzúra nélkül leírhatod a gondolataidat. Ez egy biztonságos tér az önkifejezésre. Az éneklés, dúdolás (akár a zuhany alatt is) szintén oldja ezt a blokkot.',
    },
    '8-12': {
      status: 'Kiegyensúlyozatlan',
      summary: 'A kommunikációd nem mindig tiszta. Néha őszintén kiállsz magadért, máskor viszont visszahúzódsz vagy éppen túlzottan kritikussá, dominánssá válsz a beszédben. A hallgatás és a beszéd egyensúlya megbomlott.',
      manifestations: [
        'Mások félbeszakítása vagy éppen a teljes csend',
        'Kritikus, ítélkező beszédstílus',
        'Nehézség a kreatív ötletek megfogalmazásában',
        'Az érzések és gondolatok közötti ellentmondás a kommunikációban',
      ],
      first_aid_plan: 'Gyakorold a tudatos hallgatást. Egy beszélgetés során próbálj meg csak arra figyelni, amit a másik mond, anélkül, hogy a saját válaszodat fogalmaznád közben.',
    },
    '13-16': {
      status: 'Egészséges és kiegyensúlyozott',
      summary: 'A szavaid összhangban vannak a gondolataiddal és az érzéseiddel. Képes vagy tisztán, őszintén és tisztelettel kommunikálni. Kreatívan és magabiztosan fejezed ki magad, és másokat is inspirálsz ezzel.',
      manifestations: [
        'Hiteles, meggyőző kommunikáció',
        'Jó hallgatóság',
        'Kreatív önkifejezés (írás, zene, művészet)',
        'Az igazság kimondásának képessége szeretettel',
      ],
      first_aid_plan: 'Taníts és ossz meg! A tudásod és a tiszta kommunikációd segítségével emelhetsz másokat. Indíts egy blogot, tarts egy előadást, vagy csak beszélgess mélyeket a barátaiddal.',
    },
  },
  'Harmadik szem': {
    title: 'Harmadik Szem (Ajna) - Az Intuíció és Belső Bölcsesség Központja',
    '4-7': {
      status: 'Erősen blokkolt',
      summary: 'Elvesztetted a kapcsolatot a belső iránytűddel. A logikára és a külső világra támaszkodsz, miközben figyelmen kívül hagyod a megérzéseidet. Nehezen látsz át a helyzeteken, és gyakran érzed magad zavarodottnak.',
      manifestations: [
        'Az intuíció teljes figyelmen kívül hagyása',
        'Túlzott racionalitás, a spiritualitás elutasítása',
        'Nehézség a \'nagyobb kép\' meglátásában',
        'Fizikai szinten: fejfájás, migrén, látásproblémák',
      ],
      first_aid_plan: 'Kezdj el figyelni a megérzéseidre! Amikor döntést kell hoznod, a logikai érvek után kérdezd meg magadtól: \'Mit súg a hasam?\' És próbáld meg követni. A meditáció a leghatékonyabb eszköz ennek a csakrának a megnyitására.',
    },
    '8-12': {
      status: 'Kiegyensúlyozatlan',
      summary: 'Az intuíciód és a logikád harcban állnak egymással. Vannak tiszta megérzéseid, de gyakran felülbírálod őket a racionalitás nevében. Hajlamos lehetsz az ábrándozásra anélkül, hogy a földön járnál, vagy éppen túlzottan intellektualizálsz mindent.',
      manifestations: [
        'A valóságtól elrugaszkodott fantáziálás',
        'Túlanalizálás, rágódás',
        'Nehézség a jövőbeni célok vizualizálásában',
        'Zavaros álmok, alvászavarok',
      ],
      first_aid_plan: 'Vezess álomnaplót! Ébredés után azonnal írd le, amire emlékszel az álmaidból. Ez segít erősíteni a kapcsolatot a tudatalattiddal és az intuitív éneddel.',
    },
    '13-16': {
      status: 'Egészséges és kiegyensúlyozott',
      summary: 'Az intuíciód és az intellektusod harmóniában működik együtt. Bízol a belső bölcsességedben, és képes vagy tisztán látni a helyzeteket. A megérzéseid vezetnek, miközben a logikád segít a megvalósításban.',
      manifestations: [
        'Erős, megbízható intuíció',
        'Képesség a szimbólumok és jelek értelmezésére',
        'Tiszta jövőkép és céltudatosság',
        'Mentális tisztaság és fókusz',
      ],
      first_aid_plan: 'Bízz a látomásaidban! Használd ezt a tiszta belső látást arra, hogy megteremtsd a vágyott jövődet. A vizualizációs technikák most különösen hatékonyak számodra.',
    },
  },
  'Korona csakra': {
    title: 'Korona Csakra (Sahasrara) - A Spirituális Kapcsolódás Központja',
    '4-7': {
      status: 'Erősen blokkolt',
      summary: 'Elszigeteltnek érzed magad a világtól és a spiritualitástól. Lehet, hogy cinikus vagy, és az életedet céltalannak, értelmetlennek látod. Hiányzik a kapcsolatod a felsőbb éneddel és az univerzummal.',
      manifestations: [
        'A spiritualitás elutasítása, materializmus',
        'Céltalanság, egzisztenciális szorongás',
        'Elszigeteltség, magányosság érzése',
        'Depresszív hajlamok',
      ],
      first_aid_plan: 'Tölts időt csendben. Nem kell meditálnod, csak ülj le naponta 5 percre mindenféle külső inger nélkül (telefon, zene, tv). Figyeld meg a gondolataidat anélkül, hogy ítélkeznél. Ez az első lépés a belső kapcsolat felé.',
    },
    '8-12': {
      status: 'Kiegyensúlyozatlan',
      summary: 'Keresed a spirituális utadat, de még nem találtad meg a stabil kapcsolatot. Vannak mélyebb spirituális élményeid, de ezeket gyakran követi a kétség és a bizonytalanság. Hajlamos lehetsz a spirituális \'túlevésre\' (rengeteg könyv, tanfolyam) anélkül, hogy integrálnád a tanultakat.',
      manifestations: [
        'Dogmatikus nézetek, merev spiritualitás',
        'Spirituális \'bypass\' (a földi problémák elkerülése a spiritualitásba menekülve)',
        'Gyakori tanító- vagy módszerváltás',
        'A felsőbbrendűség vagy a megvilágosodás hajszolása',
      ],
      first_aid_plan: 'Válassz egyetlen spirituális gyakorlatot (pl. hála, meditáció, jóga) és köteleződj el mellette egy hónapig. A mélység most fontosabb, mint a szélesség.',
    },
    '13-16': {
      status: 'Egészséges és kiegyensúlyozott',
      summary: 'Érzed a kapcsolatot az univerzummal és a felsőbb éneddel. Tudod, hogy része vagy valami nagyobbnak, és ez békével, céllal és hálával tölt el. Az életedet a belső bölcsességed és a spirituális vezettetésed irányítja.',
      manifestations: [
        'Mély belső béke és egységélmény',
        'Az élet értelmének és céljának ismerete',
        'Univerzális szeretet és együttérzés',
        'Képesség a csodák és a szinkronicitás észlelésére',
      ],
      first_aid_plan: 'Legyél te a világítótorony! Azáltal, hogy megéled ezt a kapcsolatot, emeled a környezeted rezgését is. A te puszta jelenléted is gyógyító lehet mások számára.',
    },
  },
};

/**
 * Get interpretation data for a specific chakra and score (exported for backward compatibility)
 *
 * @param chakraName - Name of the chakra
 * @param score - Chakra score (4-16)
 * @returns Interpretation data
 */
export function getInterpretationForScore(chakraName: ChakraName, score: number): InterpretationData {
  const rangeKey = getScoreRangeKey(score);
  const chakraData = interpretationsData[chakraName];

  if (!chakraData) {
    throw new Error(`No interpretation data found for chakra: ${chakraName}`);
  }

  const interpretationData = chakraData[rangeKey];

  if (!interpretationData) {
    throw new Error(`No interpretation data found for ${chakraName} at range ${rangeKey}`);
  }

  return interpretationData;
}

/**
 * Get interpretation data for a specific chakra and score
 *
 * @param chakraName - Name of the chakra
 * @param score - Chakra score (4-16)
 * @returns Interpretation data with status, summary, manifestations, and first aid plan
 */
export function getChakraInterpretation(chakraName: ChakraName, score: number): ChakraScore {
  const rangeKey = getScoreRangeKey(score);
  const level = getInterpretationLevel(score);

  // Get interpretation data from embedded data
  const chakraData = interpretationsData[chakraName] as ChakraInterpretationsData;

  if (!chakraData) {
    throw new Error(`No interpretation data found for chakra: ${chakraName}`);
  }

  const interpretationData = chakraData[rangeKey];

  if (!interpretationData) {
    throw new Error(`No interpretation data found for ${chakraName} at range ${rangeKey}`);
  }

  return {
    chakra: chakraName,
    score,
    level,
    interpretation: interpretationData,
  };
}

/**
 * Generate full interpretations for all chakras
 *
 * @param scores - Chakra scores object
 * @returns Array of ChakraScore objects with interpretations
 */
export function generateInterpretations(scores: ChakraScores): ChakraScore[] {
  const chakraNames = Object.keys(scores) as ChakraName[];

  return chakraNames.map((chakraName) => {
    const score = scores[chakraName];
    return getChakraInterpretation(chakraName, score);
  });
}

/**
 * Get interpretation summary for all chakras (used in result page)
 *
 * @param scores - Chakra scores object
 * @returns Object with chakra names as keys and full interpretation as values
 */
export function getInterpretationsSummary(scores: ChakraScores): Record<string, ChakraScore> {
  const interpretations: Record<string, ChakraScore> = {};

  Object.entries(scores).forEach(([chakraName, score]) => {
    interpretations[chakraName] = getChakraInterpretation(chakraName as ChakraName, score);
  });

  return interpretations;
}

/**
 * Get primary issue chakras (scores 4-7, blocked)
 *
 * @param scores - Chakra scores object
 * @returns Array of chakra names that are blocked
 */
export function getPrimaryIssueChakras(scores: ChakraScores): ChakraName[] {
  return Object.entries(scores)
    .filter(([_, score]) => score >= 4 && score <= 7)
    .map(([chakraName, _]) => chakraName as ChakraName);
}

/**
 * Get imbalanced chakras (scores 8-12)
 *
 * @param scores - Chakra scores object
 * @returns Array of chakra names that are imbalanced
 */
export function getImbalancedChakras(scores: ChakraScores): ChakraName[] {
  return Object.entries(scores)
    .filter(([_, score]) => score >= 8 && score <= 12)
    .map(([chakraName, _]) => chakraName as ChakraName);
}

/**
 * Get balanced chakras (scores 13-16)
 *
 * @param scores - Chakra scores object
 * @returns Array of chakra names that are balanced
 */
export function getBalancedChakras(scores: ChakraScores): ChakraName[] {
  return Object.entries(scores)
    .filter(([_, score]) => score >= 13 && score <= 16)
    .map(([chakraName, _]) => chakraName as ChakraName);
}

/**
 * Generate overall wellness summary based on all chakra scores
 *
 * @param scores - Chakra scores object
 * @returns Wellness summary text
 */
export function generateWellnessSummary(scores: ChakraScores): string {
  const blocked = getPrimaryIssueChakras(scores);
  const imbalanced = getImbalancedChakras(scores);
  const balanced = getBalancedChakras(scores);

  if (balanced.length === 7) {
    return 'Gratulálunk! Minden csakrád kiegyensúlyozott és harmonikusan működik. Folytasd az eddigi utadat!';
  }

  if (blocked.length >= 4) {
    return 'Több csakrád is erősen blokkolt. Ne csüggedj, ez egy fontos első lépés az önismerethez. Kezdd a legalacsonyabb pontszámú csakrával, és haladj fokozatosan.';
  }

  if (blocked.length > 0) {
    return `${blocked.length} csakrád erősen blokkolt, ami a fő figyelmet igényli. A kiegyensúlyozatlan csakráid is támogatásra szorulnak, de először a blokkok oldása a prioritás.`;
  }

  if (imbalanced.length >= 4) {
    return 'A csakráid többsége ingadozó állapotban van. Jó hír, hogy nincsenek súlyos blokkok, de érdemes tudatosan dolgozni a stabilitáson.';
  }

  return 'Összességében jó úton jársz! Néhány csakrád még finomhangolásra szorul, de szilárd alapokra építkezel.';
}
