/**
 * Campaign Progress Modal Component
 *
 * Real-time progress tracking modal for newsletter campaign sending
 * with confetti celebration on completion
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/admin/swr-config';

export interface CampaignProgressModalProps {
  isOpen: boolean;
  campaignId: string;
  totalRecipients: number;
  onComplete: () => void;
}

interface CampaignProgress {
  id: string;
  status: 'sending' | 'completed' | 'failed';
  total_recipients: number;
  sent_count: number;
  failed_count: number;
}

/**
 * Fire confetti animation
 */
async function fireConfetti(): Promise<void> {
  // Dynamic import to avoid build errors if package not installed yet
  try {
    // @ts-ignore - canvas-confetti may not be installed yet
    const confettiModule = await import('canvas-confetti');
    const confetti = confettiModule.default;

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number): number => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  } catch (error) {
    // Silently fail if confetti package not available
    console.warn('canvas-confetti not installed');
  }
}

/**
 * Main Campaign Progress Modal Component
 */
export function CampaignProgressModal({
  isOpen,
  campaignId,
  totalRecipients,
  onComplete,
}: CampaignProgressModalProps): JSX.Element | null {
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Poll campaign progress every 2 seconds
  const { data: progress, error } = useSWR<CampaignProgress>(
    isOpen && campaignId
      ? `/api/admin/newsletter/campaigns/${campaignId}/progress`
      : null,
    fetcher,
    {
      refreshInterval: 2000, // Poll every 2 seconds
      revalidateOnFocus: false,
    }
  );

  // Calculate progress percentage
  const progressPercent =
    progress && progress.total_recipients > 0
      ? Math.round(
          ((progress.sent_count + progress.failed_count) /
            progress.total_recipients) *
            100
        )
      : 0;

  // Calculate success rate
  const successRate =
    progress && progress.sent_count + progress.failed_count > 0
      ? Math.round(
          (progress.sent_count / (progress.sent_count + progress.failed_count)) *
            100
        )
      : 100;

  const pendingCount =
    (progress?.total_recipients || 0) -
      (progress?.sent_count || 0) -
      (progress?.failed_count || 0);

  // Handle completion
  useEffect(() => {
    if (
      progress?.status === 'completed' &&
      !hasCompletedOnce &&
      progressPercent === 100
    ) {
      setHasCompletedOnce(true);
      fireConfetti();

      // Auto-close after 5 seconds
      setTimeout(() => {
        onComplete();
        setHasCompletedOnce(false);
      }, 5000);
    }
  }, [progress?.status, hasCompletedOnce, progressPercent, onComplete]);

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

  if (!isOpen) return null;

  const isCompleted = progress?.status === 'completed';
  const isFailed = progress?.status === 'failed';
  const canClose = isCompleted || isFailed;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4" aria-hidden="true">
            {isCompleted ? '🎉' : isFailed ? '❌' : '📧'}
          </div>
          <h2
            id="progress-modal-title"
            className="text-2xl font-bold text-white mb-2"
          >
            {isCompleted
              ? 'Kampány sikeresen elküldve!'
              : isFailed
              ? 'Kampány küldése sikertelen'
              : 'Email kampány küldése folyamatban...'}
          </h2>
          <p className="text-gray-400">
            {isCompleted
              ? 'Minden email sikeresen kiküldésre került.'
              : isFailed
              ? 'Hiba történt a kampány küldése során.'
              : 'Kérjük, ne zárd be ezt az ablakot!'}
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 backdrop-blur-md bg-red-500/20 rounded-xl p-4 border border-red-500/50">
            <p className="text-red-300 text-sm">
              Hiba történt a státusz lekérdezése közben. Kérjük, frissítsd az oldalt.
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Előrehaladás</span>
            <span className="text-2xl font-bold text-white">{progressPercent}%</span>
          </div>
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : isFailed
                  ? 'bg-gradient-to-r from-red-500 to-rose-500'
                  : 'bg-gradient-to-r from-purple-500 to-rose-500'
              }`}
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Sent count */}
          <div className="backdrop-blur-md bg-green-500/10 rounded-xl p-4 border border-green-500/30">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400 mb-1">
                {progress?.sent_count || 0}
              </p>
              <p className="text-xs text-green-300">✓ Elküldve</p>
            </div>
          </div>

          {/* Failed count */}
          <div className="backdrop-blur-md bg-red-500/10 rounded-xl p-4 border border-red-500/30">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400 mb-1">
                {progress?.failed_count || 0}
              </p>
              <p className="text-xs text-red-300">✗ Sikertelen</p>
            </div>
          </div>

          {/* Pending count */}
          <div className="backdrop-blur-md bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400 mb-1">
                {pendingCount}
              </p>
              <p className="text-xs text-blue-300">⏳ Várakozik</p>
            </div>
          </div>
        </div>

        {/* Success rate */}
        <div className="backdrop-blur-md bg-gray-800/70 rounded-xl p-4 border border-gray-700 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">
              Sikerességi arány
            </span>
            <span
              className={`text-xl font-bold ${
                successRate >= 95
                  ? 'text-green-400'
                  : successRate >= 80
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
            >
              {successRate}%
            </span>
          </div>
        </div>

        {/* Total recipients info */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-400">
            Összes címzett:{' '}
            <span className="font-semibold text-white">
              {progress?.total_recipients || totalRecipients}
            </span>
          </p>
        </div>

        {/* Action buttons */}
        {canClose && (
          <div className="flex justify-center">
            <button
              onClick={onComplete}
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-rose-600 rounded-lg hover:from-purple-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-lg"
              autoFocus
            >
              {isCompleted ? '🎉 Bezárás' : '❌ Bezárás'}
            </button>
          </div>
        )}

        {/* Loading animation */}
        {!canClose && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-gray-400">
              <svg
                className="animate-spin h-5 w-5 text-purple-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm">Küldés folyamatban...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
