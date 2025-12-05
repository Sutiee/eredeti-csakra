'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  UserX,
  Plus,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  AlertCircle,
} from 'lucide-react';
import type { BulkSenderUnsubscribe, BulkSenderApiResponse } from '@/types';

export default function UnsubscribesPage(): JSX.Element {
  const [unsubscribes, setUnsubscribes] = useState<BulkSenderUnsubscribe[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addReason, setAddReason] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUnsubscribes();
  }, [page, searchQuery]);

  const loadUnsubscribes = async (): Promise<void> => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/bulk-sender/unsubscribes?${params}`);
      const result: BulkSenderApiResponse<{
        unsubscribes: BulkSenderUnsubscribe[];
        total: number;
        totalPages: number;
      }> = await response.json();

      if (result.success && result.data) {
        setUnsubscribes(result.data.unsubscribes);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
      } else {
        toast.error(result.error || 'Nem sikerült betölteni a leiratkozásokat');
      }
    } catch (error) {
      console.error('Error loading unsubscribes:', error);
      toast.error('Hiba történt a leiratkozások betöltése közben');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (): Promise<void> => {
    if (!addEmail.trim()) {
      toast.error('Az email cím kötelező!');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addEmail.trim())) {
      toast.error('Érvénytelen email formátum!');
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch('/api/bulk-sender/unsubscribes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addEmail.trim(),
          reason: addReason.trim() || null,
        }),
      });

      const result: BulkSenderApiResponse<{
        added: number;
        skipped: number;
        duplicates: string[];
      }> = await response.json();

      if (result.success) {
        if (result.data && result.data.skipped > 0) {
          toast.info('Ez az email cím már szerepel a listában');
        } else {
          toast.success('Email cím sikeresen hozzáadva!');
        }
        setAddEmail('');
        setAddReason('');
        loadUnsubscribes();
      } else {
        toast.error(result.error || 'Nem sikerült hozzáadni az email címet');
      }
    } catch (error) {
      console.error('Error adding unsubscribe:', error);
      toast.error('Hiba történt az email hozzáadása közben');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (unsubscribe: BulkSenderUnsubscribe): Promise<void> => {
    if (!confirm(`Biztosan törölni szeretnéd ezt az email címet: ${unsubscribe.email}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/bulk-sender/unsubscribes?id=${unsubscribe.id}`, {
        method: 'DELETE',
      });

      const result: BulkSenderApiResponse<{ deleted: boolean }> = await response.json();

      if (result.success) {
        toast.success('Email cím sikeresen törölve!');
        loadUnsubscribes();
      } else {
        toast.error(result.error || 'Nem sikerült törölni az email címet');
      }
    } catch (error) {
      console.error('Error deleting unsubscribe:', error);
      toast.error('Hiba történt az email törlése közben');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

      // Extract emails (skip header if present)
      const emails = lines
        .filter((line) => !line.toLowerCase().startsWith('email'))
        .map((line) => line.split(',')[0].trim())
        .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

      if (emails.length === 0) {
        toast.error('Nem található érvényes email cím a fájlban');
        return;
      }

      if (!confirm(`${emails.length} email címet importálsz. Folytatod?`)) {
        return;
      }

      const response = await fetch('/api/bulk-sender/unsubscribes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails,
          reason: 'CSV importálás',
        }),
      });

      const result: BulkSenderApiResponse<{
        added: number;
        skipped: number;
        duplicates: string[];
      }> = await response.json();

      if (result.success && result.data) {
        toast.success(
          `${result.data.added} email hozzáadva, ${result.data.skipped} kihagyva (már létezett)`
        );
        loadUnsubscribes();
      } else {
        toast.error(result.error || 'Nem sikerült importálni az email címeket');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Hiba történt a fájl feldolgozása közben');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSearchChange = (value: string): void => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };

  const handlePreviousPage = (): void => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = (): void => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Betöltés...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leiratkozások</h1>
        <p className="text-gray-500 mt-1">Összesen: {total} leiratkozott email</p>
      </div>

      {/* Add Single Email */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email hozzáadása
        </h2>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            disabled={isAdding}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            placeholder="email@pelda.hu"
          />
          <input
            type="text"
            value={addReason}
            onChange={(e) => setAddReason(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            disabled={isAdding}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            placeholder="Indoklás (opcionális)"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              Hozzáadás
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              title="CSV importálás"
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            CSV fájl formátum: minden sorban egy email cím. Az első sor (fejléc) automatikusan
            kihagyásra kerül.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            placeholder="Keresés email vagy indoklás alapján..."
          />
        </div>
      </div>

      {/* List */}
      {unsubscribes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'Nincs találat' : 'Még nincsenek leiratkozások'}
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? 'Próbálj más keresési kifejezést használni.'
              : 'Az itt megadott email címekre nem mennek ki az emailek.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email cím
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Indoklás
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dátum
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Művelet
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {unsubscribes.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.reason || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.created_at).toLocaleString('hu-HU', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDelete(item)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Törlés"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {page} / {totalPages} oldal
                <span className="ml-2 text-gray-500">
                  ({(page - 1) * limit + 1}-{Math.min(page * limit, total)} / {total})
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Előző
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Következő
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
