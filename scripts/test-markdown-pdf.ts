/**
 * Test Markdown → PDF Pipeline with Cached Data
 * Tests new PDF generation without calling GPT-5 API
 */

import { convertMarkdownToPDF } from '@/lib/pdf/markdown-to-pdf';
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

// Cached Markdown report with Hungarian characters including ő, ű
const cachedMarkdownReport = `
# Teszt Mária Személyre Szabott Csakra Elemzése

## Összefoglaló

Mária energetikai térképe vegyes egyensúlyt mutat: a felső csakrák erős harmadik szem és korona energiát mutatnak, míg az alapvető stabilitás és személyes hatalom terén finomhangolás szükséges. Ez a mintázat arra utal, hogy erős intuíciód és spirituális törekvéseid vannak, de a földi biztonság terén holtidők lehetnek. Az érzelmi nyitottságod jó, különösen empátiát és kapcsolódást tekintve, miközben a napfonat és gyökér területek némi megerősítést igényelnek az önérvényesítés és stabilitás érdekében.

### Fő Prioritások

1. Földeltség és biztonságérzet megerősítése
2. Személyes hatalom és önbizalom tónusának kiegyensúlyozása
3. Kommunikáció és belső tisztaság harmonizálása

---

## Mit Jelentenek a Csakrák?

A csakrák energiaközpontok a tested mentén, amelyek összekötik fizikai, érzelmi és spirituális síkjaidat. **A Gyökércsakra** (Muladhara) a túlélés és biztonság alapja. **A Szakrális csakra** (Svadhisthana) az érzelmek és kreativitás forrása. **A Napfonat csakra** (Manipura) a személyes erő központja. **A Szív csakra** (Anahata) a szeretet és kapcsolódás helye. **A Torok csakra** (Vishuddha) az őszinte kifejezés kapuja. **A Harmadik szem** (Ajna) az intuíció és belső látás központja. **A Korona csakra** (Sahasrara) a spirituális kapcsolat csúcsa.

---

## Gyökércsakra (Muladhara)

**Pontszám: 8/16**

### Részletes Elemzés

Pontszám 8/16: közepesen kiegyensúlyozott, de ingadozások jellemzők. Érzékenység van anyagi stabilitás kérdéseire; a tested és a hétköznapi valóság kapcsolata nem mindig zökkenőmentes; fáradtság és bizonytalanság érzés bukkan fel, különösen stressz alatt. A gyökércsakra blokkja gyakran bizonytalan alapokat, elfojtott túlélési félelmeket és a földi léthez való kapcsolat gyengeségét mutatja.

### Megnyilvánulások

**Fizikai:**
- Fáradtság és energiahiány még pihenés után is
- Ízületi fájdalom, különösen lábakban és térdekben
- Gyenge immunrendszer, gyakori megbetegedések

**Érzelmi:**
- Bizonytalanság érzés az élethelyzet stabilitásával kapcsolatban
- Anyagi aggodalom és túlélési félelem
- Létbizonytalanság, nehézség a jelenben maradásban

**Mentális:**
- Koncentrációs nehézség mindennapi feladatoknál
- Túlzott aggodalom a jövő miatt
- Döntésképtelenség gyakorlati kérdésekben

### Gyökerok

Gyökércélú kihívások hátterében lehet korai életbizonytalanság, költözések vagy anyagi aggályok, illetve a testi szükségletek háttérbe szorítása a lelki keresés miatt. Gyakran gyermekkori tapasztalatok formálják ezt a területet.

### Megerősítő Mondatok

1. Én biztonságban vagyok a jelenben.
2. Én megengedem magamnak a pihenést és gyógyulást.
3. Én stabil alapokat építek belső erőmből.
4. Én értékelem testem jelzéseit.
5. Én megérdemlem az anyagi biztonságot.

---

## Szakrális csakra (Svadhisthana)

**Pontszám: 10/16**

### Részletes Elemzés

Pontszám 10/16: viszonylag kiegyensúlyozott kreativitás és érzelmi rugalmasság. A szenvedély és öröm jelen van, de néha fékezett, különösen ha szerelem vagy kreatív önkifejezés kerül szóba. Kapcsolataidban váltakozó intenzitás figyelhető meg. Ez a csakra a női energia, a folyékonyság és az élvezetek őrzője.

### Megnyilvánulások

**Fizikai:**
- Hormonális egyensúlyhiány
- Menstruációs problémák vagy szabálytalanságok
- Derékfájás, alsó hát területén

**Érzelmi:**
- Érzelmi ingadozás, hangulatváltozások
- Kreatív blokk, nehézség az önkifejezésben
- Kapcsolati nehézség, kötődési problémák

**Mentális:**
- Önkifejezési gátlás kreatív területeken
- Perfekcionizmus, amely blokkolja a spontaneitást
- Élvezeti képtelenség, bűntudat az öröm érzésekor

### Gyökerok

Szakrális diszharmónia mögött állhatnak érzelmi elnyomások, korábbi párkapcsolati sebek, vagy a kreatív önkifejezés korlátozottsága gyermek- vagy fiatalkorban. A korai üzenetek az érzelmekről és szexualitásról itt rögzülnek.

### Megerősítő Mondatok

1. Én megengedem magamnak az örömöt.
2. Én tisztelem érzelmeimet és vágyaimat.
3. Én biztonságosan kifejezhetem szenvedélyemet.
4. Én kreatív energiáimhoz kapcsolódom.
5. Én elfogadom érzékenységemet.

---

## Napfonat csakra (Manipura)

**Pontszám: 7/16**

### Részletes Elemzés

Pontszám 7/16: a legalacsonyabb értéked, ami önértékelési és személyes erő kihívásokra utal. Hajlamosság belső bizonytalanságra, önkorlátozó hiedelmekre és nehézségekre az önérvényesítésben. A döntés ereje ingadozik. Ez a csakra a belső napod, amely önbizalmat és akaraterőt ad.

### Megnyilvánulások

**Fizikai:**
- Gyomor-bélrendszeri problémák
- Emésztési zavarok, puffadás
- Hasi görcsök, különösen stressz idején

**Érzelmi:**
- Alacsony önbizalom és önértékelés
- Perfekcionizmus, amely soha nem elég jó
- Kudarcfélem, félelem a hibázástól

**Mentális:**
- Döntésképtelenség még kis dolgoknál is
- Önkritika, belső bíráló hang
- Kontrollmánia, nehézség az engedésben

### Gyökerok

Napfonat gyengeségek gyakran gyermekkori kritika, elutasítás vagy olyan tapasztalatok következményei, ahol önmagad érvényesítése negatív visszajelzést kapott. A hatalom és érték korai üzenetei itt őrződnek.

### Megerősítő Mondatok

1. Én értékes vagyok önmagamért.
2. Én képes vagyok dönteni és cselekedni.
3. Én vállalom személyes erőmet békével.
4. Én elfogadom hibáimat tanulásként.
5. Én megengedem magamnak a siker érzését.

---

## Szív csakra (Anahata)

**Pontszám: 12/16**

### Részletes Elemzés

Pontszám 12/16: erős empátia és szeretet kifejeződése jellemző. Nyitottság jellemez, könnyen kötődsz másokhoz. Ugyanakkor néha túlzott önfeladás vagy határproblémák előfordulnak, amikor mások szükségleteit helyezed előre. A szív csakra a híd az alsó és felső energiaközpontok között.

### Megnyilvánulások

**Fizikai:**
- Légzési nehézség, sekély lélegzet
- Szívdobogásérzés érzelmi helyzetekben
- Mellkasi feszültség, szorítás

**Érzelmi:**
- Túlzott empátia, mások érzelmeinek átvétele
- Határproblémák, nehézség a nemet mondásban
- Önfeladás, saját szükségletek háttérbe szorítása

**Mentális:**
- Mások elvárásainak megfelelés vágya
- Önszeretet hiánya, önkritika
- Bűntudat, ha önmagadra gondolsz

### Gyökerok

Erős szívenergiád mögött támogató kapcsolatok, korai érzelmi kötődések és ápolás áll, amelyek megtanítottak szeretni és átadni magad a kapcsolódásnak. Ez ajándék, de egyensúlyozásra szorul.

### Megerősítő Mondatok

1. Én szeretettel közelítek önmagamhoz és másokhoz.
2. Én megengedem a szeretet befogadását.
3. Én tartom és tisztelem a saját határaimat.
4. Én együttérzéssel viszonyulok a világhoz.
5. Én kapcsolódok békés szívvel.

---

## Torok csakra (Vishuddha)

**Pontszám: 9/16**

### Részletes Elemzés

Pontszám 9/16: a kommunikációd általában működik, de néha visszatartott vagy félénk. Van vágy az őszinte kifejezésre, de félsz a reakcióktól, ezért inkább szűrt vagy kivárt formában kommunikálsz. A torok csakra az igazság kapuja.

### Megnyilvánulások

**Fizikai:**
- Torokfájás, gyakori torokgyulladás
- Rekedtség, hangproblémák
- Pajzsmirigy problémák vagy érzékenység

**Érzelmi:**
- Visszafogottság az őszinte kifejezésben
- Félelem az ítélettől, ha kimondjuk az igazat
- Kommunikációs szorongás társaságban

**Mentális:**
- Önkifejezési nehézség, szavak nem jönnek
- Igazság elrejtése, fehér hazugságok
- Passzív kommunikáció, indirekt üzenetek

### Gyökerok

Torokkihívások gyakran abból erednek, hogy korábban elnyomták a véleményed, vagy megtanultad, hogy a hangodnak következményei vannak, így megtanultad visszatartani magad. Ez védőmechanizmus volt, ami ma már korlátozza az őszinteséget.

### Megerősítő Mondatok

1. Én kifejezem igazamat tisztelettel.
2. Én engedem szavakat találni a belső igazságomra.
3. Én hangom valódi és értékes.
4. Én nyitottan hallgatok és beszélek.
5. Én megengedem az őszinte kifejezést.

---

## Harmadik szem (Ajna)

**Pontszám: 11/16**

### Részletes Elemzés

Pontszám 11/16: erős intuíció és belső látás jellemző. Jó belső meglátásaid vannak, látod a mögöttes mintákat és szimbolikát. Néha túl sokan járnak a gondolataid, ami zavart okozhat a konkrét döntésekben. Ez a csakra a belső bölcsesség székhelye.

### Megnyilvánulások

**Fizikai:**
- Fejfájás, különösen homlok területén
- Szemmegerőltetés, fényérzékenység
- Alvászavar, élénk vagy zavaró álmok

**Érzelmi:**
- Túlgondolás, elemzés-bénulás
- Intuíciótól való félelem, bizalmatlanság benne
- Túlérzékenység energetikai hatásokra

**Mentális:**
- Analízis-bénulás, túl sok lehetőség látása
- Fantázia-valóság összekeveredés
- Koncentrációs nehézség jelen feladatokon

### Gyökerok

Harmadik szem erősség hátterében gyakran áll mély önreflexió, sok belső munka és élénk emlékképek, amelyek a jelent mélyebb értelmezésére tanítottak. Ez spirituális ajándék.

### Megerősítő Mondatok

1. Én bízhatok belső bölcsességemben.
2. Én tisztán látom belső igazságaimat.
3. Én hallgatom meg az intuícióm hangját.
4. Én értelmezem az élet jeleit békével.
5. Én engedem a belső képeket vezetni.

---

## Korona csakra (Sahasrara)

**Pontszám: 14/16**

### Részletes Elemzés

Pontszám 14/16: nagyon erős spirituális kapcsolat és nyitottság transzcendens tapasztalatokra. A spiritualitásod és magas perspektívád segít értelmezni az életed nagyobb összefüggéseit. Néha azonban a túlzott elvonulás a mindennapi realitástól megtörténhet. Ez a csakra a lélek koronája.

### Megnyilvánulások

**Fizikai:**
- Fényérzékenység, különösen természetes fényben
- Fejtetői nyomásérzés vagy bizsergés
- Energiaérzékenység, mások aurafelismerése

**Érzelmi:**
- Spirituális kapcsolódás érzése
- Egységérzés a mindenséggel
- Transzcendens élmények megélése

**Mentális:**
- Magas perspektíva, látás a nagy képben
- Filozófiai gondolkodás, létezési kérdések
- Bölcsességkeresés, spirituális tanulmányok

### Gyökerok

Koronaerősség kialakulhat intenzív spirituális élményekből, tanulmányokból vagy élethelyzetekből, amelyek a létezés nagyobb értelmére irányították a figyelmedet. Ez ritka és értékes ajándék.

### Megerősítő Mondatok

1. Én kapcsolódom a felsőbb bölcsességhez.
2. Én befogadom a transzcendens útmutatást.
3. Én érzem az egység és egészség jelenlétét.
4. Én hálás vagyok a belső világomért.
5. Én nyitott vagyok a magasabb látásra.

---

## Kialakulás Okai (Átfogó)

A felső csakrák (harmadik szem, korona) erőssége gyakran hosszú belső keresés, olvasás, meditációs gyakorlatok eredménye. A gyökér és napfonat gyengébb pontjai mögött gyakran állhatnak fiatalkori bizonytalanságok, gyakori változások, anyagi aggályok vagy elismerés hiánya. A szív erős volta mutat természetes hajlamot az empátiára; a torok és szakrális középértékek arra mutatnak, hogy a kreatív és kommunikációs kifejezés részben nyitott, de időnként visszafogott.

Összességében az energetikai mintázat egy spirituálisan éber személyt ábrázol, aki még keresi az egyensúlyt a földi és égi dimenziók között. A gyakorlati stabilitás, önbizalom és őszinte kifejezés megerősítése segíthet integrálni a magas tudatosság ajándékait a mindennapi életbe.

---

## Előrejelzések

### 6 Hónap

A következő 6 hónapban finom belső rendeződés várható. A korona és harmadik szem felismeréseket hozhatnak, míg a napfonat és gyökér időnként kihívást jelentenek. Kapcsolataidban a szív támogatása erős lesz, de előfordulhat, hogy gyakori önértékelési bizonytalanságod lesz. Ez egy finomhangolás időszaka, ahol a spirituális tudatosság ütközik a gyakorlati kihívásokkal.

### 1 Év

Egy éven belül lehetőség nyílik a földi alapok és személyes hatalom tudatos fejlesztésére. Az intuíciós felismerésekből születő változások formálják a cselekvést. Intuíciód és spiritualitásod mélyül, miközben a gyakorlati élettel való összehangolás próbálkozásai jelennek meg. Ez egy átmeneti év, ahol a belső és külső világ közötti híd épül.

### 2 Év

Két év távlatában a mintázat stabilizálódhat: ha a gyakorlati stabilitás fokozódik, a felső csakrák tudatosabb, de földhöz kötöttebb kifejeződést nyernek. A személyes erőd erősödik, és érzelmi kapcsolataid érettebbé válhatnak. Ez az integráció éve, amikor a spirituális bölcsesség valóban gyökeret ver a mindennapi életben.

### Pozitív Forgatókönyv

Optimista jövőképben a spirituális felismerések és intuíciód integrálódnak a gyakorlati életbe: erősebb alapok, stabil döntések és növekvő önbizalom jellemzik a napfonat és gyökér területeket. Kapcsolataid mélyülnek, kreativitásod virágzik, kommunikációd tisztább és magabiztosabb lesz. A korona és harmadik szem energiái inspirálnak, miközben a szív melegsége egyensúlyt teremt; ez egy harmonikus integráció, növekedés és béke állapotát mutatja, ahol a spirituális bölcsesség gyakorlati eredményekkel találkozik és hosszabb távú stabilitást hoz.

---

## Gyakorlatok

### Gyökércsakra (8/16 - Blokkolt)

1. **Földelő Séta Meditáció**: Minden nap 15-20 percet sétálj mezítláb természetben (fű, föld, homok). Érezd a lábadat a földön, figyelj minden lépésre. Képzeld el, hogy gyökerek nőnek lábaidból a földbe, amelyek táplálják és stabilizálják tested.

2. **Biztonság Naplózás**: Írj le minden este 3 dolgot, ami aznap biztonságot adott neked (tető a fejed felett, étkezés, meleg ágy). Ez átprogramozza a tudatalattit a biztonság érzésére.

3. **Vörös Étel Rituálé**: Fogyassz tudatosan vörös ételeket (cékla, paradicsom, piros paprika) és közben afirmáld: "Én táplálom a gyökereimet, erős és biztonságos vagyok."

### Napfonat csakra (7/16 - Blokkolt)

1. **Napfelkelte Gyakorlat**: Minden reggel 5 percet állj a napfényben (vagy ablak mellett), tenyeredet hasadra helyezve. Lélegezz mélyen, képzeld el, ahogy a napfény arany energiája tölti meg hasadat. Mondd: "Én vagyok az én életem teremtője."

2. **Kis Győzelmek Listája**: Készíts listát 20 dologról, amit jól csinálsz (akár kicsi dolgok: jó kávét főzöl, időben megérkezel, empatikus vagy). Olvasd fel magadnak hangosan hetente.

3. **Sárga Ruházat Nap**: Válassz egy napot hetente, amikor sárga színt viselsz (ruha, sál, ékszer). Ez aktiválja a napfonat energiáját és emlékeztet a belső napsugárodra.

### Torok csakra (9/16 - Blokkolt)

1. **Hangoztatás Gyakorlat**: Reggel 5 percig dalolj, zümmögj vagy ismételj mantrákat (pl. "HAM" - torok csakra bija mantra). Érezd a rezgést a torkodon.

2. **Őszinteség Napló**: Írj le minden este egy dolgot, amit nem mondtál ki aznap, de szerettél volna. Gyakorold a papíron az őszinte kifejezést ítélet nélkül.

3. **Kék Meditáció**: Viselj kék követ (türkiz, akvamarín) a nyakadban és naponta képzeld el, hogy kék fény áramlik torkodon keresztül, tisztítva és felszabadítva hangod.

---

## Követési Napló

### Napi Gyakorlat

Ahhoz, hogy a csakra egyensúly hosszú távon megvalósuljon, fontos a rendszeres követés. Készíts egy egyszerű naplót, ahol naponta értékeled minden csakrád állapotát 1-10 skálán. Figyelj arra, hogy mely csakrák ingadoznak jobban, és mely gyakorlatok hatnak legjobban rád.

### Heti Értékelés

Hetente szentelj 10-15 percet arra, hogy áttekintsed a heted. Milyen helyzetekben érezted gyengébbnek az alsó csakrákat? Mikor volt erős a szíved vagy intuíciód? Ezek a minták segítenek célzottabban dolgozni.

### Havi Felülvizsgálat

Havonta vizsgáld felül az eredeti pontszámaidat. Érzékeled-e változást? Mely területek fejlődtek, melyek igényelnek még munkát? Ez a tudatos követés magában is gyógyító, mert figyelmet és szeretetet irányít energiádra.

---

**Zárszó**

Kedves Mária, ez a jelentés egy pillanatfelvétel jelenlegi energetikai állapotodról. Ne feledd, a csakrák folyamatosan változnak élethelyzeteid, érzelmi állapotod és tudatos munkád hatására. Minden nap lehetőség az egyensúly újrateremtésére. Légy türelmes és szerető önmagaddal ezen az úton. 💜

*Generálva szeretettel, 2025. október 21.*
`.trim();

async function testMarkdownToPDF() {
  console.log('🧪 Testing Markdown → PDF Pipeline with Cached Data...\n');

  console.log('📊 Using cached Markdown report');
  console.log('  User: Teszt Mária');
  console.log('  Email: maria@teszt.hu\n');

  console.log('⏳ Converting Markdown to PDF...');
  const startTime = Date.now();

  const pdfBuffer = await convertMarkdownToPDF(
    cachedMarkdownReport,
    sampleChakraScores,
    'Teszt Mária',
    'maria@teszt.hu'
  );

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Save PDF
  const outputPath = '/Users/szabolaszlo/Library/CloudStorage/SynologyDrive-DRIVE/Appok/EredetiCsakra/test-markdown.pdf';
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log('✅ PDF generated in ' + duration + 's\n');
  console.log('📊 Statistics:');
  console.log('  PDF Size: ' + (pdfBuffer.length / 1024).toFixed(2) + ' KB');
  console.log('  Markdown Length: ' + cachedMarkdownReport.length + ' chars');
  console.log('  Output File: ' + outputPath + '\n');

  console.log('🎉 Test PDF saved successfully!');
  console.log('Open it with: open ' + outputPath);
}

testMarkdownToPDF().catch(console.error);
