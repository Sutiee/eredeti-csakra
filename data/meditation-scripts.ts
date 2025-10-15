/**
 * Meditation Scripts for 7 Chakras
 * Each meditation is 15-20 minutes long with detailed visualization and breathing exercises
 */

export interface MeditationScript {
  id: number;
  chakra: string;
  chakraKey: string;
  title: string;
  duration: number; // minutes
  color: string;
  script: string;
  voiceNotes: string;
}

export const MEDITATION_SCRIPTS: MeditationScript[] = [
  {
    id: 1,
    chakra: "Gyökércsakra",
    chakraKey: "root",
    title: "Földelő Meditáció - Stabilizálás",
    duration: 18,
    color: "#DC143C",
    script: `
Üdvözöllek ebben a földelő meditációban. (pause 2s)

Ülj kényelmesen... gerinced egyenesen... kezeid helyezd a térdenre... tenyérrel felfelé vagy lefelé, ahogy számodra kényelmes. (pause 3s)

Csukd be a szemed... és vedd észre a tested súlyát... ahogy lefelé nyomja az ülőfelületet... a gravitáció ereje... amely biztonságosan a Földhöz köt. (pause 4s)

Kezdj el mély lélegzeteket venni... belégzés az orron keresztül... egy... kettő... három... négy... (pause 2s) kitartott légzés... egy... kettő... (pause 1s) kilégzés a szájon át... egy... kettő... három... négy... öt... hat... (pause 3s)

Folytasd ezt a légzési ritmust... négyre be... négyre ki... (pause 5s)

Most fókuszálj a gerincoszlopod aljára... a medencéd tájékára... ahol a gyökércsakrád található... (pause 3s)

Képzeld el... hogy ezen a helyen... egy gyönyörű vörös fénygolyó pulzál... mélyító... erőteljes... biztonságot adó vörös fény... (pause 4s)

Ahogy belélegzed... ez a vörös fény világosabbá válik... kitágul... (pause 2s) ahogy kilélegzel... még stabilabbá... erősebbé válik... (pause 4s)

Most képzeld el... hogy a gerincoszlopod aljából... gyökerek kezdenek kinőni... vörös... erős... hatalmas gyökerek... (pause 3s)

Ezek a gyökerek áthatolnak az ülőfelületen... a padlón... az épület alapjain... és mélyen... mélyen a földbe fúródnak... (pause 5s)

Érezd... ahogy ezek a gyökerek egyre mélyebbre... és mélyebbre hatolnak... áthaladnak a föld rétegein... a sziklán... a kristályokon... egészen a Föld magjáig... (pause 5s)

Most... ahogy belélegzel... érezd... ahogy a Föld energiája... vörös... meleg... tápláló energia... felfelé áramlik ezeken a gyökereken keresztül... (pause 3s)

Beáramlik a gyökércsakrádba... feltölti az alsó testedet... a lábaidat... a medencédet... stabilitással... biztonságérzéssel... (pause 5s)

Ismételd magadban... "Biztonságban vagyok"... (pause 3s) "Az alapjaim szilárdak"... (pause 3s) "A Föld megtart és táplál engem"... (pause 4s)

Képzeld el... hogy tested... mint egy erős fa... mélyen gyökerezik... miközben az ágai szabadon nyúlnak a magasba... (pause 5s)

Te vagy a híd a Föld és az Ég között... (pause 3s)

Most fókuszálj azokra a területekre az életedben... ahol bizonytalanságot érzel... (pause 3s) pénzügyi aggodalmak... egzisztenciális félelmek... testtől való elszakadás érzése... (pause 4s)

Engedd... hogy ezeket az aggodalmakat... a vörös gyökérenergia átformálja... átölelje... biztonságérzéssé alakítsa... (pause 5s)

Érezd... hogy minden szükséged meg van fedezve... (pause 2s) A világegyetem támogat téged... (pause 3s) Te érdemessé váltál a bőségre... a biztonságra... a stabilitásra... (pause 5s)

Képzeld el... ahogy a gyökércsakrád teljesen harmonizált... kiegyensúlyozott... egészséges... (pause 3s) A vörös fény ragyog... pulzál... élettel telik... (pause 4s)

Most lassan... nagyon lassan... kezdd el visszahozni a tudatodat a jelenbe... (pause 3s)

Mozgasd meg az ujjaidat... a lábujjaidat... (pause 2s)

Lélegezz mélyeket... (pause 2s)

És amikor készen állsz... nyisd ki a szemed... (pause 3s)

Érezd a stabilitást... az alapokat... amelyeket most megteremtettél... (pause 2s)

Köszönöm... hogy velem meditáltál... (pause 2s)

Namaste.
    `,
    voiceNotes: "Lassú, nyugodt, mély hangon. Pauzák precízen betartva. Hangerő egyenletes, megnyugtató. Hangsúly a biztonság és stabilitás érzésén."
  },
  {
    id: 2,
    chakra: "Szakrális csakra",
    chakraKey: "sacral",
    title: "Érzelmi Áramlás - Kreativitás Felébresztése",
    duration: 17,
    color: "#FF8C00",
    script: `
Üdvözöllek ebben a szakrális csakra meditációban... az érzelmi áramlás és kreativitás meditációjában. (pause 2s)

Foglalj helyet kényelmesen... engedd... hogy a tested ellazuljon... (pause 3s)

Csukd be a szemed... és figyelj a légzésedre... (pause 4s)

Most helyezd a figyelmedet az alsó hasadra... a köldöd alatt körülbelül öt centiméterrel... ahol a szakrális csakrád található... (pause 3s)

Képzeld el... hogy ezen a helyen... egy gyönyörű narancssárga fénygolyó pulzál... meleg... áramló... folyékony energia... (pause 4s)

Ez a narancssárga fény... olyan... mint a napfelkelte... meleg... kreatív... érzéki... (pause 3s)

Ahogy belélegzel... ez a narancssárga fény világosabbá válik... kitágul... (pause 2s) ahogy kilélegzel... mélyen áramlik... körbe-körbe forog... mint egy víz örvény... (pause 4s)

Most képzeld el... hogy a szakrális csakrád területén... egy kristálytiszta víz forrás van... (pause 3s)

Ez a forrás az érzelmeídet... a kreativitásodat... az életörömedet szimbolizálja... (pause 4s)

Figyeld meg... ahogy ez a víz szabadon áramlik... (pause 2s) Nincs elzárva... nincs blokkolva... szabadon... természetesen folyik... (pause 5s)

Most fókuszálj az érzelmeídre... (pause 2s) Mely érzelmeket tartottál vissza?... (pause 3s) Mely érzéseket nem engedted meg magadnak... hogy átéld?... (pause 4s)

Engedd... hogy ezek az érzelmek most felszínre jöjjenek... (pause 3s) Ne ítélkezz felettük... csak hagyd... hogy áramoljanak... mint a víz... (pause 5s)

Képzeld el... ahogy ezek az érzelmek... narancssárga fényként áramlanak ki belőled... és átengedik magukat az univerzumnak... (pause 4s)

Most gondolj a kreativitásodra... (pause 2s) Milyen alkotásokat vágyol megteremteni?... (pause 3s) Milyen ötleteket szeretnél megvalósítani?... (pause 4s)

Érezd... ahogy a szakrális csakrád narancssárga fénye... beindítja a kreatív energiádat... (pause 3s)

Ez az energia szabadon áramlik benned... nincs kritika... nincs visszafogottság... csak tiszta... kreatív kifejezés... (pause 5s)

Most fókuszálj az érzékiségedre... a tested élvezetének képességére... (pause 3s)

Érezd a tested... ahogy a ruha érinti a bőrödet... (pause 2s) ahogy a levegő simítja az arcodat... (pause 3s)

Te egy érzékeny... érző... élő lény vagy... (pause 3s) És ez gyönyörű... (pause 4s)

Ismételd magadban... "Az érzelmeim szabadon áramlanak"... (pause 3s) "Kreatív vagyok és kifejező"... (pause 3s) "Élvezem az életem minden pillanatát"... (pause 4s)

Engedd... hogy a narancssárga fény kitöltse az egész medencédet... az alsó hátadat... a csípődet... a nemi szerveidet... (pause 5s)

Ez a fény gyógyítja a múlt sérelmeit... az érzelmi blokkok oldódnak... az energia szabadon áramlik... (pause 5s)

Képzeld el... hogy tested olyan... mint egy táncos... aki szabadon... gátlás nélkül mozog... (pause 4s)

Most lassan... nagyon lassan... kezdd el visszahozni a tudatodat a jelenbe... (pause 3s)

Mozgasd meg a csípődet... kicsit kör körösen... (pause 3s)

Lélegezz mélyeket... (pause 2s)

És amikor készen állsz... nyisd ki a szemed... (pause 3s)

Érezd a kreativitást... az érzelmi szabadságot... amelyet most felébresztettél... (pause 2s)

Köszönöm... (pause 2s)

Namaste.
    `,
    voiceNotes: "Folyékony, áramló hang. Érzelmesen gazdag de nyugodt. Hangsúly az áramláson és a szabadságon."
  },
  {
    id: 3,
    chakra: "Napfonat csakra",
    chakraKey: "solar",
    title: "Belső Erő Aktiválása - Önbizalom Építése",
    duration: 16,
    color: "#FFD700",
    script: `
Üdvözöllek ebben a napfonat csakra meditációban... a belső erő és önbizalom meditációjában. (pause 2s)

Ülj egyenesen... válladat húzd hátra... mellkasodat nyisd ki... (pause 3s)

Csukd be a szemed... és figyelj a légzésedre... (pause 4s)

Most helyezd a figyelmedet a napfonatra... a bordaív alatti területre... ahol a gyomrod található... (pause 3s)

Képzeld el... hogy ezen a helyen... egy fényes... sárga... arany fénygolyó pulzál... mint egy belső nap... (pause 4s)

Ez a fénygolyó melegíti... erősíti... felvértez téged... (pause 3s)

Ahogy belélegzel... ez a sárga fény világosabbá válik... kitágul... (pause 2s) ahogy kilélegzel... erőteljesebb lesz... koncentráltabb... (pause 4s)

Most képzeld el... hogy a napfontratodin... egy lángoló tűz ég... (pause 3s)

Ez a tűz az akaratod tüze... a céljaid tüze... a belső erőd tüze... (pause 4s)

Figyeld meg... milyen erővel ég ez a tűz... (pause 3s) Ha gyenge... szítsd nagyobbra... ha túl erős... csillapítsd le egy kicsit... találd meg a tökéletes egyensúlyt... (pause 5s)

Most gondolj azokra a helyzetekre... amikor erőtlennek... tehetetlennek érezted magad... (pause 3s)

Mely helyzetekben adtad fel a hatalmadat?... (pause 3s) Mikor engedted... hogy mások uralmuk alá hajtsanak téged?... (pause 4s)

Engedd... hogy ezek az emlékek most feljöjjenek... (pause 2s) És ahogy feljönnek... látod... ahogy a napfontra sárga tüze... megégeti őket... átformálja őket... erővé... bölcsességgé alakítja... (pause 5s)

Most ismételd magadban... "Én erős vagyok"... (pause 3s) "Képes vagyok a céljaim elérésére"... (pause 3s) "Az akaratom tiszta és erőteljes"... (pause 4s)

Érezd... ahogy a sárga fény kitölti az egész törzsed középső részét... a gyomrodat... a májadat... a lépédet... (pause 4s)

Ez a fény gyógyítja az önbizalomhiányt... feloldja a félelmeket... megerősíti az akaratod... (pause 5s)

Most képzeld el... hogy olyan vagy... mint egy harcos... aki tudja... hogy képes legyőzni minden akadályt... (pause 4s)

De ez nem egy agresszív harcos... hanem egy bölcs... kiegyensúlyozott... határozott vezető... (pause 4s)

Te irányítod az életed... (pause 2s) Te döntesz... (pause 2s) Te határozol... (pause 3s)

És ez a hatalom... nem mások felett van... hanem te magad felett... (pause 4s)

Most gondolj egy célra... amelyet el szeretnél érni... (pause 3s)

Lásd magad... ahogy elhatározod... hogy eléred ezt a célt... (pause 3s)

Érezd a sárga fényt... ahogy erőt ad neked... kitartást... fókuszt... (pause 5s)

Nincs olyan akadály... amit ne tudnál leküzdeni... (pause 3s)

Most fókuszálj az emésztésedre... (pause 2s) A napfonat csakra kapcsolódik az emésztéshez... nem csak a fizikai táplálék... hanem az életélmények emésztéséhez is... (pause 4s)

Képzeld el... ahogy a sárga fény segít feldolgozni... megemészteni... minden tapasztalatot... amit átéltél... (pause 5s)

Most lassan... nagyon lassan... kezdd el visszahozni a tudatodat a jelenbe... (pause 3s)

Mozgasd meg a törzsed... forgasd meg kicsit jobbra-balra... (pause 3s)

Lélegezz mélyeket... (pause 2s)

És amikor készen állsz... nyisd ki a szemed... (pause 3s)

Érezd a belső erőt... az önbizalmat... amelyet most aktiváltál... (pause 2s)

Köszönöm... (pause 2s)

Namaste.
    `,
    voiceNotes: "Erős, határozott, de nem agresszív hang. Magabiztos és támogató. Hangsúly az erőn és határozottságon."
  },
  {
    id: 4,
    chakra: "Szív csakra",
    chakraKey: "heart",
    title: "Szeretet Kiterjesztése - Gyógyítás és Megbocsátás",
    duration: 19,
    color: "#32CD32",
    script: `
Üdvözöllek ebben a szív csakra meditációban... a szeretet... a gyógyítás... és a megbocsátás meditációjában. (pause 2s)

Ülj kényelmesen... mellkasodat nyisd ki... válladat engedd hátra... (pause 3s)

Csukd be a szemed... és figyelj a szíveddobbanására... (pause 5s)

Hallgatod ezt az állandó... megbízható... életadó ritmust... (pause 4s)

Most helyezd a figyelmedet a mellkas közepére... a szíved területére... ahol a szív csakrád található... (pause 3s)

Képzeld el... hogy ezen a helyen... egy gyönyörű zöld fénygolyó pulzál... ragyog... mint egy smaragd... (pause 4s)

Ez a zöld fény meleg... gyengéd... szeretetteljes... (pause 3s)

Ahogy belélegzel... ez a zöld fény világosabbá válik... kitágul... (pause 2s) ahogy kilélegzel... mélyebben hatol befelé... gyógyítja a szívedet... (pause 4s)

Most képzeld el... hogy a szíved területén... egy gyönyörű rózsa van... (pause 3s)

Ez a rózsa most kezd kinyílni... szirmonként... lassan... gyengéden... (pause 5s)

Ahogy kinyílik... egy csodálatos fény árad belőle... ez a fény a tiszta... feltétel nélküli szeretet fénye... (pause 4s)

Most gondolj valakire... akit nagyon szeretsz... (pause 3s)

Érezd... ahogy a szíved megtelik ezzel a szeretettel... (pause 3s) Melegség tölti el a mellkasodat... (pause 4s)

Most engedd... hogy ez a szeretet ne csak erre az egy személyre irányuljon... hanem kiterjedjen... (pause 3s)

Kiterjedjen a családodra... a barátaidra... (pause 3s) az ismerőseídre... (pause 2s) és lassan... minden élőlényre... (pause 5s)

Képzeld el... ahogy a zöld fény körkörösen terjed ki belőled... mint egy hullám... és eléri az egész világot... (pause 5s)

Most gondolj valakire... akivel szemben fájdalmat... haragot... vagy sértődést érzel... (pause 4s)

Ne erőltesd... csak hagyd... hogy ez az érzés felszínre jöjjön... (pause 3s)

És most... a szíved zöld fényével... küldd el neki a gyógyítást... (pause 3s)

Nem azt mondod... hogy amit tett... az rendben volt... (pause 2s) De felszabadítod magad a harag börtönéből... (pause 4s)

Ismételd magadban... "Megbocsátok neked"... (pause 3s) "És megbocsátok magamnak is"... (pause 4s)

Engedd... hogy a zöld fény átölelje ezt a személyt... és lassan... az érzelmek elkezdjenek oldódni... (pause 5s)

Most fordulj befelé... és gondolj azokra a dolgokra... amelyekért önmagadat hibáztatod... (pause 4s)

Mely dolgokért vagy dühös magadra?... (pause 3s) Mit nem tudsz megbocsátani magadnak?... (pause 4s)

Most helyezd a kezed a szívedre... (pause 2s) és érezd a melegséget... (pause 3s)

Képzeld el... hogy a szíved zöld fénye befelé áramlik... gyógyítja a sebeidet... (pause 4s)

Ismételd magadban... "Megbocsátok magamnak"... (pause 3s) "Érdekes vagyok a szeretetre"... (pause 3s) "Szeretlek önmagam... olyan... amilyen vagyok"... (pause 5s)

Most engedd... hogy a zöld fény kitöltse az egész mellkasodat... a tüdődet... a szívedet... a mellkapocsot... (pause 4s)

Érezd... ahogy a szíved csakra teljesen kinyílik... kiegyensúlyozott... harmonikus... szeretettel teljes... (pause 5s)

Most képzeld el... hogy a szívedből... rózsaszín fény is kezd áradni... ez a fény az önszeretet fénye... (pause 4s)

A zöld és a rózsaszín fény keveredik... gyógyít... táplál... megerősít... (pause 5s)

Te egy szeretetteljes... gondoskodó... gyógyító lény vagy... (pause 3s)

És ez a szeretet először befelé árad... megtölt téged... (pause 3s) És csak azután... amikor te már tele vagy... árad kifelé másokra... (pause 5s)

Most vedd észre a légzésedet... ahogy belélegzel... szeretetet lélegzel be... (pause 2s) ahogy kilélegzel... fájdalmat lélegzel ki... (pause 4s)

Folytasd ezt a légzést... be... szeretet... ki... fájdalom... (pause 5s)

Most lassan... nagyon lassan... kezdd el visszahozni a tudatodat a jelenbe... (pause 3s)

Mozgasd meg a válladat... a karodat... (pause 2s)

Ölelj át magad... add meg magadnak ezt a fizikai megerősítést... (pause 3s)

Lélegezz mélyeket... (pause 2s)

És amikor készen állsz... nyisd ki a szemed... (pause 3s)

Érezd a szeretetet... a megbocsátást... a nyitottságot... amelyet most megteremtettél... (pause 2s)

Köszönöm... (pause 2s)

Namaste.
    `,
    voiceNotes: "Meleg, gyengéd, szeretetteljes hang. Lassú tempó. Hangsúly az elfogadáson és a gyógyításon."
  },
  {
    id: 5,
    chakra: "Torok csakra",
    chakraKey: "throat",
    title: "Hiteles Kifejezés - A Belső Hang Megtalálása",
    duration: 15,
    color: "#4169E1",
    script: `
Üdvözöllek ebben a torok csakra meditációban... a hiteles kifejezés... és a belső hang meditációjában. (pause 2s)

Ülj egyenesen... a nyakad legyen szabad... a fejed egyenesen... (pause 3s)

Csukd be a szemed... és figyelj a légzésedre... ahogy a levegő be... és kiáramlik a torkodon... (pause 4s)

Most helyezd a figyelmedet a torok területére... a gégefődre... ahol a torok csakrád található... (pause 3s)

Képzeld el... hogy ezen a helyen... egy kék fénygolyó pulzál... tiszta... világos kék... mint az ég... (pause 4s)

Ez a kék fény hűvös... tiszta... kifejező... (pause 3s)

Ahogy belélegzel... ez a kék fény világosabbá válik... kitágul... (pause 2s) ahogy kilélegzel... vibrál... rezonál... mint egy hang... (pause 4s)

Most gondolj azokra az időkre... amikor nem mondtad ki... amit gondoltál... (pause 3s)

Mikor hallgattál... pedig beszélni akartál?... (pause 3s) Mikor hazudtál... hogy megfelelj másoknak?... (pause 4s)

Engedd... hogy ezek az emlékek felszínre jöjjenek... (pause 3s) És ahogy feljönnek... érezd a torokcsákrád területén az érzeteket... (pause 4s)

Talán feszültséget... görcsöt... vagy nehézséget az nyelésben... (pause 3s)

Most képzeld el... hogy a kék fény átáramlik ezen a területen... és lassan oldódnak a blokkok... (pause 5s)

Vegyél egy mély lélegzetet... és ahogy kilélegzel... adjál ki egy hangot... "aaaaahhhhh"... (pause 3s)

Érezd... ahogy a torok csakrád vibrál ettől a hangtól... (pause 3s)

Most ismételd a "ham" mantrát magadban vagy hangosan... "háááámmm"... (pause 4s)

Ez a hang a torok csakra magja... rezgése oldja a blokkokat... (pause 5s)

Ismételd újra... "háááámmm"... (pause 4s)

És még egyszer... "háááámmm"... (pause 4s)

Most gondolj valamire... amit ki szeretnél mondani... valakinek vagy a világnak... (pause 4s)

Mi az az igazság... amit eddig visszatartottál?... (pause 4s)

A torok csakra meditáció során... nem kell ténylegesen kimondanod... de érezd... hogy milyen lenne... ha megtennéd... (pause 5s)

Képzeld el... ahogy kimondod ezt az igazságot... tisztán... határozottan... kedvesen... (pause 4s)

Érezd... ahogy felszabadulsz... ahogy a teher leesik a válladról... (pause 5s)

Ismételd magadban... "Az igazságom szabadon áramlik"... (pause 3s) "Hiteles vagyok minden szavamban"... (pause 3s) "Kifejezem magam világosan és tisztán"... (pause 4s)

Most fókuszálj a meghallgatásra is... (pause 2s) A torok csakra nemcsak a beszédről szól... hanem a hallgatásról is... (pause 4s)

Képzeld el... ahogy mély figyelemmel hallgatod meg másokat... anélkül... hogy meg akarnád szakítani őket... (pause 4s)

A kék fény kitölti az egész torok területét... a gégefőt... a pajzsmirigyet... a nyakat... az állkapcsot... (pause 5s)

Most érezd... hogy a torok csakrád összeköti a szívedet és az elmédet... (pause 3s)

Az... amit érzel a szívedben... és az... amit gondolsz az elmédben... harmonikusan kifejeződik a szavadon keresztül... (pause 5s)

Gondolj a kreativitásra is... (pause 2s) Hogyan fejezheted ki magad művészeten keresztül?... Éneklésen?... Íráson?... Beszéden?... (pause 5s)

Engedd... hogy a kék fény inspirálja a kreatív kifejezésedet... (pause 4s)

Most lassan... kezdd el visszahozni a tudatodat a jelenbe... (pause 3s)

Forgasd meg a nyakad... lassan... körkörösen... először az egyik irányba... aztán a másikba... (pause 4s)

Nyisd ki az állkapcsod... mozgasd meg... oldozd fel a feszültséget... (pause 3s)

Lélegezz mélyeket... (pause 2s)

És amikor készen állsz... nyisd ki a szemed... (pause 3s)

Érezd a tisztaságot... a hitelességet... amelyet most megteremtettél... (pause 2s)

Köszönöm... (pause 2s)

Namaste.
    `,
    voiceNotes: "Tiszta, világos artikuláció. Magabiztos, de nem hangos. Hangsúly az őszinteségen és a kifejezés szabadságán."
  },
  {
    id: 6,
    chakra: "Harmadik szem",
    chakraKey: "thirdEye",
    title: "Belső Látás Élesítése - Intuíció Fejlesztése",
    duration: 17,
    color: "#9370DB",
    script: `
Üdvözöllek ebben a harmadik szem csakra meditációban... a belső látás... és az intuíció meditációjában. (pause 2s)

Ülj kényelmesen... gerincoszlopod egyenesen... fejed egyensúlyban... (pause 3s)

Csukd be a szemed... és fordítsd a figyelmedet befelé... (pause 4s)

Most helyezd a figyelmedet a két szemed közötti területre... a homlokod középső pontjára... ahol a harmadik szemed található... (pause 3s)

Képzeld el... hogy ezen a helyen... egy mély indigókék fénygolyó pulzál... titokzatos... bölcs... (pause 4s)

Ez az indigófény kapcsolódik a belső tudásodhoz... az intuíciódhoz... a spirituális látásodhoz... (pause 4s)

Ahogy belélegzel... ez az indigófény világosabbá válik... kitágul... (pause 2s) ahogy kilélegzel... behatolni kezd az elméd mélyére... (pause 4s)

Most képzeld el... hogy a homlokod közepén... egy harmadik szem kezd kinyílni... (pause 3s)

Ez a szem nem fizikai... hanem szellemi... látja azt... amit a fizikai szemek nem látnak... (pause 5s)

Ahogy ez a harmadik szem kinyílik... elkezdesz látni... (pause 3s) Képeket... színeket... szimbólumokat... (pause 4s)

Ne próbáld kontrollálni... ne próbáld értelmezni... csak hagyd... hogy jöjjenek... (pause 5s)

Most gondolj egy kérdésre... amelyre választ keresel... (pause 4s)

Ne a fejeddel gondolkozz... hanem az intuíciódra figyelj... (pause 3s)

Mit súg neked a belső hangod?... (pause 4s)

Mi az első... spontán válasz... ami felmerül benned?... (pause 5s)

Ez az intuíciód szava... (pause 3s) Tanuld meg megbízni benne... (pause 4s)

Most képzeld el... hogy az indigó fény kitölti az egész fejedet... (pause 3s) a homlokodat... a halántékodat... az agyad közepét... ahol a tobozmirigyed van... (pause 5s)

A tobozmirigy a harmadik szem fizikai megfelelője... ez a kis mirigy felelős a melatonin termelésért... és a spirituális tradíciók szerint... a lelked székhelye... (pause 5s)

Érezd... ahogy az indigó fény aktivizálja ezt a területet... (pause 4s)

Most ismételd magadban a "om" mantrát... "óóómmm"... (pause 4s)

Érezd... ahogy ez a hang rezonál a fejedben... a harmadik szemedben... (pause 4s)

Újra... "óóómmm"... (pause 4s)

És még egyszer... "óóómmm"... (pause 4s)

Most fókuszálj az elmédre... (pause 2s) Vedd észre a gondolataidat... ahogy jönnek és mennek... (pause 4s)

Ne azonosulj velük... csak figyelj... mint egy megfigyelő... (pause 5s)

Ez a megfigyelő tudatod... ez a bölcs... csendes jelenlét benned... ez a te valódi Énied... (pause 5s)

Gondolj azokra az időkre... amikor nem hallgattál az intuíciódra... (pause 3s)

Mikor a fejed logikája felülírta a szíved tudását?... (pause 4s)

Most engedd meg... hogy a harmadik szemed fénye megvilágítsa ezeket az emlékeket... (pause 3s) és tanulj belőlük... (pause 4s)

Ismételd magadban... "Megbízom az intuíciómban"... (pause 3s) "Látom az igazságot"... (pause 3s) "Kapcsolódok a belső bölcsességemhez"... (pause 4s)

Most képzeld el... hogy a harmadik szemed egy projektort tartalmaz... (pause 3s)

Ez a projektor kivetíti a belső képeidet... az álmaidat... a víziódatat... a céljaidat... (pause 4s)

Mit szeretnél megteremteni az életedben?... (pause 3s)

Lásd ezt a képet... tisztán... élesen... részletesen... (pause 5s)

Ez a vizualizáció ereje... (pause 2s) Az... amit a harmadik szemeddel látsz... azt fogod megteremteni a fizikai világban... (pause 5s)

Most fókuszálj az álmaidra... (pause 2s) A harmadik szem aktív az álmodás során... (pause 3s)

Képzeld el... hogy ma éjjel... tiszta... világos álmokat fogsz látni... (pause 3s) és emlékezni fogsz rájuk reggel... (pause 4s)

Ezek az álmok üzeneteket hordoznak... útmutatást nyújtanak... (pause 4s)

Most lassan... kezdd el visszahozni a tudatodat a jelenbe... (pause 3s)

De tartsd meg a kapcsolatot ezzel a belső látással... (pause 3s)

Dörzsöld meg a tenyeredet... melegítsd fel... (pause 2s) és tedd a tenyeredet a zárt szemed elé... (pause 3s)

Érezd a melegséget... (pause 2s)

Most lassan... nyisd ki a szemed... és nézz a kezedre... (pause 3s)

Lassan engedd... hogy a külső világ képei ismét beáramoljanak... (pause 3s)

De most már tudatában vagy... hogy van egy belső világ is... amit csak te látsz... (pause 4s)

Köszönöm... (pause 2s)

Namaste.
    `,
    voiceNotes: "Titokzatos, mély, meditatív hang. Lassú tempó. Hangsúly az intuitív tudáson és belső látáson."
  },
  {
    id: 7,
    chakra: "Korona csakra",
    chakraKey: "crown",
    title: "Spirituális Kapcsolódás - Egység Megélése",
    duration: 20,
    color: "#9400D3",
    script: `
Üdvözöllek ebben a korona csakra meditációban... a spirituális kapcsolódás... és az egység meditációjában. (pause 2s)

Ez a legmagasabb szintű csakra meditáció... amely összeköt téged a transzcendens valósággal... (pause 4s)

Ülj kényelmesen... gerincoszlopod egyenesen... képzeld el... hogy egy láthatatlan fonál húzza felfelé a fejed tetejét... (pause 4s)

Csukd be a szemed... és vegyél nagyon mély... lassú lélegzeteket... (pause 5s)

Most helyezd a figyelmedet a fejed tetejére... a koronádra... ahol a korona csakrád található... (pause 3s)

Képzeld el... hogy ezen a helyen... egy ezer szirmú lótusz található... (pause 3s)

Ez a lótusz most kezd kinyílni... szirmonként... lassan... majesztikusan... (pause 5s)

Ahogy kinyílik... egy gyönyörű lila... ibolya... vagy fehér fény árad belőle... (pause 4s)

Ez a fény az isteni fény... a tiszta tudatosság fénye... (pause 4s)

Ahogy belélegzel... ez a fény erősebbé válik... (pause 2s) ahogy kilélegzel... felemelkedik... és összekapcsolódik az univerzális tudatossággal... (pause 5s)

Most képzeld el... hogy a fejed tetejéből... egy lila fénysugár emelkedik ki... (pause 3s)

Ez a fénysugár felfelé áramlik... felfelé... feljebb és feljebb... (pause 4s)

Áthalad a plafonon... az épületen... a légkörön... (pause 3s)

Tovább emelkedik... a földön túlra... a naprendszeren túlra... a galaxison túlra... (pause 5s)

Egészen az univerzum végtelenségéig... vagy ami azon is túl van... (pause 5s)

És ott... ebben a végtelen térben... összekapcsolódsz az egyetemes forrással... az isteni tudatossággal... minden létező egységével... (pause 5s)

Érezd... hogy te nem vagy különálló... (pause 3s) Te egy része vagy ennek a hatalmas... végtelen... tudatos univerzumnak... (pause 5s)

Most engedd... hogy ez az isteni fény visszaáramoljon... (pause 3s)

Visszajön... le... le... a végtelenből... és beáramlik a korona csakrádba... (pause 4s)

Ahogy beáramlik... megtölt téged... isteni tudással... spirituális bölcsességgel... feltétel nélküli szeretettel... (pause 5s)

Most képzeld el... hogy ez a lila-fehér fény lassan leáramlik... (pause 3s)

Leáramlik a harmadik szem csakrádba... megtöltve intuícióval... (pause 2s)

Tovább áramlik a torok csakrádba... megtöltve hiteles kifejezéssel... (pause 2s)

Tovább a szív csakrádba... megtöltve szeretettel... (pause 2s)

Tovább a napfonat csakrádba... megtöltve erővel... (pause 2s)

Tovább a szakrális csakrádba... megtöltve kreativitással... (pause 2s)

És végül a gyökércsakrádba... megtöltve stabilitással... (pause 3s)

Most az egész tested... egy fényoszlop... amely összeköti a Földet és az Eget... (pause 5s)

Ismételd magadban... "Egy vagyok a Mindenséggel"... (pause 3s) "Én vagyok a fény"... (pause 3s) "Én vagyok a szeretet"... (pause 3s) "Én vagyok"... (pause 5s)

Most gondolj azokra az időkre... amikor egyedül érezted magad... (pause 3s) elválasztva másoktól... elidegenedve... (pause 4s)

Tudd meg... hogy ez csak illúzió volt... (pause 3s)

Valójában te mindig is kapcsolódtál... mindig is egy része voltál ennek a hatalmas tudatos hálónak... (pause 5s)

Érezd ezt az egységet... minden élőlénnyel... minden emberrel... az állatokkal... a növényekkel... a földdel... az univerzummal... (pause 5s)

Most ülj ebben a tudatosságban... (pause 3s) csendben... békében... hosszú percekig... (pause 10s)

Ha gondolatok jönnek... engedd el őket... (pause 3s)

Ha érzések jönnek... engedd el őket... (pause 3s)

Csak légy... tiszta... tudatos jelenlét... (pause 10s)

Ez a te valódi természeted... (pause 5s)

Most lassan... nagyon lassan... tudd... hogy amikor visszatérsz a mindennapok világába... viheted magaddal ezt a tudatosságot... (pause 4s)

Nem kell elszakadnod ettől az egység élményétől... (pause 3s)

Ez mindig itt van... benned... és körülötted... (pause 5s)

Most vegyél mély lélegzeteket... (pause 3s)

Mozgasd meg az ujjaidat... a lábujjaidat... (pause 2s)

Forgasd meg a nyakad... a válladat... (pause 3s)

És amikor készen állsz... nagyon lassan... nyisd ki a szemed... (pause 4s)

Tégy egy pillanat alatt... mielőtt felállsz... vagy bármit teszel... (pause 3s)

Csak ülj... és érezd ezt a spirituális kapcsolatot... (pause 5s)

Köszönöm... hogy velem meditáltál... (pause 2s)

Köszönöm... hogy nyitottál a spirituális utadra... (pause 2s)

Namaste... (pause 2s)

A bennem lévő fény meghajol a benned lévő fény előtt... (pause 3s)

Namaste.
    `,
    voiceNotes: "Spirituális, áttetszően tiszta hang. Nagyon lassú tempó. Hangsúly az egységen és a transzcendens kapcsolaton. Hosszabb pauzák megengedettek."
  }
];

/**
 * Get meditation by chakra key
 */
export function getMeditationByChakra(chakraKey: string): MeditationScript | undefined {
  return MEDITATION_SCRIPTS.find(m => m.chakraKey === chakraKey);
}

/**
 * Get all meditation titles for display
 */
export function getAllMeditationTitles(): Array<{id: number, chakra: string, title: string}> {
  return MEDITATION_SCRIPTS.map(m => ({
    id: m.id,
    chakra: m.chakra,
    title: m.title
  }));
}
