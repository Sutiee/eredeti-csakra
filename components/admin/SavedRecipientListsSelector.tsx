/**
 * Saved Recipient Lists Selector Component
 *
 * Displays saved recipient lists with variant distribution
 * and allows selection/deletion with confirmation
 */

'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/admin/swr-config';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { toast } from 'sonner';

export type SavedRecipientList = {
  id: string;
  name: string;
  description?: string;
  total_recipients: number;
  variant_a_count: number;
  variant_b_count: number;
  variant_c_count: number;
  created_at: string;
};

type SavedRecipientListsResponse = {
  data: {
    lists: SavedRecipientList[];
    total: number;
  };
  error: { message: string } | null;
};

export type SavedRecipientListsSelectorProps = {
  onSelectList: (listId: string) => void;
  selectedListId?: string;
};

/**
 * Confirmation Modal Component
 */
function DeleteConfirmationModal({
  listName,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  listName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="backdrop-blur-md bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Lista Törlése</h3>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <p className="text-gray-300 mb-2">
          Biztosan törölni szeretnéd ezt a címlistát?
        </p>
        <p className="text-white font-semibold mb-6">"{listName}"</p>

        <p className="text-sm text-gray-400 mb-6">
          Ez a művelet nem visszavonható. A lista minden címzettje véglegesen törlődik.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mégsem
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Törlés...' : 'Törlés'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * List Card Skeleton Component
 */
function ListCardSkeleton(): JSX.Element {
  return (
    <div className="backdrop-blur-md bg-gray-800/70 rounded-xl border border-gray-700 p-6 animate-pulse">
      <div className="h-6 bg-gray-700 rounded mb-3 w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded mb-2 w-1/2"></div>
      <div className="h-4 bg-gray-700 rounded mb-4 w-1/3"></div>
      <div className="flex gap-2">
        <div className="h-9 bg-gray-700 rounded flex-1"></div>
        <div className="h-9 bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  );
}

/**
 * Main Saved Recipient Lists Selector Component
 */
export function SavedRecipientListsSelector({
  onSelectList,
  selectedListId,
}: SavedRecipientListsSelectorProps): JSX.Element {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<SavedRecipientList | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch saved lists
  const { data, error, isLoading, mutate } = useSWR<SavedRecipientListsResponse>(
    '/api/admin/newsletter/recipient-lists',
    fetcher,
    {
      refreshInterval: 0, // Don't auto-refresh
      revalidateOnFocus: false,
    }
  );

  const lists = data?.data?.lists || [];

  /**
   * Handle delete list
   */
  const handleDeleteClick = (list: SavedRecipientList): void => {
    setListToDelete(list);
    setDeleteModalOpen(true);
  };

  /**
   * Confirm delete
   */
  const handleConfirmDelete = async (): Promise<void> => {
    if (!listToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/newsletter/recipient-lists/${listToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Lista törlése sikertelen');
      }

      toast.success('Lista sikeresen törölve!');

      // Refresh lists
      mutate();

      // Close modal
      setDeleteModalOpen(false);
      setListToDelete(null);

      // If the deleted list was selected, clear selection
      if (selectedListId === listToDelete.id) {
        onSelectList('');
      }
    } catch (error) {
      console.error('Delete list error:', error);
      toast.error(error instanceof Error ? error.message : 'Hiba történt a lista törlése során');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Cancel delete
   */
  const handleCancelDelete = (): void => {
    setDeleteModalOpen(false);
    setListToDelete(null);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'yyyy. MMM dd., HH:mm', { locale: hu });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Elmentett Címlisták</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <ListCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="backdrop-blur-md bg-red-500/10 rounded-xl p-6 border border-red-500/20">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-lg font-semibold text-red-300">Hiba történt</h3>
        </div>
        <p className="text-sm text-gray-400">
          Nem sikerült betölteni a mentett listákat. Kérjük, próbálja újra később.
        </p>
      </div>
    );
  }

  // Empty state
  if (lists.length === 0) {
    return (
      <div className="backdrop-blur-md bg-gray-800/70 rounded-xl border border-gray-700 p-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Még nincs mentett címlista
        </h3>
        <p className="text-gray-400 text-sm">
          Töltsd fel és mentsd el az első címlistádat a gyorsabb használathoz!
        </p>
      </div>
    );
  }

  // List display
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        Elmentett Címlisták ({lists.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {lists.map((list) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`
                backdrop-blur-md rounded-xl border-2 p-6 shadow-lg transition-all duration-300
                ${selectedListId === list.id
                  ? 'bg-purple-500/20 border-purple-500 ring-2 ring-purple-500/50'
                  : 'bg-gray-800/70 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              {/* List Name */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <span>📝</span>
                    <span>{list.name}</span>
                  </h4>
                  {list.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {list.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Recipient Count */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-sm font-medium text-gray-300">
                    {list.total_recipients} címzett
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-purple-400">A: {list.variant_a_count}</span>
                    <span>•</span>
                    <span className="text-rose-400">B: {list.variant_b_count}</span>
                    <span>•</span>
                    <span className="text-amber-400">C: {list.variant_c_count}</span>
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
                <span>📅</span>
                <span>Létrehozva: {formatDate(list.created_at)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectList(list.id)}
                  disabled={selectedListId === list.id}
                  className={`
                    flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-md
                    ${selectedListId === list.id
                      ? 'bg-purple-600 text-white cursor-default'
                      : 'text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    }
                  `}
                >
                  {selectedListId === list.id ? '✓ Kiválasztva' : 'Kiválaszt'}
                </button>
                <button
                  onClick={() => handleDeleteClick(list)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-md"
                >
                  🗑️
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && listToDelete && (
          <DeleteConfirmationModal
            listName={listToDelete.name}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
