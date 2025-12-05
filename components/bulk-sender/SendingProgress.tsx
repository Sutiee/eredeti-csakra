'use client';

import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SendingProgressProps {
    total: number;
    sent: number;
    failed: number;
    status: 'idle' | 'sending' | 'completed' | 'paused' | 'error';
    onStop?: () => void;
}

export function SendingProgress({ total, sent, failed, status, onStop }: SendingProgressProps) {
    const progress = total > 0 ? ((sent + failed) / total) * 100 : 0;
    const remaining = total - (sent + failed);

    // Estimate: 50 emails per batch
    // Delay: 8 seconds + ~2 seconds network/processing = ~10 seconds per 50 emails
    // Speed: 5 emails / second (average)
    // Remaining seconds = (remaining / 50) * 10 = remaining / 5
    const estimatedSeconds = Math.ceil(remaining / 5);
    const estimatedTime = estimatedSeconds > 60
        ? `${Math.ceil(estimatedSeconds / 60)} perc`
        : `${estimatedSeconds} másodperc`;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {status === 'sending' && <Loader2 className="w-6 h-6 animate-spin text-purple-600" />}
                        {status === 'completed' && <CheckCircle className="w-6 h-6 text-green-600" />}
                        {status === 'error' && <XCircle className="w-6 h-6 text-red-600" />}
                        {status === 'paused' && <AlertTriangle className="w-6 h-6 text-yellow-600" />}

                        {status === 'sending' && 'Küldés folyamatban...'}
                        {status === 'completed' && 'Küldés befejezve'}
                        {status === 'error' && 'Hiba történt'}
                        {status === 'paused' && 'Szüneteltetve'}
                        {status === 'idle' && 'Küldésre kész'}
                    </h3>
                    {status === 'sending' && (
                        <p className="text-sm text-gray-500 mt-1 ml-9">
                            Becsült hátralévő idő: <span className="font-medium text-purple-600">{estimatedTime}</span>
                        </p>
                    )}
                </div>

                {status === 'sending' && onStop && (
                    <button
                        onClick={onStop}
                        className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                    >
                        Leállítás
                    </button>
                )}
            </div>

            <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                            Haladás
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-purple-600">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>
                <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-purple-100 dark:bg-gray-700">
                    <motion.div
                        style={{ width: `${progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600 transition-all duration-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                    <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-1">Elküldve</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{sent}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                    <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">Sikertelen</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{failed}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Hátravan</p>
                    <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{remaining}</p>
                </div>
            </div>

            {status === 'sending' && (
                <div className="mt-6 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-blue-100">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Kérlek, ne zárd be ezt az ablakot a küldés végéig! A rendszer kötegekben küldi a leveleket.
                </div>
            )}
        </div>
    );
}
