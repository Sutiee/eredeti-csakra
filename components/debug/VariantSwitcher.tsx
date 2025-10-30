/**
 * Variant Switcher Debug Component
 * Shows a floating debug panel for switching between A/B/C pricing variants
 * Only visible in development mode or when explicitly enabled
 */

'use client';

import { useState, useEffect } from 'react';
import { getCurrentVariant, type VariantId } from '@/lib/pricing/variants';

type VariantSwitcherProps = {
  forceShow?: boolean; // Force show even in production (for testing)
};

export default function VariantSwitcher({ forceShow = false }: VariantSwitcherProps): JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<VariantId>('a');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Only show in development or if forceShow is true
    const isDev = process.env.NODE_ENV === 'development';
    const showDebug = isDev || forceShow || window.location.search.includes('debug=true');

    setIsVisible(showDebug);

    // Get current variant
    if (showDebug) {
      setCurrentVariant(getCurrentVariant());
    }
  }, [forceShow]);

  if (!isVisible) return null;

  const variants: Array<{ id: VariantId; name: string; prices: string; color: string }> = [
    {
      id: 'a',
      name: 'Variant A (Control)',
      prices: 'AI: 990 Ft | Workbook: 3,990 Ft',
      color: 'bg-blue-500',
    },
    {
      id: 'b',
      name: 'Variant B (Mid-Tier)',
      prices: 'AI: 1,990 Ft | Workbook: 4,990 Ft',
      color: 'bg-green-500',
    },
    {
      id: 'c',
      name: 'Variant C (Premium)',
      prices: 'AI: 2,990 Ft | Workbook: 5,990 Ft',
      color: 'bg-purple-500',
    },
  ];

  const switchVariant = (variantId: VariantId): void => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('variant', variantId);
    window.location.href = currentUrl.toString();
  };

  const copyLink = (variantId: VariantId): void => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('variant', variantId);
    const link = currentUrl.toString();

    navigator.clipboard.writeText(link).then(() => {
      alert(`✅ Link copied for Variant ${variantId.toUpperCase()}:\n${link}`);
    });
  };

  const currentVariantData = variants.find((v) => v.id === currentVariant);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      {/* Collapsed state - floating badge */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={`${currentVariantData?.color} text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-bold text-sm`}
        >
          <span>🧪</span>
          <span>Variant {currentVariant.toUpperCase()}</span>
        </button>
      )}

      {/* Expanded state - full panel */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-2xl p-4 w-80 border-2 border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧪</span>
              <h3 className="font-bold text-gray-800">A/B/C Test Debug</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-xl w-6 h-6 flex items-center justify-center"
              aria-label="Collapse"
            >
              ✕
            </button>
          </div>

          {/* Current Variant Display */}
          <div className={`${currentVariantData?.color} text-white rounded-lg p-3 mb-4`}>
            <div className="font-bold text-sm mb-1">Currently Active:</div>
            <div className="text-lg font-black">{currentVariantData?.name}</div>
            <div className="text-xs opacity-90 mt-1">{currentVariantData?.prices}</div>
          </div>

          {/* Variant Buttons */}
          <div className="space-y-2 mb-4">
            {variants.map((variant) => (
              <div key={variant.id} className="flex gap-2">
                <button
                  onClick={() => switchVariant(variant.id)}
                  disabled={currentVariant === variant.id}
                  className={`flex-1 ${
                    currentVariant === variant.id
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : `${variant.color} text-white hover:opacity-90`
                  } px-3 py-2 rounded font-semibold text-sm transition-all disabled:opacity-50`}
                >
                  {variant.id.toUpperCase()}
                  {currentVariant === variant.id && ' ✓'}
                </button>
                <button
                  onClick={() => copyLink(variant.id)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-all"
                  title="Copy link"
                >
                  📋
                </button>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
            <div className="mb-2">
              <strong>Current URL:</strong>
              <div className="text-xs break-all bg-gray-50 p-2 rounded mt-1 font-mono">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Cookie: __variant={currentVariant}</span>
              <button
                onClick={() => {
                  document.cookie = '__variant=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  window.location.reload();
                }}
                className="text-red-600 hover:text-red-800 underline text-xs"
              >
                Clear Cookie
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
