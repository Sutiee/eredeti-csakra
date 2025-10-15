/**
 * Date Range Picker Component
 *
 * Simple button group for selecting date range (7, 30, 90, 365 days)
 * Used to filter dashboard statistics
 */

'use client';

interface DateRangePickerProps {
  value: number;
  onChange: (days: number) => void;
}

interface DateRangeOption {
  label: string;
  value: number;
}

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { label: 'Utolsó 7 nap', value: 7 },
  { label: 'Utolsó 30 nap', value: 30 },
  { label: 'Utolsó 90 nap', value: 90 },
  { label: 'Utolsó év', value: 365 },
];

/**
 * Date Range Picker Component
 */
export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 border border-white/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Áttekintés</h2>
          <p className="text-sm text-gray-300 mt-1">
            Valós idejű analitika és statisztikák
          </p>
        </div>

        {/* Date Range Button Group */}
        <div className="flex flex-wrap gap-2">
          {DATE_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  value === option.value
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-200 hover:bg-white/20'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
