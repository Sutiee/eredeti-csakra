# GPT-4o-mini Prompt: Csakra Kézikönyv Generálás

## Használati Útmutató

Ezt a promptot használd ChatGPT-ben (GPT-4o-mini modellel) a Csakra Kézikönyv tartalomgenerálásához.

**Javasolt workflow**:
1. Kezdd a Bevezetővel
2. Generáld a 7 csakrát külön-külön (csakránként 1 prompt)
3. Végül a gyakorlati részt

---

## MASTER PROMPT (Kontextus beállítás)

```
Szerepkör: Spirituális oktató, csakra szakértő és holisztikus wellness coach

Célközönség: 35+ éves magyar nők, akik a spiritualitás és önfejlesztés iránt érdeklődnek, de nem rendelkeznek mély ezoterikus tudással

Feladat: Generálj egy átfogó, gyakorlatias Csakra Kézikönyvet magyar nyelven, amely 90 oldal terjedelmű és egyesíti az elméleti tudást (30%) a gyakorlati eszközökkel (70%).

Követelmények:
- Stílus: Meleg, támogató, személyes (tegező), de szakszerű
- Hangsúly: Konkrét, kivitelezhető gyakorlatokon (ne általános klisék!)
- Példák: Valódi élethelyzetek, amikkel a célközönség azonosulni tud
- Formátum: Markdown, strukturált, jól formázott
- Pontosság: Anatómiai és szanszkrit nevek helyesek legyenek

A tartalomban:
1. Ne legyél túlságosan ezoterikus vagy "woo-woo"
2. Alkalmazz tudományos magyarázatokat, ahol lehetséges (pl. endokrin rendszer)
3. A gyakorlatok konkrétak legyenek (pl. "5 percig légezz 4-4-4 ritmusban" nem pedig "lélegezz mélyen")
4. Affirmációk erősítő, jelenidejű állítások legyenek
5. Minden csakránál következetes struktúra

Most készen állsz a tartalom generálására. Jelezd, ha megértetted a szerepedet és a feladatot.
```

---

## PROMPT 1: Bevezető Rész (10 oldal)

```
Most generáld a Csakra Kézikönyv BEVEZETŐ RÉSZÉT (10 oldal).

Struktúra:

### 1. Bevezetés (2 oldal)
Írj egy barátságos, motiváló bevezetőt, amely:
- Megmagyarázza, mi az a csakra egyszerű nyelven
- Megindokolja, miért fontos a csakra rendszer az életünkben
- Elmagyarázza, hogyan lehet használni ezt a kézikönyvet (nem kell sorrendben olvasni)

### 2. A 7 Csakra Rendszer Története (3 oldal)
Írj egy tömör történeti áttekintést:
- Ősi indiai jóga és ájurvéda eredet (Védikus szövegek)
- Szanszkrit szavak eredete és jelentése
- Hogyan került a nyugati kultúrába (New Age mozgalom)
- Modern tudományos kutatások (pszicho-neuro-immunológia)

### 3. Csakra Anatómia (3 oldal)
Magyarázd el az energetikai anatómiát:
- Mi az a nadi? (energiacsatorna) - Sushumna, Ida, Pingala
- Hogyan kapcsolódnak a csakrák a fizikai testhez?
- Endokrin rendszer és csakrák párosítása (táblázattal)
- Idegrendszeri gúcok (plexusok) és csakrák

### 4. Csakra Állapotok Értelmezése (2 oldal)
Definiáld a csakra állapotokat példákkal:
- Egészséges/kiegyensúlyozott csakra jellemzői
- Blokkolt csakra: okok és következmények
- Alulműködés vs. Túlműködés közötti különbség
- Hogyan ismerheted fel saját csakráid állapotát?

Formátum: Markdown, fejlécekkel strukturálva, olvasható bekezdésekben.
Stílus: Személyes, inspiráló, de informatív.
Terjedelem: Kb. 3000 szó (10 oldal).

Kezdd el most a generálást!
```

---

## PROMPT 2-8: Csakra Részletes Leírások (7× 10 oldal)

**Használd ezt a template-et minden egyes csakrához (7×):**

```
Most generáld a [CSAKRA NEVE] részletes leírását (10 oldal).

CSAKRA ADATOK:
- Magyar név: [pl. Gyökércsakra]
- Szanszkrit: [pl. Muladhara]
- Lokáció: [pl. Gerincoszlop alja]
- Szín: [pl. Vörös]
- Element: [pl. Föld]
- Mantra: [pl. LAM]
- Életkor: [pl. 0-7 év]

Struktúra (10 oldal):

### 1. Alapadatok (1 oldal)
Listázd ki az összes alapadatot részletesen:
- Összes nevet (magyar, szanszkrit, angol)
- Pontos lokáció (anatómiai leírással)
- Szín és annak jelentése
- Element és kapcsolódó tulajdonságok
- Mantra és használata
- Lótuszszirom szám és szimbolikája
- Kapcsolódó testrészszövetek
- Fejlődési életkor szakasz

### 2. Szimbólumrendszer (2 oldal)
Részletezd a szimbólumokat:
- Yantra geometria leírása és jelentése
- Mitológiai kapcsolatok (hindu istenségek, állatok)
- Egyéb jelképek (természeti elemek, geometriai formák)
- Mit reprezentálnak ezek a szimbólumok?

### 3. Pszichológiai Jelentés (2 oldal)
Mélyítsd el a pszichológiai aspektusokat konkrét példákkal:
- Milyen életterületeket szabályoz ez a csakra?
- Milyen érzelmi mintázatok kapcsolódnak hozzá?
- Hogyan nyilvánul meg a mindennapi életben?
- Valódi élethelyzetek példái (legalább 3 konkrét eset)

### 4. Fizikai Megnyilvánulások (1 oldal)
Konkrét fizikai jellemzők:
- Egészséges csakra: 5-7 konkrét jel
- Blokkolt/alulműködő: 7-10 konkrét tünet
- Túlműködő: 5-7 konkrét tünet
- Melyik betegségek kapcsolódhatnak ehhez?

### 5. Gyakorlati Eszköztár (4 oldal)

#### A) Meditációk (1 oldal)
- 2 db részletes meditáció (10-15 perc)
- Lépésről-lépésre instrukciók
- Légzéstechnikák
- Vizualizációs gyakorlatok

#### B) Kristályok és kövek (0.5 oldal)
- 4-5 ajánlott kristály
- Mindegyikhez rövid leírás: tulajdonságok, használat módja

#### C) Aromaterápia (0.5 oldal)
- 3-4 ajánlott illat/illóolaj
- Használati módok: diffúzor, masszázs, fürdő

#### D) Étkezés (0.5 oldal)
- Milyen ételek támogatják ezt a csakrát?
- 10-15 konkrét étel felsorolása
- Rövid magyarázat a kapcsolatról

#### E) Fizikai gyakorlatok (1 oldal)
- 3-4 jóga ászana részletes leírással
- Lépésről-lépésre utasítások
- Időtartam, ismétlések száma
- Egyéb mozgásformák (pl. tánc, séta)

#### F) Affirmációk (0.5 oldal)
- 7-10 pozitív megerősítő állítás
- Jelenidejű, első személyű
- Konkrétan erre a csakrára szabott
- Használati javaslat (mikor, hogyan ismételd)

Formátum: Markdown, strukturált, könnyen olvasható.
Stílus: Empatikus, motiváló, gyakorlatias.
Terjedelem: Kb. 3000 szó (10 oldal).

Kezdd el a [CSAKRA NEVE] részletes leírásának generálását!
```

**Ismételd meg ezt a promptot 7-szer, minden csakrára:**
1. Gyökércsakra (Muladhara)
2. Szakrális csakra (Svadhisthana)
3. Napfonat csakra (Manipura)
4. Szív csakra (Anahata)
5. Torok csakra (Vishuddha)
6. Harmadik szem (Ajna)
7. Korona csakra (Sahasrara)

---

## PROMPT 9: Gyakorlati Rész (10 oldal)

```
Most generáld a Csakra Kézikönyv GYAKORLATI RÉSZÉT (10 oldal).

Struktúra:

### 8. Csakra Journal Sablon (5 oldal)

#### A) Napi Csakra Check-In (2 oldal)
Készíts egy használható napi naplósablont:
- Minden csakrára külön rubrika (1-10 skála értékelés)
- Reflexiós kérdések mindegyikhez (2-3 kérdés/csakra)
- Hely a mai gyakorlat rögzítésére
- Általános reflexiók szekció
- Példa kitöltve egy napra (hogy lássa a felhasználó)

#### B) Heti Csakra Áttekintés (1.5 oldal)
Heti összefoglaló táblázat:
- Heti mintázatok felismerése
- Mely csakra volt legegyensúlyozatlanabb?
- Mely csakra fejlődött legtöbbet?
- Célok a következő hétre

#### C) Havi Csakra Wellness Tracker (1.5 oldal)
Havonkénti nagy kép:
- Hosszú távú változások követése
- Szezonális mintázatok
- Életesemények és csakra egyensúly kapcsolata
- Siker történetek rögzítése

### 9. 21 Napos Csakra Kihívás (3 oldal)

Készíts egy részletes 21 napos programot:
- Struktúra: 7 csakra × 3 nap = 21 nap
- Minden csakrára 3 nap részletes program
- Minden napra konkrét feladatok:
  - Reggeli gyakorlat (5-10 perc)
  - Napi affirmáció
  - Esti meditáció (10-15 perc)
  - Életstílus módosítás (étkezés, mozgás)

Példa struktúra (alkalmaz mind a 7 csakrára):
**1-3. nap: Gyökércsakra**
- 1. nap: [részletes program]
- 2. nap: [részletes program]
- 3. nap: [részletes program]

**4-6. nap: Szakrális csakra**
[... folytatás]

A program végére csatolj egy:
- Progress tracker táblázatot (naponta pipálható)
- Motivációs tippeket

### 10. Forrásművek & További Olvasmányok (2 oldal)

Készíts egy annotált könyvlistát:
- 10-15 klasszikus mű (angol)
- 5-7 modern könyv (magyar és angol)
- Online kurzusok és alkalmazások
- Magyar nyelvű források
- Tudományos cikkek (ha vannak)

Minden forrásnál rövid (2-3 mondatos) leírás, hogy mi várható belőle.

Formátum: Markdown, használható sablonok, táblázatok.
Stílus: Praktikus, lépésről-lépésre.
Terjedelem: Kb. 3000 szó (10 oldal).

Kezdd el a gyakorlati rész generálását!
```

---

## PROMPT 10: Összefogás és Formázás

```
Most végezd el az alábbi feladatokat a generált Csakra Kézikönyv tartalommal:

1. Készíts egy teljes TARTALOMJEGYZÉKET
   - Minden fejezet és alfejezet oldalszámmal
   - Hierarchikus struktúra
   - Könnyen navigálható

2. Írj egy ZÁRÓSZÓT (1 oldal)
   - Összefoglalás
   - Bátorítás az útra
   - Következő lépések javaslata

3. Készíts egy GYORS REFERENCIA TÁBLÁZATOT (1 oldal)
   - Mind a 7 csakra egy helyen
   - Oszlopok: Név, Lokáció, Szín, Mantra, Fő téma, Gyors tipp

4. Stílus konzisztencia ellenőrzés
   - Használok-e következetesen tegező formát?
   - Minden csakránál ugyanaz a struktúra?
   - Szanszkrit nevek helyesek és konzisztensek?

5. Számold meg a szavakat
   - Hozzávetőlegesen hány szó az egész tartalom?
   - Ez megfelel a 27,000 szavas célnak (90 oldal)?

Végezd el ezeket a feladatokat, és add meg a végső tartalmat!
```

---

## TIPPEK A HATÉKONY HASZNÁLATHOZ

1. **Ne egyben generáld**: Szakaszokra bontva dolgozz, így ellenőrizheted a minőséget
2. **Mentsd el folyamatosan**: Minden generált részt mentsd külön markdown fájlba
3. **Finomítsd, ha kell**: Ha valami nem tetszik, kérj újragenerálást: "Ez túl általános, adj konkrétabb példákat!"
4. **Kombináld a kimeneteket**: A végén egyesítsd az összes generált részt egy nagy dokumentumba

## KÖVETKEZŐ LÉPÉS: PDF KONVERZIÓ

Miután megvan a teljes Markdown tartalom:
1. Használj professzionális Markdown→PDF konvertert (pl. Pandoc, jsPDF)
2. Adj hozzá branding elemeket (logo, színek)
3. Formázd szép, olvasható layouttal
4. Adj hozzá képeket/illusztrációkat, ahol releváns

---

*Ez a prompt csomag segít strukturáltan generálni a teljes 90 oldalas Csakra Kézikönyvet GPT-4o-mini segítségével.*
