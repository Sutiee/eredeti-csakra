'use client';

import { useState, useEffect } from 'react';
import { CSVUploader } from '@/components/bulk-sender/CSVUploader';
import { EmailEditor } from '@/components/bulk-sender/EmailEditor';
import { SendingProgress } from '@/components/bulk-sender/SendingProgress';
import { toast } from 'sonner';
import { Send, Mail } from 'lucide-react';
import type { BulkSenderRecipient, BulkSenderTemplate, BulkSenderApiResponse } from '@/types';

type Recipient = BulkSenderRecipient;

export default function BulkSenderPage(): JSX.Element {
  // State for recipients and email content
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // State for templates
  const [templates, setTemplates] = useState<BulkSenderTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);

  // State for sending progress
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendProgress, setSendProgress] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    status: 'idle' as 'idle' | 'sending' | 'completed' | 'paused' | 'error',
  });

  // Fetch templates function
  const fetchTemplates = async (): Promise<void> => {
    setLoadingTemplates(true);
    try {
      const response = await fetch('/api/bulk-sender/templates');
      const data: BulkSenderApiResponse<{ templates: BulkSenderTemplate[]; total: number }> = await response.json();

      if (data.success && data.data) {
        setTemplates(data.data.templates || []);
      } else {
        toast.error('Nem sikerült betölteni a sablonokat');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Hiba történt a sablonok betöltésekor');
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

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

  const handleSend = async (): Promise<void> => {
    // Validation
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

    // Initialize progress
    setSendProgress({
      total: recipients.length,
      sent: 0,
      failed: 0,
      status: 'sending',
    });
    setIsSending(true);

    try {
      const response = await fetch('/api/bulk-sender/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients,
          subject,
          htmlContent,
          templateId: selectedTemplateId || null,
        }),
      });

      const data: BulkSenderApiResponse<{
        sent: number;
        failed: number;
        skipped: number;
        errors: Array<{ email: string; error: string }>;
      }> = await response.json();

      if (data.success && data.data) {
        setSendProgress({
          total: recipients.length,
          sent: data.data.sent,
          failed: data.data.failed,
          status: 'completed',
        });

        if (data.data.failed > 0) {
          toast.warning(`Küldés befejezve: ${data.data.sent} sikeres, ${data.data.failed} sikertelen`);
        } else {
          toast.success(`Minden email sikeresen elküldve! (${data.data.sent} db)`);
        }
      } else {
        setSendProgress((prev) => ({
          ...prev,
          status: 'error',
        }));
        toast.error(data.error || 'Hiba történt a küldés során');
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      setSendProgress((prev) => ({
        ...prev,
        status: 'error',
      }));
      toast.error('Hiba történt a küldés során');
    } finally {
      setIsSending(false);
    }
  };

  const handleStopSending = (): void => {
    setSendProgress((prev) => ({
      ...prev,
      status: 'paused',
    }));
    setIsSending(false);
    toast.info('Küldés leállítva');
  };

  const canSend = recipients.length > 0 && subject.trim() && htmlContent.trim() && !isSending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full">
              <Mail className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Tömeges Email Küldő
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Töltsd fel a címzetteket, készítsd el az emailt és küldd el egyetlen kattintással
          </p>
        </div>

        {/* Template Selector */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Válassz sablont (opcionális)
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            disabled={loadingTemplates || isSending}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
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
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - CSV Uploader */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Címzettek feltöltése
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Tölts fel egy CSV fájlt az email címekkel és nevekkel
            </p>
            <CSVUploader onUpload={setRecipients} disabled={isSending} />
          </div>

          {/* Right Column - Email Editor */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Email szerkesztése
            </h2>

            {/* Subject Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Tárgy
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Adj meg egy tárgyat az emailhez..."
                disabled={isSending}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Tartalom
              </label>
              <EmailEditor
                initialContent={htmlContent}
                onChange={setHtmlContent}
              />
            </div>
          </div>
        </div>

        {/* Send Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 shadow-lg
              ${
                canSend
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Send className="w-6 h-6" />
            {isSending ? 'Küldés folyamatban...' : `Emailek küldése (${recipients.length} db)`}
          </button>
        </div>

        {/* Sending Progress */}
        {(isSending || sendProgress.status !== 'idle') && (
          <SendingProgress
            total={sendProgress.total}
            sent={sendProgress.sent}
            failed={sendProgress.failed}
            status={sendProgress.status}
            onStop={handleStopSending}
          />
        )}
      </div>
    </div>
  );
}
