/**
 * Download Links Component
 * Eredeti Csakra - Product Download Section
 *
 * v2.2: Added PDF generation polling and loading state
 */

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type Purchase = {
  id: string;
  product_id: string;
  product_name: string;
  pdf_url: string | null;
};

type DownloadLinksProps = {
  purchases: Purchase[];
  resultId: string;
};

/**
 * Download Links Component
 */
export default function DownloadLinks({ purchases: initialPurchases, resultId }: DownloadLinksProps) {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [pollingActive, setPollingActive] = useState(false);

  /**
   * Check if meditation access was purchased
   */
  const hasMeditationAccess = purchases.some(
    (p) =>
      p.product_id === 'prod_chakra_meditations' ||
      p.product_id === 'prod_full_harmony_bundle'
  );

  /**
   * Check if any PDF is still generating (pdf_url is null)
   */
  const hasGeneratingPDFs = purchases.some(
    (p) => (p.product_id === 'ai_analysis_pdf' || p.product_id === 'workbook_30day') && !p.pdf_url
  );

  /**
   * Poll for PDF readiness every 5 seconds
   */
  useEffect(() => {
    if (!hasGeneratingPDFs) {
      setPollingActive(false);
      return;
    }

    setPollingActive(true);
    console.log('[DOWNLOAD_LINKS] Starting PDF polling with exponential backoff...');

    let pollCount = 0;
    let currentInterval = 5000; // Start with 5 seconds
    let timeoutHandle: NodeJS.Timeout | null = null;
    let stopPolling = false;

    const pollForPDFs = async () => {
      if (stopPolling) return;

      try {
        const response = await fetch(`/api/purchases/${resultId}`);
        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          const updatedPurchases = data.data as Purchase[];

          // ALWAYS update purchases to show new products immediately
          setPurchases(updatedPurchases);

          // Check if all PDFs are now ready
          const allPDFsReady = updatedPurchases
            .filter((p) => p.product_id === 'ai_analysis_pdf' || p.product_id === 'workbook_30day')
            .every((p) => p.pdf_url !== null);

          if (allPDFsReady) {
            console.log('[DOWNLOAD_LINKS] All PDFs ready!');
            setPollingActive(false);
            stopPolling = true;
            return;
          } else {
            console.log('[DOWNLOAD_LINKS] Still generating, PDFs found:',
              updatedPurchases.filter(p => p.product_id === 'ai_analysis_pdf' || p.product_id === 'workbook_30day').length
            );
          }
        }
      } catch (error) {
        console.error('[DOWNLOAD_LINKS] Polling error:', error);
      }

      // Exponential backoff:
      // 0-60s: 5s interval (12 polls)
      // 60-180s: 10s interval (12 polls)
      // 180-300s: 15s interval (8 polls)
      pollCount++;
      if (pollCount <= 12) {
        currentInterval = 5000; // First minute: 5s
      } else if (pollCount <= 24) {
        currentInterval = 10000; // 1-3 minutes: 10s
      } else {
        currentInterval = 15000; // 3-5 minutes: 15s
      }

      console.log(`[DOWNLOAD_LINKS] Next poll in ${currentInterval / 1000}s (poll #${pollCount})`);
      timeoutHandle = setTimeout(pollForPDFs, currentInterval);
    };

    // Start first poll immediately
    pollForPDFs();

    // Stop polling after 7 minutes (timeout)
    // Extended to provide buffer for 232-second workbook generation time
    // (previously 5 minutes, which was too close to generation time)
    const timeoutId = setTimeout(() => {
      console.log('[DOWNLOAD_LINKS] Polling timeout (7 minutes)');
      stopPolling = true;
      setPollingActive(false);
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }, 420000); // 7 minutes (gives 4-minute buffer for 232s generation)

    return () => {
      stopPolling = true;
      if (timeoutHandle) clearTimeout(timeoutHandle);
      clearTimeout(timeoutId);
    };
  }, [hasGeneratingPDFs, resultId]);

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">
        Letöltések és hozzáférés
      </h2>

      <div className="space-y-4">
        {/* PDF Downloads */}
        {purchases.map((purchase, index) => {
          // Skip meditation access in this section
          if (purchase.product_id === 'prod_chakra_meditations') {
            return null;
          }

          const isGenerating = (purchase.product_id === 'ai_analysis_pdf' || purchase.product_id === 'workbook_30day') && !purchase.pdf_url;

          return (
            <motion.div
              key={purchase.id}
              className="p-4 bg-gradient-to-r from-purple-50 to-rose-50 rounded-lg border border-purple-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {purchase.product_name}
                    </h3>
                    <p className="text-sm text-gray-500">PDF formátum</p>
                  </div>
                </div>

                {isGenerating ? (
                  // LOADING STATE: PDF is being generated
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-purple-600">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm font-medium">Generálás folyamatban...</span>
                    </div>
                    <p className="text-xs text-gray-500 text-right max-w-xs">
                      {purchase.product_id === 'workbook_30day'
                        ? 'Munkafüzeted készítése folyamatban... Ez 3-4 percet vesz igénybe. Az oldal automatikusan frissül, amikor elkészült.'
                        : 'Dolgozunk az elemzéseden, néhány pillanatot várj. Maximum 1-2 percet vesz igénybe.'}
                    </p>
                  </div>
                ) : (
                  // READY STATE: PDF is ready for download
                  <motion.a
                    href={purchase.pdf_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Letöltés
                  </motion.a>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Meditation Access */}
        {hasMeditationAccess && (
          <motion.div
            className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Meditációs Csomag
                  </h3>
                  <p className="text-sm text-gray-500">
                    7 vezetett meditáció - 1 év hozzáférés
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => {
                  // In real implementation, navigate to meditation portal
                  alert('Meditációs portál (még nincs implementálva)');
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Hallgatás
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Help Section */}
      <motion.div
        className="mt-6 p-4 bg-gray-50 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm text-gray-600">
          <strong>Segítségre van szükséged?</strong> Írj nekünk a{' '}
          <a
            href="mailto:hello@eredeticsakra.hu"
            className="text-purple-600 hover:underline"
          >
            hello@eredeticsakra.hu
          </a>{' '}
          címre, és 24 órán belül válaszolunk!
        </p>
      </motion.div>
    </motion.div>
  );
}
