# ChakraDetailPanel Component

A React component that displays detailed information about a selected chakra in a visually appealing card format.

## Features

- **Animated Transitions**: Smooth Framer Motion animations when switching between chakras
- **Color-Coded Status**: Visual indicators based on chakra health level
  - 🔴 **Blocked (4-7)**: Red warning badge
  - 🟠 **Imbalanced (8-12)**: Orange warning badge
  - 🟢 **Balanced (13-16)**: Green checkmark badge
- **Four Main Sections**:
  1. Header with chakra name, status, and score
  2. Summary (📝 Összegzés)
  3. Manifestations (💫 Megnyilvánulások)
  4. Immediate Action Plan (💡 Azonnal Tennivaló)
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Chakra-Themed Styling**: Gradients and colors match each chakra's unique color
- **Optional "Most Blocked" Badge**: Highlights the chakra that needs the most attention

## Props

```typescript
type ChakraDetailPanelProps = {
  chakra: ChakraScore;      // The chakra data (from quiz results)
  isTopBlocked: boolean;    // Is this the most blocked chakra?
};
```

### ChakraScore Type

```typescript
type ChakraScore = {
  chakra: ChakraName;              // e.g., "Gyökércsakra"
  score: number;                   // 4-16
  level: InterpretationLevel;      // "blocked" | "imbalanced" | "balanced"
  interpretation: InterpretationData;
};

type InterpretationData = {
  status: string;                  // e.g., "Erősen blokkolt"
  summary: string;                 // Main description
  manifestations: string[];        // List of symptoms/signs
  first_aid_plan: string;          // Immediate action to take
};
```

## Usage

```tsx
import ChakraDetailPanel from '@/components/result/ChakraDetailPanel';

function ResultPage() {
  const chakraScore: ChakraScore = {
    chakra: 'Gyökércsakra',
    score: 6,
    level: 'blocked',
    interpretation: {
      status: 'Erősen blokkolt',
      summary: 'Az alapjaid meginogtak...',
      manifestations: [
        'Állandó anyagi gondok, hiánytudat',
        'A test elutasítása, elhízás vagy étkezési zavarok',
        // ...
      ],
      first_aid_plan: 'Azonnali fókusz a földelésre...',
    },
  };

  return (
    <ChakraDetailPanel
      chakra={chakraScore}
      isTopBlocked={true}
    />
  );
}
```

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│  🔥 Leginkább blokkolt (if isTopBlocked)                │
│                                                           │
│  ┌───┐  Gyökércsakra                                    │
│  │ 1 │  Muladhara                                        │
│  └───┘                                                    │
│        ⚠️ 🔴 Gyökércsakra - Erősen blokkolt            │
│        Pontszám: 6/16                                    │
│                                                           │
│  ┌─ 📝 Összegzés ──────────────────────────────────┐   │
│  │ Az alapjaid meginogtak. Jelenleg valószínűleg... │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─ 💫 Megnyilvánulások ────────────────────────────┐   │
│  │ • Állandó anyagi gondok, hiánytudat               │   │
│  │ • A test elutasítása, elhízás vagy étkezési...    │   │
│  │ • Félelem a változástól, merevség                 │   │
│  │ • Fizikai szinten: derékfájás, immunrendszeri...  │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─ 💡 Azonnal Tennivaló ───────────────────────────┐   │
│  │ Azonnali fókusz a földelésre: tölts több időt... │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Integration with Quiz Results

This component is designed to work seamlessly with the quiz results system:

```tsx
import { generateInterpretations } from '@/lib/quiz/interpretations';
import ChakraDetailPanel from '@/components/result/ChakraDetailPanel';

function ResultPage({ quizResult }: { quizResult: QuizResult }) {
  // Generate interpretations from quiz scores
  const interpretations = generateInterpretations(quizResult.chakra_scores);

  // Find the most blocked chakra
  const mostBlockedChakra = interpretations
    .filter(c => c.level === 'blocked')
    .sort((a, b) => a.score - b.score)[0];

  return (
    <div>
      {interpretations.map(chakra => (
        <ChakraDetailPanel
          key={chakra.chakra}
          chakra={chakra}
          isTopBlocked={chakra.chakra === mostBlockedChakra?.chakra}
        />
      ))}
    </div>
  );
}
```

## Styling Details

### Color Scheme by Level

| Level | Color | Icon | Background |
|-------|-------|------|------------|
| Blocked | Red (#DC2626) | ⚠️ | Rose (bg-rose-50) |
| Imbalanced | Orange (#F59E0B) | ⚠️ | Amber (bg-amber-50) |
| Balanced | Green (#10B981) | ✓ | Emerald (bg-emerald-50) |

### Chakra Colors

Each chakra has its own unique color (defined in `/lib/quiz/chakras.ts`):

1. 🔴 Gyökércsakra - #DC143C (Crimson Red)
2. 🟠 Szakrális csakra - #FF8C00 (Dark Orange)
3. 🟡 Napfonat csakra - #FFD700 (Gold)
4. 💚 Szív csakra - #32CD32 (Lime Green)
5. 🔵 Torok csakra - #4169E1 (Royal Blue)
6. 🟣 Harmadik szem - #9370DB (Medium Purple)
7. ⚪ Korona csakra - #9400D3 (Dark Violet)

## Animation Details

- **Entry Animation**: Fade in from bottom (opacity 0 → 1, y: 20 → 0)
- **Exit Animation**: Fade out to top (opacity 1 → 0, y: 0 → -20)
- **Pulsing Badge**: Chakra number badge has a pulsing glow effect
- **Staggered List Items**: Manifestations animate in sequentially with delays

## Accessibility

- Semantic HTML structure with `<h2>` and `<h3>` headings
- Decorative icons marked with `aria-hidden="true"`
- Clear visual hierarchy and readable contrast ratios
- Focus states on interactive elements

## File Structure

```
components/result/
├── ChakraDetailPanel.tsx          # Main component
├── ChakraDetailPanel.example.tsx  # Example usage
└── ChakraDetailPanel.README.md    # This file
```

## Dependencies

- **framer-motion**: For animations
- **@/types**: TypeScript type definitions
- **@/lib/quiz/chakras**: Chakra metadata utilities

## Related Components

- `ChakraCards.tsx` - Displays all 7 chakras in a vertical list
- `ChakraSilhouette.tsx` - SVG body visualization with chakra points
- `MobileChakraAccordion.tsx` - Mobile-friendly accordion view

## Design Philosophy

The component follows the spiritual wellness aesthetic of the Eredeti Csakra application:

- **Warm, empathetic tone** - Hungarian language, informal "te" form
- **Visual harmony** - Gradient backgrounds, soft shadows
- **Clear information hierarchy** - Summary → Details → Action
- **Action-oriented** - Always provides concrete next steps

---

**Last Updated**: 2025-10-17
**Version**: v2.0
