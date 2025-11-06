/**
 * CSV Upload Component - Usage Example
 *
 * This example demonstrates how to use the CSVUploadComponent in a newsletter admin page
 */

'use client';

import { useState } from 'react';
import { CSVUploadComponent, NewsletterRecipient } from './CSVUploadComponent';
import { toast } from 'sonner';

export function NewsletterUploadExample(): JSX.Element {
  const [recipients, setRecipients] = useState<NewsletterRecipient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle successful CSV upload
   */
  const handleDataUploaded = (data: NewsletterRecipient[]): void => {
    setRecipients(data);
    toast.success(`${data.length} címzett betöltve, készen áll a küldésre!`);
  };

  /**
   * Send newsletter to all recipients
   */
  const handleSendNewsletter = async (): Promise<void> => {
    if (recipients.length === 0) {
      toast.error('Nincs címzett a kiküldéshez');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients,
          subject: 'Hírlevél tárgy',
          // Add other newsletter data here
        }),
      });

      if (!response.ok) {
        throw new Error('Hiba történt a kiküldés során');
      }

      const result = await response.json();
      toast.success(`Hírlevél sikeresen elküldve ${result.sent} címzettnek!`);

      // Reset state after successful send
      setRecipients([]);
    } catch (error) {
      console.error('Newsletter send error:', error);
      toast.error('Hiba történt a hírlevél kiküldése során');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Hírlevél Kiküldés
        </h1>
        <p className="text-gray-400">
          Töltsd fel a címzettek listáját CSV formátumban és küld el a hírleveleidet.
        </p>
      </div>

      {/* CSV Upload Component */}
      <CSVUploadComponent
        onDataUploaded={handleDataUploaded}
        maxRows={1000}
      />

      {/* Send Button (shown only when recipients are loaded) */}
      {recipients.length > 0 && (
        <div className="mt-8 backdrop-blur-md bg-gray-800/70 rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Készen állsz a kiküldésre?
              </h3>
              <p className="text-sm text-gray-400">
                {recipients.length} címzett várja a hírleveleket
              </p>
            </div>

            <button
              onClick={handleSendNewsletter}
              disabled={isSubmitting}
              className={`
                px-6 py-3 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-lg
                ${isSubmitting
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-rose-600 text-white hover:from-purple-700 hover:to-rose-700'
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Küldés folyamatban...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  📨 Hírlevél Kiküldése
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
