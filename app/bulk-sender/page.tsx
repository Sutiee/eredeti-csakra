'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CSVUploader } from '@/components/bulk-sender/CSVUploader';
import { EmailEditor } from '@/components/bulk-sender/EmailEditor';
import { toast } from 'sonner';
import { Send, Mail, Play, Pause, RotateCcw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { BulkSenderRecipient, BulkSenderTemplate, BulkSenderApiResponse } from '@/types';

type Recipient = BulkSenderRecipient;

type EmailJob = {
  id: string;
  subject: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  skipped_count: number;
  status: 'pending' | 'processing' | 'paused' | 'completed' | 'failed';
  current_batch: number;
  total_batches: number;
  delay_between_batches_ms: number;
  created_at: string;
};

export default function BulkSenderPage(): JSX.Element {
  // State for recipients and email content
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // State for templates
  const [templates, setTemplates] = useState<BulkSenderTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);

  // State for job-based sending
  const [activeJob, setActiveJob] = useState<EmailJob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const processingRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch templates
  const fetchTemplates = useCallback(async (): Promise<void> => {
    setLoadingTemplates(true);
    try {
      const response = await fetch('/api/bulk-sender/templates');
      const data: BulkSenderApiResponse<{ templates: BulkSenderTemplate[]; total: number }> = await response.json();
      if (data.success && data.data) {
        setTemplates(data.data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  // Fetch active job on mount
  const fetchActiveJob = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/bulk-sender/jobs');
      const data: BulkSenderApiResponse<{ jobs: EmailJob[]; activeJob: EmailJob | null }> = await response.json();
      if (data.success && data.data?.activeJob) {
        setActiveJob(data.data.activeJob);
        // If job is processing, resume it
        if (data.data.activeJob.status === 'processing') {
          processingRef.current = true;
          setIsProcessing(true);
          processNextBatch(data.data.activeJob.id);
        }
      }
    } catch (error) {
      console.error('Error fetching active job:', error);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchActiveJob();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fetchTemplates, fetchActiveJob]);

  // Process next batch with countdown
  const processNextBatch = async (jobId: string): Promise<void> => {
    if (!processingRef.current) return;

    try {
      const response = await fetch(`/api/bulk-sender/jobs/${jobId}/process`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Hiba történt a küldés során');
        setIsProcessing(false);
        processingRef.current = false;
        return;
      }

      // Update job state
      const jobResponse = await fetch(`/api/bulk-sender/jobs/${jobId}`);
      const jobData = await jobResponse.json();
      if (jobData.success && jobData.data?.job) {
        setActiveJob(jobData.data.job);
      }

      if (data.data.jobCompleted) {
        toast.success('Minden email sikeresen elküldve!');
        setIsProcessing(false);
        processingRef.current = false;
        setActiveJob(null);
        return;
      }

      // Wait for next batch with countdown
      if (data.data.nextBatchIn && processingRef.current) {
        const delaySeconds = Math.ceil(data.data.nextBatchIn / 1000);
        setCountdown(delaySeconds);

        // Countdown timer
        let remaining = delaySeconds;
        const countdownInterval = setInterval(() => {
          remaining--;
          setCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);

        timeoutRef.current = setTimeout(() => {
          clearInterval(countdownInterval);
          if (processingRef.current) {
            processNextBatch(jobId);
          }
        }, data.data.nextBatchIn);
      }
    } catch (error) {
      console.error('Error processing batch:', error);
      toast.error('Hiba történt a batch feldolgozása során');
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const handleTemplateSelect = (templateId: string): void => {
    if (!templateId) {
      setSelectedTemplateId('');
      return;
    }
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setSubject(template.subject);
      setHtmlContent(template.html_content);
      toast.success(`Sablon betöltve: ${template.name}`);
    }
  };

  // Start new job
  const handleStartJob = async (): Promise<void> => {
    if (recipients.length === 0) {
      toast.error('Kérlek tölts fel címzetteket!');
      return;
    }
    if (!subject.trim()) {
      toast.error('Kérlek add meg az email tárgyát!');
      return;
    }
    if (!htmlContent.trim()) {
      toast.error('Kérlek add meg az email tartalmát!');
      return;
    }

    try {
      // Create job
      const response = await fetch('/api/bulk-sender/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          subject,
          htmlContent,
          batchSize: 100,
          delayBetweenBatchesMs: 10000, // 10 seconds
        }),
      });

      const data = await response.json();
      if (!data.success) {
        toast.error(data.error || 'Hiba történt a job létrehozásakor');
        return;
      }

      toast.success(`Job létrehozva! ${data.data.totalRecipients} email, ~${data.data.estimatedTimeMinutes} perc`);

      // Start the job
      const startResponse = await fetch(`/api/bulk-sender/jobs/${data.data.jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      const startData = await startResponse.json();
      if (startData.success) {
        setActiveJob(startData.data.job);
        processingRef.current = true;
        setIsProcessing(true);
        processNextBatch(data.data.jobId);
      }
    } catch (error) {
      console.error('Error starting job:', error);
      toast.error('Hiba történt a küldés indításakor');
    }
  };

  // Pause job
  const handlePauseJob = async (): Promise<void> => {
    if (!activeJob) return;

    processingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      const response = await fetch(`/api/bulk-sender/jobs/${activeJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' }),
      });

      const data = await response.json();
      if (data.success) {
        setActiveJob(data.data.job);
        setIsProcessing(false);
        setCountdown(0);
        toast.info('Küldés szüneteltetve');
      }
    } catch (error) {
      console.error('Error pausing job:', error);
    }
  };

  // Resume job
  const handleResumeJob = async (): Promise<void> => {
    if (!activeJob) return;

    try {
      const response = await fetch(`/api/bulk-sender/jobs/${activeJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume' }),
      });

      const data = await response.json();
      if (data.success) {
        setActiveJob(data.data.job);
        processingRef.current = true;
        setIsProcessing(true);
        processNextBatch(activeJob.id);
        toast.success('Küldés folytatva');
      }
    } catch (error) {
      console.error('Error resuming job:', error);
    }
  };

  const canStartNewJob = !activeJob && recipients.length > 0 && subject.trim() && htmlContent.trim();
  const progressPercent = activeJob
    ? Math.round(((activeJob.sent_count + activeJob.failed_count) / activeJob.total_recipients) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Active Job Progress */}
      {activeJob && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {activeJob.status === 'processing' && <Clock className="w-5 h-5 text-blue-500 animate-pulse" />}
              {activeJob.status === 'paused' && <Pause className="w-5 h-5 text-yellow-500" />}
              {activeJob.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {activeJob.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
              Aktív küldés: {activeJob.subject}
            </h2>
            <div className="flex gap-2">
              {activeJob.status === 'processing' && (
                <button
                  onClick={handlePauseJob}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Szünet
                </button>
              )}
              {activeJob.status === 'paused' && (
                <button
                  onClick={handleResumeJob}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Folytatás
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Haladás: {progressPercent}%</span>
              <span>Batch: {activeJob.current_batch}/{activeJob.total_batches}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeJob.total_recipients}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Összes</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeJob.sent_count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Elküldve</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{activeJob.failed_count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sikertelen</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{activeJob.skipped_count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Kihagyva</p>
            </div>
          </div>

          {/* Countdown */}
          {isProcessing && countdown > 0 && (
            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Következő batch: {countdown} másodperc</span>
            </div>
          )}
        </div>
      )}

      {/* Warning if job exists */}
      {activeJob && activeJob.status !== 'completed' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">Aktív küldés folyamatban</p>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Várd meg amíg befejeződik, vagy szüneteltesd az új küldés indítása előtt.
            </p>
          </div>
        </div>
      )}

      {/* Template Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Válassz sablont (opcionális)
        </label>
        <select
          value={selectedTemplateId}
          onChange={(e) => handleTemplateSelect(e.target.value)}
          disabled={loadingTemplates || isProcessing}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
        >
          <option value="">-- Nincs sablon --</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - CSV Uploader */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            1. Címzettek feltöltése
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Tölts fel egy CSV fájlt az email címekkel és nevekkel
          </p>
          <CSVUploader onUpload={setRecipients} disabled={isProcessing} />
        </div>

        {/* Right Column - Email Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            2. Email szerkesztése
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tárgy
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Adj meg egy tárgyat az emailhez..."
              disabled={isProcessing}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tartalom
            </label>
            <EmailEditor initialContent={htmlContent} onChange={setHtmlContent} />
          </div>
        </div>
      </div>

      {/* Send Button */}
      <div className="flex justify-center">
        <button
          onClick={handleStartJob}
          disabled={!canStartNewJob}
          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 shadow-lg
            ${
              canStartNewJob
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Send className="w-6 h-6" />
          Küldés indítása ({recipients.length} címzett)
        </button>
      </div>

      {/* Info about timing */}
      {recipients.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Becsült küldési idő: ~{Math.ceil((Math.ceil(recipients.length / 100) * 10) / 60)} perc
          ({Math.ceil(recipients.length / 100)} batch × 10 másodperc)
        </div>
      )}
    </div>
  );
}
