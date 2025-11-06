/**
 * Admin Newsletter Campaign Page
 *
 * Comprehensive newsletter campaign management interface with:
 * - CSV recipient upload
 * - Email template variant selection (A/B/C)
 * - Subject line selection
 * - Campaign creation and sending
 * - Real-time progress tracking
 * - Campaign history and analytics
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CSVUploadComponent } from '@/components/admin/CSVUploadComponent';
import { SavedRecipientListsSelector } from '@/components/admin/SavedRecipientListsSelector';
import { RecipientSourceToggle } from '@/components/admin/RecipientSourceToggle';
import { SaveListOptions } from '@/components/admin/SaveListOptions';
import { fetcher } from '@/lib/admin/swr-config';
import { NewsletterRecipient, NewsletterCampaign } from '@/types';

// Subject line options
const SUBJECT_OPTIONS = [
  {
    id: 1,
    subject: 'Miért érzed magad kimerültnek naponta? 🌀',
    preview: 'A blokkolt csakráid üzennek... Fedezd fel őket {{price}} Ft-ért',
  },
  {
    id: 2,
    subject: '{{name}}, csakráid üzennek neked... ✨',
    preview: '20+ oldal személyre szabott elemzés - Most 87%-kal olcsóbban',
  },
  {
    id: 3,
    subject: '⏰ Csak 48 órád maradt: Csakra Elemzés -87%',
    preview: '7,990 Ft helyett {{price}} Ft. 234 nő már megrendelte ma.',
  },
];

// Campaign stats response type
type CampaignStatsResponse = {
  data: {
    totalCampaigns: number;
    totalEmailsSent: number;
    totalEmailsFailed: number;
    averageSuccessRate: number;
    lastCampaignDate: string | null;
  };
};

// Campaign history response type
type CampaignHistoryResponse = {
  data: {
    campaigns: NewsletterCampaign[];
    total: number;
    hasMore: boolean;
  };
  error: { message: string } | null;
};

// Campaign status response type
type CampaignStatusResponse = {
  data: {
    status: 'sending' | 'completed' | 'failed';
    sent_count: number;
    failed_count: number;
    total_recipients: number;
  };
};

export default function AdminNewsletterPage(): JSX.Element {
  // State management
  const [uploadedRecipients, setUploadedRecipients] = useState<NewsletterRecipient[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number>(2); // Default to "{{name}}, csakráid üzennek neked"
  const [campaignName, setCampaignName] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<{
    sent: number;
    failed: number;
    total: number;
  } | null>(null);
  const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // NEW: Saved recipient lists state
  const [recipientSource, setRecipientSource] = useState<'upload' | 'saved'>('upload');
  const [selectedSavedListId, setSelectedSavedListId] = useState<string | undefined>();
  const [shouldSaveList, setShouldSaveList] = useState<boolean>(true);
  const [listName, setListName] = useState<string>('');
  const [listDescription, setListDescription] = useState<string>('');
  const [isLoadingSavedList, setIsLoadingSavedList] = useState(false);

  // Fetch campaign stats
  const { data: statsResponse } = useSWR<CampaignStatsResponse>(
    '/api/admin/newsletter/campaigns/stats',
    fetcher
  );

  // Fetch campaign history
  const { data: historyResponse, mutate: mutateHistory } = useSWR<CampaignHistoryResponse>(
    '/api/admin/newsletter/campaigns',
    fetcher
  );

  const stats = statsResponse?.data;
  const campaigns = historyResponse?.data?.campaigns || [];

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Calculate if form is valid
  const isFormValid = useMemo(() => {
    return (
      uploadedRecipients.length > 0 &&
      campaignName.trim() !== '' &&
      !isSending
    );
  }, [uploadedRecipients.length, campaignName, isSending]);

  /**
   * Handle CSV data upload
   */
  const handleDataUploaded = (data: NewsletterRecipient[]): void => {
    setUploadedRecipients(data);
    toast.success(`${data.length} címzett sikeresen feltöltve!`);
  };

  /**
   * Handle saved list selection
   */
  const handleSelectSavedList = async (listId: string): Promise<void> => {
    setIsLoadingSavedList(true);
    setSelectedSavedListId(listId);

    try {
      const response = await fetch(`/api/admin/newsletter/recipient-lists/${listId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Lista betöltése sikertelen');
      }

      const { list, recipients } = result.data;

      // Convert recipients to NewsletterRecipient format
      const formattedRecipients: NewsletterRecipient[] = recipients.map((r: any) => ({
        name: r.name,
        email: r.email,
        variant: r.variant,
        resultId: r.result_id,
      }));

      setUploadedRecipients(formattedRecipients);
      toast.success(`✅ "${list.name}" lista betöltve (${formattedRecipients.length} címzett)`);
    } catch (error) {
      console.error('Load saved list error:', error);
      toast.error(error instanceof Error ? error.message : 'Hiba történt a lista betöltése során');
      setSelectedSavedListId(undefined);
    } finally {
      setIsLoadingSavedList(false);
    }
  };

  /**
   * Handle list saved callback
   */
  const handleListSaved = (listId: string): void => {
    toast.success('✅ Címlista sikeresen elmentve későbbi használatra!');
    // Optionally switch to saved lists view
    // setRecipientSource('saved');
    // setSelectedSavedListId(listId);
  };

  /**
   * Handle recipient source change (upload vs saved)
   */
  const handleRecipientSourceChange = (source: 'upload' | 'saved'): void => {
    setRecipientSource(source);
    // Clear uploaded recipients when switching
    setUploadedRecipients([]);
    setSelectedSavedListId(undefined);
  };

  /**
   * Handle test email sending
   */
  const handleSendTestEmail = async (): Promise<void> => {
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      toast.error('Kérjük, adjon meg egy érvényes email címet');
      return;
    }

    setIsSendingTest(true);

    try {
      const response = await fetch('/api/admin/newsletter/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: testEmail,
          testName: 'Teszt Felhasználó',
          variantId: 'b', // Test email always uses variant B for preview
          subject: SUBJECT_OPTIONS.find(s => s.id === selectedSubject)?.subject || 'Test Subject',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Teszt email küldése sikertelen');
      }

      toast.success('Teszt email sikeresen elküldve!');
      setTestEmailModalOpen(false);
      setTestEmail('');
    } catch (error) {
      console.error('Test email error:', error);
      toast.error(error instanceof Error ? error.message : 'Hiba történt a teszt email küldése során');
    } finally {
      setIsSendingTest(false);
    }
  };

  /**
   * Handle campaign start
   */
  const handleStartCampaign = async (): Promise<void> => {
    if (!isFormValid) {
      toast.error('Kérjük, töltse fel a címzetteket és adjon meg egy kampány nevet');
      return;
    }

    setIsSending(true);
    setSendingProgress({
      sent: 0,
      failed: 0,
      total: uploadedRecipients.length,
    });

    try {
      const selectedSubjectOption = SUBJECT_OPTIONS.find(s => s.id === selectedSubject);

      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: campaignName,
          subject: selectedSubjectOption?.subject,
          recipients: uploadedRecipients,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Kampány indítása sikertelen');
      }

      const campaignId = result.data.campaignId;

      // Poll for campaign status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/admin/newsletter/status/${campaignId}`);
          const statusResult: CampaignStatusResponse = await statusResponse.json();

          if (statusResult.data) {
            setSendingProgress({
              sent: statusResult.data.sent_count,
              failed: statusResult.data.failed_count,
              total: statusResult.data.total_recipients,
            });

            // Check if completed
            if (statusResult.data.status === 'completed' || statusResult.data.status === 'failed') {
              clearInterval(pollInterval);

              if (statusResult.data.status === 'completed') {
                const message = `Kampány sikeresen befejezve! ${statusResult.data.sent_count} email elküldve.`;
                toast.success(message, { duration: 5000 });

                // Send browser notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Newsletter Kampány Befejezve ✅', {
                    body: message,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: `campaign-${campaignId}`,
                  });
                }
              } else {
                const message = 'Kampány sikertelen volt. Kérjük, ellenőrizze a hibákat.';
                toast.error(message);

                // Send browser notification for failure
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Newsletter Kampány Sikertelen ❌', {
                    body: message,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: `campaign-${campaignId}`,
                  });
                }
              }

              // Reset form
              setIsSending(false);
              setSendingProgress(null);
              setUploadedRecipients([]);
              setCampaignName('');

              // Refresh campaign history
              mutateHistory();
            }
          }
        } catch (error) {
          console.error('Status poll error:', error);
        }
      }, 2000); // Poll every 2 seconds
    } catch (error) {
      console.error('Campaign start error:', error);
      toast.error(error instanceof Error ? error.message : 'Hiba történt a kampány indítása során');
      setIsSending(false);
      setSendingProgress(null);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Calculate success rate percentage
   */
  const calculateSuccessRate = (sent: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((sent / total) * 100);
  };

  return (
    <AdminLayout title="Hírlevél Kampányok">
      {/* Campaign Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Campaigns */}
        <div className="backdrop-blur-md bg-gray-800/70 rounded-2xl border border-gray-700 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📧</span>
            <span className="text-xs text-gray-400 font-medium">Összes Kampány</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats?.totalCampaigns || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Kampány</p>
        </div>

        {/* Total Emails Sent */}
        <div className="backdrop-blur-md bg-purple-500/10 rounded-2xl border border-purple-500/20 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">✉️</span>
            <span className="text-xs text-purple-300 font-medium">Email Küldve</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats?.totalEmailsSent || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Email</p>
        </div>

        {/* Average Success Rate */}
        <div className="backdrop-blur-md bg-green-500/10 rounded-2xl border border-green-500/20 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📊</span>
            <span className="text-xs text-green-300 font-medium">Átlagos Siker</span>
          </div>
          <p className="text-4xl font-bold text-white">
            {stats?.averageSuccessRate ? `${stats.averageSuccessRate.toFixed(1)}%` : '0%'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Sikeres küldés</p>
        </div>

        {/* Last Campaign Date */}
        <div className="backdrop-blur-md bg-rose-500/10 rounded-2xl border border-rose-500/20 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📅</span>
            <span className="text-xs text-rose-300 font-medium">Utolsó Kampány</span>
          </div>
          <p className="text-lg font-bold text-white">
            {stats?.lastCampaignDate ? formatDate(stats.lastCampaignDate) : 'Még nincs'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Dátum</p>
        </div>
      </div>

      {/* New Campaign Form */}
      <div className="backdrop-blur-md bg-gray-800/70 rounded-2xl border border-gray-700 p-8 shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Új Kampány Létrehozása</h2>

        {/* Recipient Source Toggle */}
        <div className="mb-8">
          <RecipientSourceToggle
            value={recipientSource}
            onChange={handleRecipientSourceChange}
          />
        </div>

        {/* Conditional: CSV Upload OR Saved Lists Selector */}
        <div className="mb-8">
          {recipientSource === 'upload' ? (
            <>
              {/* CSV Upload */}
              <CSVUploadComponent
                onDataUploaded={handleDataUploaded}
                shouldSaveList={shouldSaveList}
                listName={listName}
                listDescription={listDescription}
                onListSaved={handleListSaved}
              />

              {/* Save List Options (below CSV upload) */}
              <div className="mt-6">
                <SaveListOptions
                  listName={listName}
                  onListNameChange={setListName}
                  listDescription={listDescription}
                  onDescriptionChange={setListDescription}
                  shouldSave={shouldSaveList}
                  onShouldSaveChange={setShouldSaveList}
                />
              </div>
            </>
          ) : (
            /* Saved Lists Selector */
            <SavedRecipientListsSelector
              onSelectList={handleSelectSavedList}
              selectedListId={selectedSavedListId}
            />
          )}
        </div>

        {/* Selected Recipients Preview */}
        {uploadedRecipients.length > 0 && (
          <div className="mb-8 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 text-green-400">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold">Kiválasztott címzettek: {uploadedRecipients.length} db</p>
                <p className="text-sm text-green-300/80">
                  A variáns: {uploadedRecipients.filter(r => r.variant === 'a').length} |
                  B variáns: {uploadedRecipients.filter(r => r.variant === 'b').length} |
                  C variáns: {uploadedRecipients.filter(r => r.variant === 'c').length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State for Saved List */}
        {isLoadingSavedList && (
          <div className="mb-8 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-3 text-purple-400">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-400 border-t-transparent"></div>
              <p className="font-semibold">Lista betöltése...</p>
            </div>
          </div>
        )}

        {/* Campaign Name Input */}
        <div className="mb-8">
          <label htmlFor="campaign-name" className="block text-sm font-medium text-gray-300 mb-2">
            Kampány Név
          </label>
          <input
            id="campaign-name"
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="pl. Januári Promóció 2025"
            className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
            disabled={isSending}
          />
        </div>

        {/* Subject Line Selector */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Tárgy Sor</h3>
          <div className="space-y-3">
            {SUBJECT_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`
                  flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                  ${selectedSubject === option.id
                    ? 'bg-purple-500/20 border-purple-500'
                    : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                  }
                  ${isSending ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  type="radio"
                  name="subject"
                  value={option.id}
                  checked={selectedSubject === option.id}
                  onChange={() => setSelectedSubject(option.id)}
                  disabled={isSending}
                  className="mt-1 mr-3 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="text-white font-medium mb-1">{option.subject}</div>
                  <div className="text-sm text-gray-400">{option.preview}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {sendingProgress && (
          <div className="mb-8 backdrop-blur-md bg-purple-500/10 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold">Küldés folyamatban...</span>
              <span className="text-purple-300 font-bold">
                {sendingProgress.sent + sendingProgress.failed} / {sendingProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-rose-600 h-3 transition-all duration-500 ease-out"
                style={{
                  width: `${((sendingProgress.sent + sendingProgress.failed) / sendingProgress.total) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-green-400">Sikeres: {sendingProgress.sent}</span>
              <span className="text-red-400">Sikertelen: {sendingProgress.failed}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setTestEmailModalOpen(true)}
            disabled={!uploadedRecipients.length || isSending}
            className={`
              flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 shadow-md
              ${uploadedRecipients.length && !isSending
                ? 'text-white bg-gray-700 border border-gray-600 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                : 'text-gray-500 bg-gray-800 border border-gray-700 cursor-not-allowed opacity-50'
              }
            `}
          >
            📤 Teszt Email Küldés
          </button>
          <button
            onClick={handleStartCampaign}
            disabled={!isFormValid}
            className={`
              flex-1 px-6 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 shadow-md
              ${isFormValid
                ? 'bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
              }
            `}
          >
            {isSending ? (
              <span className="flex items-center justify-center">
                <span className="animate-pulse">🔄</span>
                <span className="ml-2">Küldés folyamatban...</span>
              </span>
            ) : (
              <span>🚀 Kampány Indítása ({uploadedRecipients.length} címzett)</span>
            )}
          </button>
        </div>
      </div>

      {/* Campaign History Table */}
      <div className="backdrop-blur-md bg-gray-800/70 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Kampány Történet</h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-400 text-lg">Még nincs kampány</p>
            <p className="text-gray-500 text-sm mt-2">
              Hozz létre egy új kampányt az első email kiküldéséhez!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Név
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Dátum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Címzettek
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Sikeres
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Siker Arány
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Állapot
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const successRate = calculateSuccessRate(
                    campaign.sent_count,
                    campaign.total_recipients
                  );

                  return (
                    <tr
                      key={campaign.id}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        {campaign.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {formatDate(campaign.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {campaign.total_recipients}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-400">
                        {campaign.sent_count}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-2 w-20 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                successRate >= 90
                                  ? 'bg-green-500'
                                  : successRate >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${successRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-300">{successRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${campaign.status === 'completed'
                              ? 'bg-green-500/20 text-green-300'
                              : campaign.status === 'sending'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : campaign.status === 'failed'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-gray-500/20 text-gray-300'
                            }
                          `}
                        >
                          {campaign.status === 'completed'
                            ? '✓ Befejezve'
                            : campaign.status === 'sending'
                            ? '⏳ Küldés...'
                            : campaign.status === 'failed'
                            ? '✗ Sikertelen'
                            : 'Piszkozat'
                          }
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Test Email Modal */}
      {testEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="backdrop-blur-md bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Teszt Email Küldés</h3>
              <button
                onClick={() => setTestEmailModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Add meg az email címet, ahova a teszt emailt szeretnéd küldeni.
            </p>

            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="teszt@example.com"
              className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 mb-6"
              disabled={isSendingTest}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setTestEmailModalOpen(false)}
                disabled={isSendingTest}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                Mégsem
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className={`
                  flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 shadow-md
                  ${isSendingTest
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  }
                `}
              >
                {isSendingTest ? 'Küldés...' : 'Email Küldés'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
