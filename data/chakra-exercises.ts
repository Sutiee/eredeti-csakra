/**
 * Fixed placeholder exercises for each chakra
 *
 * USAGE:
 * - Only shown for blocked chakras (score 4-12)
 * - Same for all users (not personalized)
 * - 3 exercises per chakra
 * - Hungarian language, tegező form
 *
 * PURPOSE:
 * - Provide simple, actionable daily practices
 * - Help users start their chakra healing journey
 * - Complement the detailed analysis (no personalization needed)
 */

export const CHAKRA_EXERCISES: Record<string, string[]> = {
  'Gyökércsakra': [
    'Állj mezítláb a földön (fű, föld, homok) 10 percet minden reggel. A földdel való kapcsolat erősíti a biztonságérzeted.',
    'Guggolj le naponta 20 alkalommal lassan és tudatosan. A guggolás aktivizálja a gyökércsakrád és erősíti az alsó tested.',
    'Fogyassz gyökérzöldségeket (répa, cékla, burgonya, retek) minden nap. A gyökerek táplálják a gyökércsakrádat.',
  ],
  'Szakrális csakra': [
    'Táncolj szabadon 15 percet naponta olyan zenére, ami megmozgat. Engedd, hogy a tested vezessen.',
    'Vegyél meleg fürdőt illóolajokkal (narancs, vanília, szantálfa) hetente 2-3 alkalommal. A víz gyógyítja a szakrális csakrát.',
    'Gyakorold a csípő körzést állva vagy ülve minden irányba, lassan és tudatosan. Ez aktivizálja a kreatív energiádat.',
  ],
  'Napfonat csakra': [
    'Végezz napüdvözletet (Surya Namaskar) 5-10 alkalommal minden reggel. A napenergia tölti fel a napfonat csakrádat.',
    'Gyakorold a mély haslélegzést 5 percig naponta: lélegezz be mélyre a hasba, lélegezz ki hosszan. Ez erősíti az akaratod.',
    'Állj ki a napra 10-15 percre délelőtt (lehetőleg 10-12 óra között). A napfény energiája táplája a napfonat csakrádnak.',
  ],
  'Szív csakra': [
    'Írj hálalistát minden este 5 dologról, amiért hálás vagy. A hálaadás megnyitja a szívcsakrádat.',
    'Öleld át magad 1 percig minden reggel úgy, mintha a legjobb barátnődet ölelnéd. Az önszeretet gyógyítja a szívet.',
    'Gyakorold a szív-központú légzést: helyezd a kezed a szívedre, lélegezz mélyen, és képzeld el, ahogy szeretet áramlik be és ki a szívedből.',
  ],
  'Torok csakra': [
    'Énekelj vagy zümmögj (humming) 5 percet naponta. A rezgés aktivizálja és tisztítja a torokcsakrádat.',
    'Mondd ki hangosan a teljes nevedet 10-szer minden reggel magabiztosan. Ez erősíti az önkifejezésedet.',
    'Gyakorold a nyakforgatást lassan minden irányba: jobbra, balra, előre, hátra. Ez oldja a torokcsakra blokkját.',
  ],
  'Harmadik szem': [
    'Meditálj 10 percet csukott szemmel naponta, fókuszálva a homlokod közepére. Ez aktivizálja az intuíciódat.',
    'Írj le 3 álmot, intuíciót vagy belső látomást minden reggel azonnal ébredés után. Ez erősíti a belső látásodat.',
    'Gyakorold a szemforgatást minden irányba (fel, le, jobbra, balra, körbe) 2-3 alkalommal. Ez aktivizálja a harmadik szemet.',
  ],
  'Korona csakra': [
    'Ülj csendben 5-10 percet minden reggel anélkül, hogy bármit tennél vagy gondolnál. Csak légy jelen.',
    'Nézd az eget (nappal a kék eget, éjjel a csillagokat) 10 percig naponta. Ez összeköt az univerzummal.',
    'Ismételj "Om" mantrát 108-szor (vagy 21-szer kezdőként) lassan, tudatosan. Ez megnyitja a korona csakrádat.',
  ],
};

/**
 * Helper function to get exercises for blocked chakras only
 * @param chakraScores - Object mapping chakra names to scores (4-16)
 * @returns Object with chakra names as keys and exercise arrays as values
 */
export function getExercisesForBlockedChakras(
  chakraScores: Record<string, number>
): Record<string, string[]> {
  const blockedChakras: Record<string, string[]> = {};

  Object.entries(chakraScores).forEach(([chakraName, score]) => {
    // Only include if score ≤ 12 (blocked or imbalanced)
    if (score <= 12 && CHAKRA_EXERCISES[chakraName]) {
      blockedChakras[chakraName] = CHAKRA_EXERCISES[chakraName];
    }
  });

  return blockedChakras;
}
