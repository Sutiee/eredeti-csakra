/**
 * Chakra Metadata
 * 7 chakras with complete metadata for visualization and interpretation
 */

import type { ChakraMetadata, ChakraName } from "@/types";

export const CHAKRAS: ChakraMetadata[] = [
  {
    key: "root",
    name: "Gyökércsakra",
    nameEn: "Root Chakra",
    sanskritName: "Muladhara",
    color: "#DC143C", // Crimson Red
    position: 1,
    element: "Föld",
    location: "Gerincoszlop alja",
    description: "A stabilitás és biztonság központja. Az alapok, a pénzügyi biztonság és a testtel való kapcsolat."
  },
  {
    key: "sacral",
    name: "Szakrális csakra",
    nameEn: "Sacral Chakra",
    sanskritName: "Svadhisthana",
    color: "#FF8C00", // Dark Orange
    position: 2,
    element: "Víz",
    location: "Köldök alatt",
    description: "Az érzelmek és kreativitás forrása. A szenvedély, az élvezetek és az alkotóerő középpontja."
  },
  {
    key: "solar",
    name: "Napfonat csakra",
    nameEn: "Solar Plexus Chakra",
    sanskritName: "Manipura",
    color: "#FFD700", // Gold
    position: 3,
    element: "Tűz",
    location: "Napfonat (gyomor fölött)",
    description: "Az erő és önbizalom központja. A személyes hatalom, a döntéshozatal és az akarat székhelye."
  },
  {
    key: "heart",
    name: "Szív csakra",
    nameEn: "Heart Chakra",
    sanskritName: "Anahata",
    color: "#32CD32", // Lime Green
    position: 4,
    element: "Levegő",
    location: "Szív közepe",
    description: "A szeretet és kapcsolódás központja. A megbocsátás, az együttérzés és az önszeretet forrása."
  },
  {
    key: "throat",
    name: "Torok csakra",
    nameEn: "Throat Chakra",
    sanskritName: "Vishuddha",
    color: "#4169E1", // Royal Blue
    position: 5,
    element: "Éter",
    location: "Torok",
    description: "Az önkifejezés és kommunikáció központja. Az igazság kimondása és a hiteles kifejezés."
  },
  {
    key: "third_eye",
    name: "Harmadik szem",
    nameEn: "Third Eye Chakra",
    sanskritName: "Ajna",
    color: "#9370DB", // Medium Purple
    position: 6,
    element: "Fény",
    location: "Homlok közepe (két szemöldök között)",
    description: "Az intuíció és belső bölcsesség központja. A megérzések, az álmok és a belső látás."
  },
  {
    key: "crown",
    name: "Korona csakra",
    nameEn: "Crown Chakra",
    sanskritName: "Sahasrara",
    color: "#9400D3", // Dark Violet
    position: 7,
    element: "Kozmikus energia",
    location: "Fejtető",
    description: "A spirituális kapcsolódás központja. Az egység, a békesség és a felsőbb tudatosság."
  }
];

/**
 * Get chakra metadata by name
 */
export function getChakraByName(name: ChakraName): ChakraMetadata | undefined {
  return CHAKRAS.find((chakra) => chakra.name === name);
}

/**
 * Get chakra metadata by position (1-7)
 */
export function getChakraByPosition(position: number): ChakraMetadata | undefined {
  return CHAKRAS.find((chakra) => chakra.position === position);
}

/**
 * Get all chakra names in order
 */
export function getChakraNames(): ChakraName[] {
  return CHAKRAS.map((chakra) => chakra.name);
}

/**
 * Get chakra color by name
 */
export function getChakraColor(name: ChakraName): string {
  const chakra = getChakraByName(name);
  return chakra?.color || "#000000";
}
