'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { QuizAnswers, UserInfo } from '@/types';
import QuizContainer from '@/components/quiz/QuizContainer';

export default function QuizPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleQuizComplete = async (answers: QuizAnswers, userInfo: UserInfo) => {
    setError(null);

    try {
      // Submit quiz to API
      const response = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userInfo,
          answers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Hiba történt a kvíz beküldése során');
      }

      const data = await response.json();

      // Redirect to result page
      if (data.data?.id) {
        router.push(`/eredmeny/${data.data.id}`);
      } else {
        throw new Error('Nincs eredmény azonosító');
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt');
    }
  };

  return (
    <main className="min-h-screen">
      {error && (
        <div className="fixed top-4 right-4 max-w-md bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg z-50">
          <p className="font-semibold">Hiba történt:</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Bezárás
          </button>
        </div>
      )}

      <QuizContainer onComplete={handleQuizComplete} />
    </main>
  );
}
