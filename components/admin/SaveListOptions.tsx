/**
 * Save List Options Component
 *
 * Form inputs for saving a new recipient list
 * with name, description, and save checkbox
 */

'use client';

export type SaveListOptionsProps = {
  listName: string;
  onListNameChange: (name: string) => void;
  listDescription: string;
  onDescriptionChange: (desc: string) => void;
  shouldSave: boolean;
  onShouldSaveChange: (save: boolean) => void;
};

/**
 * Save List Options Component
 */
export function SaveListOptions({
  listName,
  onListNameChange,
  listDescription,
  onDescriptionChange,
  shouldSave,
  onShouldSaveChange,
}: SaveListOptionsProps): JSX.Element {
  const MAX_NAME_LENGTH = 100;
  const MAX_DESCRIPTION_LENGTH = 500;

  const nameCharCount = listName.length;
  const nameCharsRemaining = MAX_NAME_LENGTH - nameCharCount;
  const descCharCount = listDescription.length;
  const descCharsRemaining = MAX_DESCRIPTION_LENGTH - descCharCount;

  return (
    <div className="backdrop-blur-md bg-gray-800/70 rounded-xl border border-gray-700 p-6 shadow-lg space-y-4">
      {/* Save Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={shouldSave}
          onChange={(e) => onShouldSaveChange(e.target.checked)}
          className="mt-1 w-5 h-5 text-purple-600 focus:ring-purple-500 focus:ring-2 rounded"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium group-hover:text-purple-300 transition-colors duration-200">
              Lista mentése későbbi használatra
            </span>
            <span className="text-xl">💾</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Mentsd el ezt a címlistát, hogy később újra felhasználhasd
          </p>
        </div>
      </label>

      {/* Conditional inputs when checkbox is checked */}
      {shouldSave && (
        <div className="space-y-4 pl-8 animate-in slide-in-from-top-2 duration-300">
          {/* List Name Input */}
          <div>
            <label htmlFor="list-name" className="block text-sm font-medium text-gray-300 mb-2">
              Lista neve <span className="text-red-400">*</span>
            </label>
            <input
              id="list-name"
              type="text"
              value={listName}
              onChange={(e) => {
                if (e.target.value.length <= MAX_NAME_LENGTH) {
                  onListNameChange(e.target.value);
                }
              }}
              placeholder="pl. Januári Promóciós Lista 2025"
              maxLength={MAX_NAME_LENGTH}
              className={`
                w-full px-4 py-3 rounded-lg border text-white placeholder-gray-400
                focus:outline-none focus:ring-2 transition-all duration-200
                ${listName.trim() === ''
                  ? 'bg-gray-700/50 border-gray-600 focus:ring-purple-500'
                  : 'bg-gray-700/50 border-gray-600 focus:ring-purple-500'
                }
              `}
              required
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">
                Adj meg egy egyedi, könnyen felismerhető nevet
              </p>
              <span
                className={`text-xs font-medium ${
                  nameCharsRemaining < 20 ? 'text-amber-400' : 'text-gray-400'
                }`}
              >
                {nameCharCount} / {MAX_NAME_LENGTH}
              </span>
            </div>
          </div>

          {/* List Description Textarea */}
          <div>
            <label htmlFor="list-description" className="block text-sm font-medium text-gray-300 mb-2">
              Leírás <span className="text-gray-500">(opcionális)</span>
            </label>
            <textarea
              id="list-description"
              value={listDescription}
              onChange={(e) => {
                if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                  onDescriptionChange(e.target.value);
                }
              }}
              placeholder="pl. Email lista a januári 50%-os kedvezményes kampányhoz..."
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">
                Rövid leírás a lista tartalmáról vagy céljáról
              </p>
              <span
                className={`text-xs font-medium ${
                  descCharsRemaining < 50 ? 'text-amber-400' : 'text-gray-400'
                }`}
              >
                {descCharCount} / {MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>

          {/* Info box */}
          <div className="backdrop-blur-md bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <p className="text-sm text-blue-300 font-medium mb-1">
                  Tipp
                </p>
                <p className="text-sm text-gray-400">
                  A mentett lista minden címzettet tartalmaz a feltöltött CSV fájlból,
                  beleértve a variáns eloszlást is. Később egyetlen kattintással újra felhasználhatod.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
