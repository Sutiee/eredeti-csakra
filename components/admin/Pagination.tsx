/**
 * Pagination Component
 *
 * Provides pagination controls for navigating through large datasets
 * with items per page selector and page navigation
 */

'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="backdrop-blur-md bg-gray-800/70 rounded-xl border border-gray-700 p-4 mt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="items-per-page"
            className="text-sm font-medium text-gray-300 whitespace-nowrap"
          >
            Elemek száma:
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              onPageChange(1); // Reset to first page when changing items per page
            }}
            className="px-3 py-1.5 text-sm border border-gray-700 rounded-md bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
            aria-label="Elemek száma oldalanként"
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Page info and navigation */}
        <div className="flex items-center gap-4">
          {/* Item count display */}
          <div className="text-sm text-gray-300">
            <span className="font-medium">
              {startItem}-{endItem}
            </span>
            {' / '}
            <span>{totalItems.toLocaleString('hu-HU')}</span>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPrevious}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                ${
                  canGoPrevious
                    ? 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
              aria-label="Előző oldal"
              aria-disabled={!canGoPrevious}
            >
              ‹ Előző
            </button>

            {/* Page indicator */}
            <div className="px-4 py-1.5 text-sm font-medium text-gray-300 bg-gray-900 rounded-md border border-gray-700">
              Oldal{' '}
              <span className="text-purple-400 font-semibold">
                {currentPage}
              </span>
              {' / '}
              <span>{totalPages}</span>
            </div>

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNext}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                ${
                  canGoNext
                    ? 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
              aria-label="Következő oldal"
              aria-disabled={!canGoNext}
            >
              Következő ›
            </button>
          </div>
        </div>
      </div>

      {/* Optional: Jump to page (only show if there are many pages) */}
      {totalPages > 5 && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-center gap-2">
          <label
            htmlFor="jump-to-page"
            className="text-sm font-medium text-gray-300"
          >
            Ugrás az oldalra:
          </label>
          <input
            id="jump-to-page"
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = Number(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="w-20 px-3 py-1.5 text-sm border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            aria-label="Oldalszám bevitele"
          />
        </div>
      )}
    </div>
  );
}
