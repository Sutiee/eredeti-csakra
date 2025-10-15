/**
 * Example usage of ChakraSilhouette component
 *
 * This component visualizes chakra scores on a body silhouette
 * with interactive chakra points that respond to user interaction.
 */

import ChakraSilhouette from "./ChakraSilhouette";
import type { ChakraScore } from "@/types";

// Example: Using in a result page
export function ResultPageExample() {
  // Sample chakra scores (would come from quiz results)
  const chakraScores: ChakraScore[] = [
    {
      chakra: "Gyökércsakra",
      score: 14,
      level: "balanced",
      interpretation: {
        status: "Kiegyensúlyozott",
        summary: "A gyökércsakra egészséges állapotban van...",
        manifestations: ["Biztonságérzet", "Stabil alapok"],
        first_aid_plan: "Tartsd fenn ezt az állapotot...",
      },
    },
    {
      chakra: "Szakrális csakra",
      score: 10,
      level: "imbalanced",
      interpretation: {
        status: "Kiegyensúlyozatlan",
        summary: "A szakrális csakra figyelmet igényel...",
        manifestations: ["Kreativitás hiánya", "Érzelmi instabilitás"],
        first_aid_plan: "Kreatív tevékenységek...",
      },
    },
    // ... other chakras
  ];

  const handleChakraClick = (chakraKey: string) => {
    // Scroll to the detailed card
    const element = document.getElementById(`chakra-${chakraKey}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Az eredményed
      </h1>

      {/* Chakra Silhouette Visualization */}
      <div className="mb-12">
        <ChakraSilhouette
          chakraScores={chakraScores}
          onChakraClick={handleChakraClick}
        />
      </div>

      {/* Detailed Cards */}
      <div className="space-y-8">
        {chakraScores.map((score) => (
          <div
            key={score.chakra}
            id={`chakra-root`} // Use actual chakra key
            className="p-6 bg-white rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-4">{score.chakra}</h2>
            <p className="text-lg mb-2">Pontszám: {score.score}/16</p>
            <p className="text-gray-600">{score.interpretation.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example: Standalone usage
export function StandaloneExample() {
  const chakraScores: ChakraScore[] = [
    // ... chakra scores
  ];

  return (
    <div className="max-w-md mx-auto p-4">
      <ChakraSilhouette chakraScores={chakraScores} />
    </div>
  );
}
