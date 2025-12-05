'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, X, FileText } from 'lucide-react';
import { EmailEditor } from '@/components/bulk-sender/EmailEditor';
import type { BulkSenderTemplate, BulkSenderApiResponse } from '@/types';

export default function TemplatesPage(): JSX.Element {
  const [templates, setTemplates] = useState<BulkSenderTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BulkSenderTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: '',
    is_default: false,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/bulk-sender/templates?limit=100');
      const result: BulkSenderApiResponse<{ templates: BulkSenderTemplate[]; total: number }> =
        await response.json();

      if (result.success && result.data) {
        setTemplates(result.data.templates);
        setTotal(result.data.total);
      } else {
        toast.error(result.error || 'Nem sikerült betölteni a sablonokat');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Hiba történt a sablonok betöltése közben');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (): void => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      html_content: '',
      is_default: false,
    });
    setIsEditing(true);
  };

  const handleEdit = (template: BulkSenderTemplate): void => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      is_default: template.is_default,
    });
    setIsEditing(true);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      html_content: '',
      is_default: false,
    });
  };

  const handleSave = async (): Promise<void> => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('A sablon neve kötelező!');
      return;
    }
    if (!formData.subject.trim()) {
      toast.error('A tárgy kötelező!');
      return;
    }
    if (!formData.html_content.trim() || formData.html_content === '<p></p>') {
      toast.error('A tartalom kötelező!');
      return;
    }

    try {
      const method = editingTemplate ? 'PUT' : 'POST';
      const body = editingTemplate
        ? { id: editingTemplate.id, ...formData }
        : formData;

      const response = await fetch('/api/bulk-sender/templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result: BulkSenderApiResponse<BulkSenderTemplate> = await response.json();

      if (result.success) {
        toast.success(result.message || 'Sablon sikeresen mentve!');
        handleCancel();
        loadTemplates();
      } else {
        toast.error(result.error || 'Nem sikerült menteni a sablont');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Hiba történt a sablon mentése közben');
    }
  };

  const handleDelete = async (template: BulkSenderTemplate): Promise<void> => {
    if (!confirm(`Biztosan törölni szeretnéd a "${template.name}" sablont?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/bulk-sender/templates?id=${template.id}`, {
        method: 'DELETE',
      });

      const result: BulkSenderApiResponse = await response.json();

      if (result.success) {
        toast.success(result.message || 'Sablon sikeresen törölve!');
        loadTemplates();
      } else {
        toast.error(result.error || 'Nem sikerült törölni a sablont');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Hiba történt a sablon törlése közben');
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

  if (isEditing) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingTemplate ? 'Sablon szerkesztése' : 'Új sablon létrehozása'}
            </h1>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sablon neve
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Pl. Havi hírlevél sablon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tárgy
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Pl. Havi hírlevél - {{month}}"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tartalom
              </label>
              <EmailEditor
                initialContent={formData.html_content}
                onChange={(html) => setFormData({ ...formData, html_content: html })}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_default" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Alapértelmezett sablon
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-5 h-5" />
                Mentés
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Mégse
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Sablonok</h1>
          <p className="text-gray-500 mt-1">Összesen: {total} sablon</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Új sablon
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Még nincsenek sablonok
          </h3>
          <p className="text-gray-500 mb-6">
            Hozz létre egy új sablont az email kampányokhoz.
          </p>
          <button
            onClick={handleCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Első sablon létrehozása
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    {template.is_default && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        Alapértelmezett
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Tárgy:</strong> {template.subject}
                  </p>
                  <p className="text-sm text-gray-500">
                    Létrehozva: {new Date(template.created_at).toLocaleString('hu-HU')}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Szerkesztés"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(template)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Törlés"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
