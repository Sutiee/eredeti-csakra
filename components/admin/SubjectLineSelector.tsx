/**
 * Subject Line Selector Component
 *
 * Radio button group for selecting email subject lines
 * with preview text and character count indicators
 */

'use client';

import { NewsletterVariant } from '@/types';

export interface SubjectLineSelectorProps {
  selectedSubject: number;
  onSelect: (id: number) => void;
  variantId: NewsletterVariant;
}

interface SubjectLineOption {
  id: number;
  subject: string;
  previewText: string;
  variant: NewsletterVariant;
}

/**
 * Subject line options (variant-specific with pricing)
 */
const SUBJECT_LINES: SubjectLineOption[] = [
  // Variant A options (Premium bundle - 6,990 Ft)
  {
    id: 1,
    subject: '🌟 30% kedvezmény a Teljes Csakra Harmónia csomagra',
    previewText: 'Fedezd fel minden csakrád titkait egy komplett csomag erejével',
    variant: 'a',
  },
  {
    id: 2,
    subject: '✨ Harmonizáld minden csakrádat - most 6.990 Ft-ért',
    previewText: 'A teljes út megértéshez és gyógyuláshoz egyetlen kattintásra',
    variant: 'a',
  },
  {
    id: 3,
    subject: '🔮 Kezdd el csakra utazásod a komplett csomag erejével',
    previewText: 'Minden eszközt megadsz ami kell a tökéletes egyensúlyhoz',
    variant: 'a',
  },

  // Variant B options (Personal analysis - 2,990 Ft)
  {
    id: 4,
    subject: '📊 Személyre szabott csakra elemzésed vár - 40% kedvezmény',
    previewText: 'Egyéni útmutatóval a blokkok feloldásához és a gyógyuláshoz',
    variant: 'b',
  },
  {
    id: 5,
    subject: '💎 Fedezd fel csakráid mélyebb rétegeit - most 2.990 Ft',
    previewText: 'Részletes elemzés, amely megmutatja pontosan hol tartasz',
    variant: 'b',
  },
  {
    id: 6,
    subject: '🌸 Az út az önismerethez - személyre szabott csakra jelentés',
    previewText: 'Egyedi tervvel indulj el a belső harmónia megteremtéséhez',
    variant: 'b',
  },

  // Variant C options (Meditations - 3,990 Ft)
  {
    id: 7,
    subject: '🧘‍♀️ 7 gyógyító meditáció a csakráid aktivizálásához',
    previewText: 'Mélyítsd el spirituális gyakorlatod vezetett meditációkkal',
    variant: 'c',
  },
  {
    id: 8,
    subject: '🎵 33% kedvezmény az aktivizáló meditációkra - 3.990 Ft',
    previewText: 'Hangfrekvenciákkal és vezetett gyakorlatokkal a gyógyuláshoz',
    variant: 'c',
  },
  {
    id: 9,
    subject: '✨ Transzformáld energiáid 7 erőteljes meditációval',
    previewText: 'Professzionális hanganyagok minden csakrához külön-külön',
    variant: 'c',
  },
];

/**
 * Get character count color based on optimal range
 */
function getCharCountColor(length: number): string {
  if (length >= 40 && length <= 50) return 'text-green-400';
  if (length >= 30 && length < 40) return 'text-yellow-400';
  if (length > 50 && length <= 60) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Individual Subject Line Option
 */
function SubjectLineOption({
  option,
  isSelected,
  onSelect,
}: {
  option: SubjectLineOption;
  isSelected: boolean;
  onSelect: () => void;
}): JSX.Element {
  const charCount = option.subject.length;
  const charCountColor = getCharCountColor(charCount);

  return (
    <label
      className={`block backdrop-blur-md bg-gray-800/70 rounded-xl p-4 border transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? 'border-purple-500 ring-2 ring-purple-500/50 bg-gradient-to-r from-purple-500/10 to-rose-500/10'
            : 'border-gray-700 hover:border-gray-600'
        }
      `}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex items-start gap-3">
        {/* Radio button */}
        <input
          type="radio"
          name="subject-line"
          checked={isSelected}
          onChange={onSelect}
          className="mt-1 h-4 w-4 text-purple-600 border-gray-600 focus:ring-purple-500 focus:ring-offset-gray-800 bg-gray-700"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Subject line */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <p
              className={`text-sm font-medium leading-tight ${
                isSelected ? 'text-white' : 'text-gray-200'
              }`}
            >
              {option.subject}
            </p>
            <span className={`text-xs font-mono whitespace-nowrap ${charCountColor}`}>
              {charCount} kar
            </span>
          </div>

          {/* Preview text */}
          <p className="text-xs text-gray-400 leading-relaxed">
            {option.previewText}
          </p>
        </div>
      </div>
    </label>
  );
}

/**
 * Main Subject Line Selector Component
 */
export function SubjectLineSelector({
  selectedSubject,
  onSelect,
  variantId,
}: SubjectLineSelectorProps): JSX.Element {
  // Filter subject lines by variant
  const filteredSubjects = SUBJECT_LINES.filter(
    (s) => s.variant === variantId
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          Válassz Tárgy Sort
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Optimális (40-50)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            Elfogadható
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Túl rövid/hosszú
          </span>
        </div>
      </div>

      <div className="space-y-3" role="radiogroup" aria-label="Tárgy sor választó">
        {filteredSubjects.map((option) => (
          <SubjectLineOption
            key={option.id}
            option={option}
            isSelected={selectedSubject === option.id}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>

      {/* Helper info */}
      <div className="mt-4 backdrop-blur-md bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
        <p className="text-xs text-blue-200">
          💡 <strong>Tipp:</strong> A 40-50 karakteres tárgy sorok átlagosan 15-20%-kal
          magasabb megnyitási arányt érnek el. A rövid, egyértelmű üzenetek a
          leghatékonyabbak.
        </p>
      </div>
    </div>
  );
}
