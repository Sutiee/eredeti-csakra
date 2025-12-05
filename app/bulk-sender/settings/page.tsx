'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, Send, Settings, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { BulkSenderApiResponse } from '@/types';

export default function SettingsPage(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [maskedApiKey, setMaskedApiKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    resend_api_key: '',
    from_email: '',
    from_name: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/bulk-sender/settings');
      const result: BulkSenderApiResponse<{
        resend_api_key: string | null;
        from_email: string | null;
        from_name: string | null;
      }> = await response.json();

      if (result.success && result.data) {
        // Store the masked API key separately
        if (result.data.resend_api_key) {
          setMaskedApiKey(result.data.resend_api_key);
          // Don't populate the input field with masked key
          setFormData({
            resend_api_key: '',
            from_email: result.data.from_email || '',
            from_name: result.data.from_name || '',
          });
        } else {
          setFormData({
            resend_api_key: '',
            from_email: result.data.from_email || '',
            from_name: result.data.from_name || '',
          });
        }
      } else {
        toast.error(result.error || 'Nem sikerült betölteni a beállításokat');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Hiba történt a beállítások betöltése közben');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    // Validation
    if (!formData.resend_api_key.trim() && !maskedApiKey) {
      toast.error('A Resend API kulcs kötelező!');
      return;
    }
    if (!formData.from_email.trim()) {
      toast.error('A feladó email kötelező!');
      return;
    }
    if (!formData.from_name.trim()) {
      toast.error('A feladó név kötelező!');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.from_email)) {
      toast.error('Érvénytelen email formátum!');
      return;
    }

    // API key validation
    const apiKeyToSave = formData.resend_api_key.trim() || maskedApiKey;
    if (apiKeyToSave && !apiKeyToSave.startsWith('re_')) {
      toast.error('A Resend API kulcsnak "re_" kezdetűnek kell lennie!');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/bulk-sender/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resend_api_key: apiKeyToSave,
          from_email: formData.from_email.trim(),
          from_name: formData.from_name.trim(),
        }),
      });

      const result: BulkSenderApiResponse<{ id: string }> = await response.json();

      if (result.success) {
        toast.success(result.message || 'Beállítások sikeresen mentve!');
        // Reload to get the new masked key
        await loadSettings();
      } else {
        toast.error(result.error || 'Nem sikerült menteni a beállításokat');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Hiba történt a beállítások mentése közben');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (): Promise<void> => {
    // Validation
    if (!testEmail.trim()) {
      toast.error('Adj meg egy teszt email címet!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast.error('Érvénytelen email formátum!');
      return;
    }

    try {
      setTesting(true);
      const response = await fetch('/api/bulk-sender/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_email: testEmail }),
      });

      const result: BulkSenderApiResponse<{ emailId: string }> = await response.json();

      if (result.success) {
        toast.success(result.message || 'Teszt email sikeresen elküldve!');
      } else {
        toast.error(result.error || 'Nem sikerült elküldeni a teszt emailt');
      }
    } catch (error) {
      console.error('Error testing settings:', error);
      toast.error('Hiba történt a teszt email küldése közben');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
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
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Beállítások
        </h1>
        <p className="text-gray-500 mt-1">Email küldési konfiguráció</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Resend Konfiguráció
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resend API kulcs
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.resend_api_key}
                onChange={(e) => setFormData({ ...formData, resend_api_key: e.target.value })}
                className="w-full px-4 py-2 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
                placeholder={maskedApiKey || 're_xxxxxxxxxxxxxxxxxxxx'}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {maskedApiKey && !formData.resend_api_key && (
              <p className="mt-1 text-xs text-gray-500">
                Jelenlegi kulcs: {maskedApiKey} (hagyj üresen, ha nem változtatsz rajta)
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              API kulcsot a Resend Dashboard-on szerezhetsz be
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Feladó email
            </label>
            <input
              type="email"
              value={formData.from_email}
              onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              placeholder="info@eredeticsakra.hu"
            />
            <p className="mt-1 text-xs text-gray-500">
              Ezt az email címet látják majd a címzettek feladóként
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Feladó név
            </label>
            <input
              type="text"
              value={formData.from_name}
              onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              placeholder="Eredeti Csakra"
            />
            <p className="mt-1 text-xs text-gray-500">
              Ezt a nevet látják majd a címzettek feladóként
            </p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Fontos:</strong> A feladó email domain-t előzetesen verifikálni kell a
            Resend-ben. Teszteléshez használhatod az <code>onboarding@resend.dev</code> címet.
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Mentés...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Beállítások mentése
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Email */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Beállítások tesztelése
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Küldj egy teszt emailt, hogy ellenőrizd a konfigurációt.
        </p>

        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTest()}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            placeholder="teszt@email.hu"
          />
          <button
            onClick={handleTest}
            disabled={testing || !testEmail}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Küldés...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Teszt küldés
              </>
            )}
          </button>
        </div>

        <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800 dark:text-green-200">
            Ha a teszt email sikeresen megérkezett, a beállítások helyesek és használhatók.
          </div>
        </div>
      </div>
    </div>
  );
}
