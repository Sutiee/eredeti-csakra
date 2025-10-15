/**
 * User Detail Modal Component
 *
 * Displays comprehensive user information including quiz details,
 * chakra scores, purchase history, and action buttons
 */

'use client';

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import useSWR from 'swr';
import { fetcher } from '@/lib/admin/swr-config';
import { CHAKRAS } from '@/lib/quiz/chakras';

interface UserDetailData {
  id: string;
  name: string;
  email: string;
  age: number | null;
  answers: number[];
  chakraScores: Record<string, number>;
  quizStatus: 'completed' | 'abandoned';
  reachedQuestion: number;
  createdAt: string;
  lastActivity: string;
  purchases: Purchase[];
  totalSpent: number;
}

interface Purchase {
  id: string;
  productName: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface UserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Loading skeleton for modal
 */
function ModalSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <div className="h-6 bg-white/30 rounded w-1/3 mb-3 animate-pulse"></div>
          <div className="h-20 bg-white/20 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main User Detail Modal Component
 */
export function UserDetailModal({
  userId,
  isOpen,
  onClose,
}: UserDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch user details
  const { data: user, isLoading, error } = useSWR<UserDetailData>(
    userId ? `/api/admin/users/${userId}` : null,
    fetcher
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Export user data as JSON
  const handleExport = () => {
    if (!user) return;

    const dataStr = JSON.stringify(user, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `felhasznalo_${user.id}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-spiritual-purple-50 via-white to-spiritual-rose-50 rounded-2xl shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right z-10 p-2 bg-white/90 rounded-full hover:bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-spiritual-purple-500 transition-colors duration-200"
          aria-label="Bezárás"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8">
          {/* Error state */}
          {error && (
            <div className="backdrop-blur-md bg-red-500/10 rounded-xl p-6 border border-red-500/20">
              <p className="text-red-800">
                Hiba történt az adatok betöltése közben. Kérjük, próbálja újra.
              </p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && <ModalSkeleton />}

          {/* User details */}
          {user && (
            <div className="space-y-6">
              {/* User Info Section */}
              <section>
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-gray-900 mb-4"
                >
                  {user.name}
                </h2>
                <div className="backdrop-blur-md bg-white/70 rounded-xl p-6 border border-white/50 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Kor</p>
                      <p className="text-base text-gray-900">
                        {user.age || 'Nincs megadva'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Létrehozva
                      </p>
                      <p className="text-base text-gray-900">
                        {format(new Date(user.createdAt), 'yyyy. MMMM dd. HH:mm', {
                          locale: hu,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Utolsó aktivitás
                      </p>
                      <p className="text-base text-gray-900">
                        {format(new Date(user.lastActivity), 'yyyy. MMMM dd. HH:mm', {
                          locale: hu,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quiz Details Section */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Kvíz Részletek
                </h3>
                <div className="backdrop-blur-md bg-white/70 rounded-xl p-6 border border-white/50 space-y-4">
                  {/* Quiz Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Állapot
                    </span>
                    {user.quizStatus === 'completed' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✓ Befejezett
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        ⚠ Félbehagyott
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Előrehaladás
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {user.reachedQuestion}/28 kérdés
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-spiritual-purple-500 to-spiritual-rose-500 transition-all duration-300"
                        style={{
                          width: `${(user.reachedQuestion / 28) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Answers Grid */}
                  {user.answers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Válaszok (1-4 skála)
                      </p>
                      <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
                        {user.answers.map((answer, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center justify-center p-2 bg-white/90 rounded-lg border border-gray-200"
                          >
                            <span className="text-xs text-gray-500">
                              {index + 1}
                            </span>
                            <span className="text-sm font-semibold text-spiritual-purple-700">
                              {answer}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Chakra Scores Section */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Csakra Pontszámok
                </h3>
                <div className="backdrop-blur-md bg-white/70 rounded-xl p-6 border border-white/50 space-y-4">
                  {CHAKRAS.map((chakra) => {
                    const score = user.chakraScores[chakra.name] || 0;
                    const maxScore = 16;
                    const percentage = (score / maxScore) * 100;
                    const isHealthy = score >= 12;
                    const isWarning = score >= 8 && score < 12;
                    const isCritical = score < 8;

                    return (
                      <div key={chakra.name}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: chakra.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">
                              {chakra.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {score}/16
                            </span>
                            <span className="text-lg">
                              {isHealthy && '🟢'}
                              {isWarning && '🟡'}
                              {isCritical && '🔴'}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: chakra.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Purchase History Section */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Vásárlási Előzmények
                </h3>
                <div className="backdrop-blur-md bg-white/70 rounded-xl p-6 border border-white/50">
                  {user.purchases.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">
                      Még nem történt vásárlás.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {user.purchases.map((purchase) => (
                        <div
                          key={purchase.id}
                          className="flex items-center justify-between p-3 bg-white/90 rounded-lg border border-gray-200"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {purchase.productName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(
                                new Date(purchase.createdAt),
                                'yyyy. MM. dd. HH:mm',
                                { locale: hu }
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {purchase.amount.toLocaleString('hu-HU')} Ft
                            </p>
                            <p className="text-sm text-gray-500">
                              {purchase.status}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">
                            Összesen
                          </span>
                          <span className="font-bold text-lg text-spiritual-purple-700">
                            {user.totalSpent.toLocaleString('hu-HU')} Ft
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Action Buttons */}
              <section className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleExport}
                  className="flex-1 px-4 py-2 text-sm font-medium text-spiritual-purple-700 bg-spiritual-purple-100 border border-spiritual-purple-300 rounded-md hover:bg-spiritual-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spiritual-purple-500 transition-colors duration-200"
                >
                  📥 Adatok exportálása (JSON)
                </button>
                <a
                  href={`mailto:${user.email}`}
                  className="flex-1 px-4 py-2 text-sm font-medium text-center text-white bg-gradient-to-r from-spiritual-purple-600 to-spiritual-rose-600 rounded-md hover:from-spiritual-purple-700 hover:to-spiritual-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-spiritual-purple-500 transition-all duration-200"
                >
                  ✉ Email küldése
                </a>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
