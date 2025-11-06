/**
 * Template Variant Selector Component
 *
 * Displays 3 email template variant cards (A/B/C) with pricing,
 * discount badges, and positioning information for selection
 */

'use client';

import { NewsletterVariant } from '@/types';

export interface TemplateVariantSelectorProps {
  selectedVariant: NewsletterVariant;
  onSelect: (variant: NewsletterVariant) => void;
  onPreview?: (variant: NewsletterVariant) => void;
}

interface VariantCardData {
  variant: NewsletterVariant;
  title: string;
  pricing: string;
  discount: string;
  positioning: string;
  badgeColor: string;
  description: string;
}

const VARIANT_DATA: VariantCardData[] = [
  {
    variant: 'a',
    title: 'Variáns A - Prémium',
    pricing: '6 990 Ft',
    discount: '30% kedvezmény',
    positioning: 'Teljes csomag kiemelve',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    description: 'Hangsúlyozza a teljes harmónia csomagot, kiemeli a nagy értéket és az előnyöket.',
  },
  {
    variant: 'b',
    title: 'Variáns B - Alapcsomag',
    pricing: '2 990 Ft',
    discount: '40% kedvezmény',
    positioning: 'Személyre szabott elemzés',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    description: 'A személyre szabott csakra elemzést helyezi előtérbe, kiemelve az egyéni megközelítést.',
  },
  {
    variant: 'c',
    title: 'Variáns C - Meditáció',
    pricing: '3 990 Ft',
    discount: '33% kedvezmény',
    positioning: 'Gyógyító meditációk',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    description: 'A gyógyító meditációkra fókuszál, hangsúlyozva a spirituális élményt és a belső békét.',
  },
];

/**
 * Individual Variant Card
 */
function VariantCard({
  data,
  isSelected,
  onSelect,
  onPreview,
}: {
  data: VariantCardData;
  isSelected: boolean;
  onSelect: () => void;
  onPreview?: () => void;
}): JSX.Element {
  return (
    <div
      className={`backdrop-blur-md bg-gray-800/70 rounded-xl p-6 border transition-all duration-300 cursor-pointer
        ${
          isSelected
            ? 'border-purple-500 ring-2 ring-purple-500/50 bg-gradient-to-br from-purple-500/10 to-rose-500/10 scale-105'
            : 'border-gray-700 hover:border-gray-600 hover:scale-102'
        }
      `}
      onClick={onSelect}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Header with badge */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{data.title}</h3>
        {isSelected && (
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="mb-3">
        <p className="text-3xl font-bold text-white mb-1">{data.pricing}</p>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${data.badgeColor}`}
        >
          {data.discount}
        </span>
      </div>

      {/* Positioning */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-400 mb-1">Pozícionálás</p>
        <p className="text-sm text-white">{data.positioning}</p>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-4 leading-relaxed">
        {data.description}
      </p>

      {/* Preview button */}
      {onPreview && (
        <button
          className="w-full px-4 py-2 text-sm font-medium text-purple-300 bg-purple-500/10 border border-purple-500/30 rounded-md hover:bg-purple-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
        >
          👁 Előnézet
        </button>
      )}
    </div>
  );
}

/**
 * Main Template Variant Selector Component
 */
export function TemplateVariantSelector({
  selectedVariant,
  onSelect,
  onPreview,
}: TemplateVariantSelectorProps): JSX.Element {
  return (
    <div role="radiogroup" aria-label="Email sablon variáns választó">
      <h2 className="text-xl font-semibold text-white mb-4">
        Válassz Email Sablont
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VARIANT_DATA.map((data) => (
          <VariantCard
            key={data.variant}
            data={data}
            isSelected={selectedVariant === data.variant}
            onSelect={() => onSelect(data.variant)}
            onPreview={onPreview ? () => onPreview(data.variant) : undefined}
          />
        ))}
      </div>

      {/* Helper text */}
      <div className="mt-6 backdrop-blur-md bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
        <p className="text-sm text-blue-200">
          💡 <strong>Tipp:</strong> Az A/B/C tesztelés segít megtalálni a legjobban
          konvertáló email sablont. Válaszd ki a kampányodhoz legmegfelelőbb variánst
          a célközönséged alapján.
        </p>
      </div>
    </div>
  );
}
