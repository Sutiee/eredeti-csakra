'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface Recipient {
    email: string;
    name?: string;
    [key: string]: any;
}

interface CSVUploaderProps {
    onUpload: (recipients: Recipient[]) => void;
    disabled?: boolean;
}

export function CSVUploader({ onUpload, disabled }: CSVUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);
    const [stats, setStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.csv'],
        },
        maxFiles: 1,
        disabled: disabled || parsing,
    });

    const parseCSV = (file: File) => {
        setParsing(true);
        setStats(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const recipients: Recipient[] = [];
                let validCount = 0;
                let invalidCount = 0;

                results.data.forEach((row: any) => {
                    // Look for email column (case insensitive)
                    const emailKey = Object.keys(row).find((key) => key.toLowerCase().includes('email'));
                    const nameKey = Object.keys(row).find((key) => key.toLowerCase().includes('name') || key.toLowerCase().includes('nev'));

                    if (emailKey && row[emailKey] && validateEmail(row[emailKey])) {
                        recipients.push({
                            email: row[emailKey].trim(),
                            name: nameKey ? row[nameKey]?.trim() : undefined,
                            ...row,
                        });
                        validCount++;
                    } else {
                        invalidCount++;
                    }
                });

                setStats({
                    total: results.data.length,
                    valid: validCount,
                    invalid: invalidCount,
                });

                if (validCount > 0) {
                    onUpload(recipients);
                    toast.success(`${validCount} címzett sikeresen beolvasva`);
                } else {
                    toast.error('Nem található érvényes email cím a fájlban');
                }

                setParsing(false);
            },
            error: (error) => {
                console.error('CSV parse error:', error);
                toast.error('Hiba a CSV feldolgozása közben');
                setParsing(false);
            },
        });
    };

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        setStats(null);
        onUpload([]);
    };

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-purple-500 bg-purple-50/10' : 'border-gray-300 hover:border-purple-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input {...getInputProps()} />

                {file ? (
                    <div className="flex items-center justify-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                            onClick={removeFile}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex justify-center">
                            <Upload className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                            Húzd ide a CSV fájlt, vagy kattints a tallózáshoz
                        </p>
                        <p className="text-sm text-gray-500">
                            A fájlnak tartalmaznia kell egy "email" oszlopot
                        </p>
                    </div>
                )}
            </div>

            {stats && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Érvényes</p>
                            <p className="text-lg font-bold text-green-700 dark:text-green-400">{stats.valid}</p>
                        </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Hibás</p>
                            <p className="text-lg font-bold text-red-700 dark:text-red-400">{stats.invalid}</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Összesen</p>
                            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{stats.total}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
