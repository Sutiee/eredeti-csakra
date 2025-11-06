/**
 * CSV Upload Component
 *
 * Newsletter recipient upload with drag-and-drop, validation, and preview
 * Features: CSV parsing, email validation, variant distribution, error handling
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import * as Papa from 'papaparse';
import { toast } from 'sonner';

export type NewsletterRecipient = {
  name: string;
  email: string;
  variant: 'a' | 'b' | 'c';
  resultId?: string;
};

type CSVRow = {
  name?: string;
  email: string;
  variant: string;
  result_id?: string;
  'last name'?: string; // MailerLite format support
};

type ValidationError = {
  row: number;
  field: string;
  message: string;
};

type ParsedData = {
  valid: NewsletterRecipient[];
  invalid: Array<NewsletterRecipient & { error: string }>;
  errors: ValidationError[];
};

type CSVUploadComponentProps = {
  onDataUploaded: (data: NewsletterRecipient[]) => void;
  maxRows?: number;
  shouldSaveList?: boolean;
  listName?: string;
  listDescription?: string;
  onListSaved?: (listId: string) => void;
};

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a single CSV row
 */
function validateRow(row: CSVRow, index: number): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const rowNumber = index + 2; // +2 because index is 0-based and we skip header

  // Name field check (support both "name" and MailerLite "Name" + "Last name" format)
  const hasName = row.name && row.name.trim() !== '';
  const hasMailerLiteName = row['last name'] && row['last name'].trim() !== '';

  if (!hasName && !hasMailerLiteName) {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'A név mező kötelező (name VAGY Name + Last name)',
    });
  }

  if (!row.email || row.email.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'email',
      message: 'Az email mező kötelező',
    });
  } else if (!EMAIL_REGEX.test(row.email.trim())) {
    errors.push({
      row: rowNumber,
      field: 'email',
      message: 'Érvénytelen email formátum',
    });
  }

  // Variant is OPTIONAL - if not provided, will be auto-assigned in balanced distribution
  if (row.variant && row.variant.trim() !== '' && !['a', 'b', 'c'].includes(row.variant.toLowerCase().trim())) {
    errors.push({
      row: rowNumber,
      field: 'variant',
      message: "A variáns értéke csak 'a', 'b' vagy 'c' lehet",
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Parse and validate CSV data
 * Auto-assigns A/B/C variants in balanced distribution if not provided
 */
function parseCSVData(csvData: CSVRow[]): ParsedData {
  const valid: NewsletterRecipient[] = [];
  const invalid: Array<NewsletterRecipient & { error: string }> = [];
  const allErrors: ValidationError[] = [];

  // First pass: validate and collect valid rows
  const tempValid: Array<{ name: string; email: string; variant?: string; resultId?: string }> = [];

  csvData.forEach((row, index) => {
    const { valid: isValid, errors } = validateRow(row, index);

    if (isValid) {
      // Handle name field (support both "name" and MailerLite "Name" + "Last name" format)
      let fullName = row.name?.trim() || '';

      // If no "name" field, try to combine "name" (first) and "last name" (MailerLite format)
      if (!fullName && row['last name']) {
        const firstName = row.name?.trim() || '';
        const lastName = row['last name']?.trim() || '';
        fullName = `${firstName} ${lastName}`.trim();
      }

      tempValid.push({
        name: fullName || 'Névtelen', // Fallback to "Névtelen" if no name available
        email: row.email.trim().toLowerCase(),
        variant: row.variant?.toLowerCase().trim(),
        resultId: row.result_id?.trim() || undefined,
      });
    } else {
      allErrors.push(...errors);
      invalid.push({
        name: row.name || '',
        email: row.email || '',
        variant: (row.variant || '') as 'a' | 'b' | 'c',
        resultId: row.result_id || undefined,
        error: errors.map(e => e.message).join(', '),
      });
    }
  });

  // Second pass: Auto-assign variants if missing (balanced A/B/C distribution)
  const hasVariants = tempValid.some(row => row.variant);

  if (!hasVariants) {
    // No variants provided - auto-assign in balanced distribution
    const variants: Array<'a' | 'b' | 'c'> = ['a', 'b', 'c'];
    tempValid.forEach((row, index) => {
      const variantIndex = index % 3; // Cycle through a, b, c
      valid.push({
        name: row.name,
        email: row.email,
        variant: variants[variantIndex],
        resultId: row.resultId,
      });
    });
  } else {
    // Variants provided - use them as-is
    tempValid.forEach(row => {
      valid.push({
        name: row.name,
        email: row.email,
        variant: (row.variant || 'b') as 'a' | 'b' | 'c', // Default to 'b' if somehow missing
        resultId: row.resultId,
      });
    });
  }

  return { valid, invalid, errors: allErrors };
}

/**
 * Generate CSV template file
 */
function downloadTemplate(): void {
  const csvContent = 'name,email,variant,result_id\nPélda Anna,anna@example.com,a,\nPélda Katalin,katalin@example.com,b,uuid-optional\nPélda Éva,eva@example.com,c,';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'newsletter_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success('Sablon CSV letöltve!');
}

/**
 * Main CSV Upload Component
 */
export function CSVUploadComponent({
  onDataUploaded,
  maxRows = 1000,
  shouldSaveList = false,
  listName = '',
  listDescription = '',
  onListSaved,
}: CSVUploadComponentProps): JSX.Element {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSavingList, setIsSavingList] = useState(false);

  /**
   * Calculate variant distribution
   */
  const variantStats = useMemo(() => {
    if (!parsedData) return null;

    const stats = {
      a: 0,
      b: 0,
      c: 0,
      total: parsedData.valid.length,
    };

    parsedData.valid.forEach(recipient => {
      stats[recipient.variant]++;
    });

    return stats;
  }, [parsedData]);

  /**
   * Handle file drop or selection
   */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('Érvénytelen fájl formátum. Csak CSV fájlokat fogadok el.');
      return;
    }

    const file = acceptedFiles[0];

    // File size check (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A fájl túl nagy! Maximális méret: 5MB');
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);

    // Parse CSV
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.toLowerCase().trim(),
      complete: (results) => {
        try {
          // Check for required columns
          const headers = results.meta.fields || [];
          const requiredHeaders = ['email']; // Only email is required now
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

          if (missingHeaders.length > 0) {
            toast.error(`Hiányzó oszlopok: ${missingHeaders.join(', ')}`);
            setIsProcessing(false);
            return;
          }

          // Check if we have a name field (can be "name" OR "Name" + "Last name" for MailerLite format)
          const hasName = headers.includes('name');
          const hasMailerLiteNames = headers.includes('name') || (headers.some(h => h.includes('name')) && headers.some(h => h.includes('last')));

          if (!hasName && !hasMailerLiteNames) {
            toast.error('Hiányzik a név mező! Szükséges: "name" oszlop VAGY "Name" + "Last name" oszlopok (MailerLite formátum).');
            setIsProcessing(false);
            return;
          }

          // Check row limit
          if (results.data.length > maxRows) {
            toast.error(`Túl sok sor! Maximális sorok száma: ${maxRows}`);
            setIsProcessing(false);
            return;
          }

          // Parse and validate data
          const parsed = parseCSVData(results.data);

          if (parsed.errors.length > 0) {
            toast.error(`${parsed.errors.length} érvényesítési hiba található. Kérjük, javítsa ki őket.`);
          } else {
            toast.success(`${parsed.valid.length} címzett sikeresen betöltve!`);
          }

          setParsedData(parsed);
          setIsProcessing(false);
        } catch (error) {
          console.error('CSV parsing error:', error);
          toast.error('Hiba történt a CSV feldolgozása során');
          setIsProcessing(false);
        }
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        toast.error('Hiba történt a CSV olvasása során');
        setIsProcessing(false);
      },
    });
  }, [maxRows]);

  /**
   * Setup dropzone
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: isProcessing,
  });

  /**
   * Clear uploaded data
   */
  const handleClear = (): void => {
    setParsedData(null);
    setFileName(null);
    toast.info('Adatok törölve');
  };

  /**
   * Upload validated data
   */
  const handleUpload = async (): Promise<void> => {
    if (!parsedData || parsedData.valid.length === 0) {
      toast.error('Nincsenek érvényes adatok a feltöltéshez');
      return;
    }

    if (parsedData.errors.length > 0) {
      toast.error('Kérjük, javítsa ki az érvényesítési hibákat a feltöltés előtt');
      return;
    }

    // If shouldSaveList is true, save the list first
    if (shouldSaveList) {
      if (!listName.trim()) {
        toast.error('Kérjük, adjon meg egy lista nevet');
        return;
      }

      setIsSavingList(true);

      try {
        const response = await fetch('/api/admin/newsletter/recipient-lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: listName.trim(),
            description: listDescription.trim() || undefined,
            recipients: parsedData.valid,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          // Check for duplicate warning
          if (result.error?.code === 'DUPLICATE_LIST') {
            toast.error(`⚠️ ${result.error.message}`, {
              duration: 5000,
              description: 'Válassz másik nevet vagy használd a meglévő listát.',
            });
            setIsSavingList(false);
            return;
          }

          throw new Error(result.error?.message || 'Lista mentése sikertelen');
        }

        const savedListId = result.data.list_id;

        toast.success('✅ Címlista sikeresen elmentve!');

        // Call onListSaved callback if provided
        if (onListSaved) {
          onListSaved(savedListId);
        }
      } catch (error) {
        console.error('Save list error:', error);
        toast.error(error instanceof Error ? error.message : 'Hiba történt a lista mentése során');
        setIsSavingList(false);
        return;
      } finally {
        setIsSavingList(false);
      }
    }

    // Upload data
    onDataUploaded(parsedData.valid);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="backdrop-blur-md bg-gray-800/70 rounded-2xl border border-gray-700 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">CSV Feltöltés</h2>
          <button
            onClick={downloadTemplate}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-rose-600 rounded-md hover:from-purple-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-md"
          >
            📥 Sablon letöltése
          </button>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
            ${isDragActive
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />

          <div className="space-y-3">
            <div className="text-5xl" aria-hidden="true">
              📤
            </div>

            {isProcessing ? (
              <div className="space-y-2">
                <p className="text-white font-medium">Feldolgozás...</p>
                <div className="animate-pulse h-2 bg-purple-500 rounded-full w-32 mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-white font-medium">
                  {isDragActive
                    ? 'Húzza ide a CSV fájlt...'
                    : 'Húzzon ide egy CSV fájlt, vagy kattintson a tallózáshoz'
                  }
                </p>
                <p className="text-sm text-gray-400">
                  Maximum {maxRows.toLocaleString('hu-HU')} sor • Max 5MB
                </p>
              </>
            )}
          </div>
        </div>

        {fileName && (
          <div className="mt-4 flex items-center justify-between backdrop-blur-md bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📄</span>
              <span className="text-sm text-white font-medium">{fileName}</span>
            </div>
            <button
              onClick={handleClear}
              className="text-sm text-red-400 hover:text-red-300 transition-colors duration-200"
            >
              Törlés
            </button>
          </div>
        )}
      </div>

      {/* Statistics & Preview */}
      {parsedData && (
        <>
          {/* Summary Statistics */}
          <div className="backdrop-blur-md bg-gray-800/70 rounded-2xl border border-gray-700 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Összesítés</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Recipients */}
              <div className="backdrop-blur-md bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">✅</span>
                  <span className="text-xs text-green-300 font-medium">Érvényes</span>
                </div>
                <p className="text-3xl font-bold text-white">{parsedData.valid.length}</p>
                <p className="text-xs text-gray-400 mt-1">Címzett</p>
              </div>

              {/* Variant A */}
              <div className="backdrop-blur-md bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🅰</span>
                  <span className="text-xs text-purple-300 font-medium">Variáns A</span>
                </div>
                <p className="text-3xl font-bold text-white">{variantStats?.a || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Címzett</p>
              </div>

              {/* Variant B */}
              <div className="backdrop-blur-md bg-rose-500/10 rounded-xl p-4 border border-rose-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🅱</span>
                  <span className="text-xs text-rose-300 font-medium">Variáns B</span>
                </div>
                <p className="text-3xl font-bold text-white">{variantStats?.b || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Címzett</p>
              </div>

              {/* Variant C */}
              <div className="backdrop-blur-md bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🅲</span>
                  <span className="text-xs text-amber-300 font-medium">Variáns C</span>
                </div>
                <p className="text-3xl font-bold text-white">{variantStats?.c || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Címzett</p>
              </div>
            </div>

            {/* Invalid rows warning */}
            {parsedData.invalid.length > 0 && (
              <div className="mt-4 backdrop-blur-md bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-red-300 font-medium">
                    {parsedData.invalid.length} érvénytelen sor található
                  </p>
                </div>
                <p className="text-sm text-gray-400">
                  A feltöltés előtt javítsa ki az alábbi hibákat.
                </p>
              </div>
            )}
          </div>

          {/* Preview Table */}
          <div className="backdrop-blur-md bg-gray-800/70 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Előnézet {parsedData.valid.length > 10 ? '(első 10 sor)' : ''}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Név
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Variáns
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Result ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Állapot
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Valid rows */}
                  {parsedData.valid.slice(0, 10).map((recipient, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-sm text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-white">{recipient.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{recipient.email}</td>
                      <td className="px-4 py-3">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${recipient.variant === 'a' ? 'bg-purple-500/20 text-purple-300' : ''}
                          ${recipient.variant === 'b' ? 'bg-rose-500/20 text-rose-300' : ''}
                          ${recipient.variant === 'c' ? 'bg-amber-500/20 text-amber-300' : ''}
                        `}>
                          {recipient.variant.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {recipient.resultId || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 text-xl">✓</span>
                      </td>
                    </tr>
                  ))}

                  {/* Invalid rows */}
                  {parsedData.invalid.slice(0, 10 - parsedData.valid.slice(0, 10).length).map((recipient, index) => (
                    <tr
                      key={`invalid-${index}`}
                      className="border-b border-gray-700 bg-red-500/5 hover:bg-red-500/10 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {parsedData.valid.length + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{recipient.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{recipient.email || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{recipient.variant || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {recipient.resultId || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 text-xl">✗</span>
                          <span className="text-xs text-red-300">{recipient.error}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClear}
              disabled={isSavingList}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mégsem
            </button>
            <button
              onClick={handleUpload}
              disabled={parsedData.errors.length > 0 || parsedData.valid.length === 0 || isSavingList}
              className={`
                px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-md
                ${parsedData.errors.length > 0 || parsedData.valid.length === 0 || isSavingList
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700'
                }
              `}
            >
              {isSavingList ? (
                <span className="flex items-center gap-2">
                  <span className="animate-pulse">💾</span>
                  <span>Mentés...</span>
                </span>
              ) : shouldSaveList ? (
                `💾 Lista Mentése és ${parsedData.valid.length} Címzett Feltöltése`
              ) : (
                `${parsedData.valid.length} Címzett Feltöltése`
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
