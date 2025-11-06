/**
 * Recipient Source Toggle Component
 *
 * Radio button toggle for selecting between CSV upload or saved list
 */

'use client';

export type RecipientSourceToggleProps = {
  value: 'upload' | 'saved';
  onChange: (value: 'upload' | 'saved') => void;
};

/**
 * Recipient Source Toggle Component
 */
export function RecipientSourceToggle({
  value,
  onChange,
}: RecipientSourceToggleProps): JSX.Element {
  return (
    <div className="backdrop-blur-md bg-gray-800/70 rounded-2xl border border-gray-700 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Címzettek Forrása</h3>

      <div className="space-y-3">
        {/* Upload Option */}
        <label
          className={`
            flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
            ${value === 'upload'
              ? 'bg-purple-500/20 border-purple-500'
              : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
            }
          `}
        >
          <input
            type="radio"
            name="recipientSource"
            value="upload"
            checked={value === 'upload'}
            onChange={() => onChange('upload')}
            className="mt-1 mr-3 text-purple-600 focus:ring-purple-500 focus:ring-2"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📤</span>
              <span className="text-white font-medium">Új címlista feltöltése (CSV)</span>
            </div>
            <p className="text-sm text-gray-400">
              Tölts fel egy új CSV fájlt címzettekkel és variánsokkal
            </p>
          </div>
        </label>

        {/* Saved List Option */}
        <label
          className={`
            flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
            ${value === 'saved'
              ? 'bg-purple-500/20 border-purple-500'
              : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
            }
          `}
        >
          <input
            type="radio"
            name="recipientSource"
            value="saved"
            checked={value === 'saved'}
            onChange={() => onChange('saved')}
            className="mt-1 mr-3 text-purple-600 focus:ring-purple-500 focus:ring-2"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📋</span>
              <span className="text-white font-medium">Elmentett címlista használata</span>
            </div>
            <p className="text-sm text-gray-400">
              Válassz egy korábban elmentett címlistát a gyorsabb használathoz
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
