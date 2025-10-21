/**
 * Test PDF Formatting with Cached GPT-5 Data
 * This script tests PDF generation without calling GPT-5 API
 */

import { generateReportPDF } from '@/lib/pdf/report-template-gpt5';
import type { CompleteReport } from '@/lib/openai/schemas-gpt5';
import type { ChakraScores } from '@/types';
import fs from 'fs';

// Sample chakra scores (blocked chakras: root, sacral, solar plexus, throat)
const sampleChakraScores: ChakraScores = {
  'Gyökércsakra': 8,
  'Szakrális csakra': 10,
  'Napfonat csakra': 7,
  'Szív csakra': 12,
  'Torok csakra': 9,
  'Harmadik szem': 11,
  'Korona csakra': 14,
};

// Cached GPT-5 report with Hungarian text including ő, ű characters
const cachedReport: CompleteReport = {
  master: {
    osszefoglalo: 'Mária energetikai térképe vegyes egyensúlyt mutat: a felső csakrák erősebb harmadik szem, míg az alapvető stabilitás és személyes hatalom terén finomhangolás szükséges. Ez a mintázat arra utal, hogy erős intuíciód és spirituális törekvéseid vannak, de a földi biztonság terén holtidők lehetnek. Az érzelmi nyitottságod jó, különösen empátiát és kapcsolódást, miközben a napfonat és gyökér területek némi megerősítést igényelnek az önérvényesítés és stabilitás érdekében.',
    fo_prioritasok: [
      'Földeltség és biztonságérzet megerősítése',
      'Személyes hatalom és önbizalom tónusának kiegyensúlyozása',
      'Kommunikáció és belső tisztaság harmonizálása',
    ],
    kialakulasi_okok: 'A felső csakrák erőssége gyakran hosszú belső keresés, olvasás, meditációs gyakorlatok eredménye. A gyökér és napfonat gyengébb pontjai mögött gyakran állhatnak fiatalkori bizonytalanságok, gyakori változások, anyagi aggályok vagy elismerés hiánya. A szív erős volta mutat természetes hajlamot az empátiára; a torok és szakrális középértékek arra mutatnak, hogy a kreatív és kommunikációs kifejezés részben nyitott, de időnként visszafogott.',
  },
  chakras: [
    {
      nev: 'Gyökércsakra',
      reszletes_elemzes: 'Pontszám 8/16: közepesen kiegyensúlyozott, de ingadozások jellemzők. Érzékenység van anyagi stabilitás kérdéseire; a tested és a hétköznapi valóság kapcsolata nem mindig zökkenőmentes; fáradtság és bizonytalanság érzés bukkan fel, különösen stressz alatt.',
      megnyilvánulasok: {
        fizikai: ['Fáradtság', 'Ízületi fájdalom', 'Gyenge immunrendszer'],
        erzelmi: ['Bizonytalanság', 'Anyagi aggodalom', 'Létbizonytalanság'],
        mentalis: ['Koncentrációs nehézség', 'Túlzott aggodalom', 'Döntésképtelenség'],
      },
      gyokerok: 'Gyökércélú kihívások hátterében lehet korai életbizonytalanság, költözések vagy anyagi aggályok, illetve a testi szükségletek háttérbe szorítása a lelki keresés miatt.',
      megerosito_mondatok: [
        'Én biztonságban vagyok a jelenben.',
        'Én megengedem magamnak a pihenést és gyógyulást.',
        'Én stabil alapokat építek belső erőmből.',
        'Én értékelem testem jelzéseit.',
        'Én megérdemlem az anyagi biztonságot.',
      ],
    },
    {
      nev: 'Szakrális csakra',
      reszletes_elemzes: 'Pontszám 10/16: viszonylag kiegyensúlyozott kreativitás és érzelmi rugalmasság. A szenvedély és öröm jelen van, de néha fékezett, különösen ha szerelem vagy kreatív önkifejezés kerül szóba. Kapcsolataidban váltakozó intenzitás figyelhető meg.',
      megnyilvánulasok: {
        fizikai: ['Hormonális egyensúlyhiány', 'Menstruációs problémák', 'Derékfájás'],
        erzelmi: ['Érzelmi ingadozás', 'Kreatív blokk', 'Kapcsolati nehézség'],
        mentalis: ['Önkifejezési gátlás', 'Perfekcionizmus', 'Élvezeti képtelenség'],
      },
      gyokerok: 'Szakrális diszharmónia mögött állhatnak érzelmi elnyomások, korábbi párkapcsolati sebek, vagy a kreatív önkifejezés korlátozottsága gyermek- vagy fiatalkorban.',
      megerosito_mondatok: [
        'Én megengedem magamnak az örömöt.',
        'Én tisztelem érzelmeimet és vágyaimat.',
        'Én biztonságosan kifejezhetem szenvedélyemet.',
        'Én kreatív energiáimhoz kapcsolódom.',
        'Én elfogadom érzékenységemet.',
      ],
    },
    {
      nev: 'Napfonat csakra',
      reszletes_elemzes: 'Pontszám 7/16: a legalacsonyabb értéked, ami önértékelési és személyes erő kihívásokra utal. Hajlamosság belső bizonytalanságra, önkorlátozó hiedelmekre és nehézségekre az önérvényesítésben. A döntés ereje ingadozik.',
      megnyilvánulasok: {
        fizikai: ['Gyomor-bélrendszeri problémák', 'Emésztési zavarok', 'Hasi görcsök'],
        erzelmi: ['Alacsony önbizalom', 'Perfekcionizmus', 'Kudarcfélem'],
        mentalis: ['Döntésképtelenség', 'Önkritika', 'Kontrollmánia'],
      },
      gyokerok: 'Napfonat gyengeségek gyakran gyermekkori kritika, elutasítás vagy olyan tapasztalatok következményei, ahol önmagad érvényesítése negatív visszajelzést kapott.',
      megerosito_mondatok: [
        'Én értékes vagyok önmagamért.',
        'Én képes vagyok dönteni és cselekedni.',
        'Én vállalom személyes erőmet békével.',
        'Én elfogadom hibáimat tanulásként.',
        'Én megengedem magamnak a siker érzését.',
      ],
    },
    {
      nev: 'Szív csakra',
      reszletes_elemzes: 'Pontszám 12/16: erős empátia és szeretet kifejeződése jellemző. Nyitottság jellemez, könnyen kötődsz másokhoz. Ugyanakkor néha túlzott önfeladás vagy határproblémák előfordulnak, amikor mások szükségleteit helyezed előre.',
      megnyilvánulasok: {
        fizikai: ['Légzési nehézség', 'Szívdobogásérzés', 'Mellkasi feszültség'],
        erzelmi: ['Túlzott empátia', 'Határproblémák', 'Önfeladás'],
        mentalis: ['Mások elvárásainak megfelelés', 'Önszeretet hiánya', 'Bűntudat'],
      },
      gyokerok: 'Erős szívenergiád mögött támogató kapcsolatok, korai érzelmi kötődések és ápolás áll, amelyek megtanítottak szeretni és átadni magad a kapcsolódásnak.',
      megerosito_mondatok: [
        'Én szeretettel közelítek önmagamhoz és másokhoz.',
        'Én megengedem a szeretet befogadását.',
        'Én tartom és tisztelem a saját határaimat.',
        'Én együttérzéssel viszonyulok a világhoz.',
        'Én kapcsolódok békés szívvel.',
      ],
    },
    {
      nev: 'Torok csakra',
      reszletes_elemzes: 'Pontszám 9/16: a kommunikációd általában működik, de néha visszatartott vagy félénk. Van vágy az őszinte kifejezésre, de félsz a reakcióktól, ezért inkább szűrt vagy kivárt formában kommunikálsz.',
      megnyilvánulasok: {
        fizikai: ['Torokfájás', 'Rekedtség', 'Pajzsmirigy problémák'],
        erzelmi: ['Visszafogottság', 'Félelem az ítélettől', 'Kommunikációs szorongás'],
        mentalis: ['Önkifejezési nehézség', 'Igazság elrejtése', 'Passzív kommunikáció'],
      },
      gyokerok: 'Torokkihívások gyakran abból erednek, hogy korábban elnyomták a véleményed, vagy megtanultad, hogy a hangodnak következményei vannak, így megtanultad visszatartani magad.',
      megerosito_mondatok: [
        'Én kifejezem igazamat tisztelettel.',
        'Én engedem szavakat találni a belső igazságomra.',
        'Én hangom valódi és értékes.',
        'Én nyitottan hallgatok és beszélek.',
        'Én megengedem az őszinte kifejezést.',
      ],
    },
    {
      nev: 'Harmadik szem',
      reszletes_elemzes: 'Pontszám 11/16: erős intuíció és belső látás jellemző. Jó belső meglátásaid vannak, látod a mögöttes mintákat és szimbolikát. Néha túl sokan járnak a gondolataid, ami zavart okozhat a konkrét döntésekben.',
      megnyilvánulasok: {
        fizikai: ['Fejfájás', 'Szemmegerőltetés', 'Alvászavar'],
        erzelmi: ['Túlgondolás', 'Intuíciótól való félelem', 'Túlérzékenység'],
        mentalis: ['Analízis-bénulás', 'Fantázia-valóság összekeveredés', 'Koncentrációs nehézség'],
      },
      gyokerok: 'Harmadik szem erősség hátterében gyakran áll mély önreflexió, sok belső munka és élénk emlékképek, amelyek a jelent mélyebb értelmezésére tanítottak.',
      megerosito_mondatok: [
        'Én bízhatok belső bölcsességemben.',
        'Én tisztán látom belső igazságaimat.',
        'Én hallgatom meg az intuícióm hangját.',
        'Én értelmezem az élet jeleit békével.',
        'Én engedem a belső képeket vezetni.',
      ],
    },
    {
      nev: 'Korona csakra',
      reszletes_elemzes: 'Pontszám 14/16: nagyon erős spirituális kapcsolat és nyitottság transzcendens tapasztalatokra. A spiritualitásod és magas perspektívád segít értelmezni az életed nagyobb összefüggéseit. Néha azonban a túlzott elvonulás a mindennapi realitástól megtörténhet.',
      megnyilvánulasok: {
        fizikai: ['Fényérzékenység', 'Fejtetői nyomásérzés', 'Energiaérzékenység'],
        erzelmi: ['Spirituális kapcsolódás', 'Egységérzés', 'Transzcendens élmények'],
        mentalis: ['Magas perspektíva', 'Filozófiai gondolkodás', 'Bölcsességkeresés'],
      },
      gyokerok: 'Koronaerősség kialakulhat intenzív spirituális élményekből, tanulmányokból vagy élethelyzetekből, amelyek a létezés nagyobb értelmére irányították a figyelmedet.',
      megerosito_mondatok: [
        'Én kapcsolódom a felsőbb bölcsességhez.',
        'Én befogadom a transzcendens útmutatást.',
        'Én érzem az egység és egészség jelenlétét.',
        'Én hálás vagyok a belső világomért.',
        'Én nyitott vagyok a magasabb látásra.',
      ],
    },
  ],
  forecasts: {
    hat_honap: 'A következő 6 hónapban finom belső rendeződés várható. A korona és harmadik szem felismeréseket hozhatnak, míg a napfonat és gyökér időnként kihívást jelentenek. Kapcsolataidban a szív támogatása erős lesz, de előfordulhat, hogy gyakori önértékelési bizonytalanságod lesz.',
    egy_ev: 'Egy éven belül lehetőség nyílik a földi alapok és személyes hatalom tudatos fejlesztésére. Az intuíciós felismerésekből születő változások formálják a cselekvést. Intuíciód és spiritualitásod mélyül, miközben a gyakorlati élettel való összehangolás próbálkozásai jelennek meg.',
    ket_ev: 'Két év távlatában a mintázat stabilizálódhat: ha a gyakorlati stabilitás fokozódik, a felső csakrák tudatosabb, de földhöz kötöttebb kifejeződést nyernek. A személyes erőd erősödik, és érzelmi kapcsolataid érettebbé válhatnak.',
    pozitiv_forgatokonyvv: 'Optimista jövőképben a spirituális felismerések és intuíciód integrálódnak a gyakorlati életbe: erősebb alapok, stabil döntések és növekvő önbizalom jellemzik a napfonat és gyökér területeket. Kapcsolataid mélyülnek, kreativitásod virágzik, kommunikációd tisztább és magabiztosabb lesz. A korona és harmadik szem energiái inspirálnak, miközben a szív melegsége egyensúlyt teremt; ez egy harmonikus integráció, növekedés és béke állapotát mutatja, ahol a spirituális bölcsesség gyakorlati eredményekkel találkozik és hosszabb távú stabilitást hoz.',
  },
};

async function testPDFFormatting() {
  console.log('🧪 Testing PDF Formatting with Cached Data...\n');

  console.log('📊 Using cached GPT-5 report');
  console.log('  User: Teszt Mária');
  console.log('  Email: maria@teszt.hu\n');

  console.log('⏳ Generating PDF with current formatting...');
  const startTime = Date.now();

  const pdfBuffer = await generateReportPDF(
    cachedReport,
    sampleChakraScores,
    'Teszt Mária',
    'maria@teszt.hu'
  );

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Save PDF
  const outputPath = '/Users/szabolaszlo/Library/CloudStorage/SynologyDrive-DRIVE/Appok/EredetiCsakra/test-formatting.pdf';
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log('✅ PDF generated in ' + duration + 's\n');
  console.log('📊 Statistics:');
  console.log('  PDF Size: ' + (pdfBuffer.length / 1024).toFixed(2) + ' KB');
  console.log('  Output File: ' + outputPath + '\n');

  console.log('🎉 Test PDF saved successfully!');
  console.log('Open it with: open ' + outputPath);
}

testPDFFormatting().catch(console.error);
