'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleUnsubscribe = async () => {
        if (!email) return;

        setStatus('loading');
        try {
            const response = await fetch('/api/newsletter/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    if (!email) {
        return (
            <div className="text-center">
                <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Hibás link</h1>
                <p className="text-gray-600">Nem található email cím a linkben.</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="text-center">
                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Sikeres leiratkozás</h1>
                <p className="text-gray-600 mb-6">
                    A(z) <strong>{email}</strong> címet töröltük a listánkról.
                </p>
                <p className="text-sm text-gray-500">
                    Sajnáljuk, hogy mész! Ha meggondolnád magad, bármikor visszairatkozhatsz a weboldalon.
                </p>
                <a href="/" className="inline-block mt-8 text-purple-600 hover:underline">
                    Vissza a főoldalra
                </a>
            </div>
        );
    }

    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Leiratkozás megerősítése</h1>
            <p className="text-gray-600 mb-8">
                Biztosan le szeretnél iratkozni a hírlevélről ezzel a címmel: <br />
                <strong>{email}</strong>?
            </p>

            {status === 'error' && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                    Hiba történt a leiratkozás során. Kérlek próbáld újra később.
                </div>
            )}

            <button
                onClick={handleUnsubscribe}
                disabled={status === 'loading'}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                Igen, leiratkozom
            </button>

            <div className="mt-8">
                <a href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                    Mégsem, maradok
                </a>
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg">
                <Suspense fallback={<div className="text-center p-4">Betöltés...</div>}>
                    <UnsubscribeContent />
                </Suspense>
            </div>
        </div>
    );
}
