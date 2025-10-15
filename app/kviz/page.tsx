'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { QuizAnswers, UserInfo } from '@/types';
import QuizContainer from '@/components/quiz/QuizContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';

export default function QuizPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuizComplete = async (answers: QuizAnswers, userInfo: UserInfo) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Prepare request body
      const requestBody = {
        name: userInfo.full_name, // API expects 'name', but UserInfo has 'full_name'
        email: userInfo.email,
        age: userInfo.age || undefined, // Convert null to undefined for optional field
        answers,
      };

      console.log('Submitting quiz:', requestBody);

      // Submit quiz to API
      const response = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Hiba történt a kvíz beküldése során');
      }

      const data = await response.json();

      // Redirect to result page
      if (data.data?.id) {
        // Small delay to show success state
        setTimeout(() => {
          router.push(`/eredmeny/${data.data.id}`);
        }, 500);
      } else {
        throw new Error('Nincs eredmény azonosító');
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba történt');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative">
      {/* Error Toast */}
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <LoadingSpinner size="lg" message="Csakráid elemzése folyamatban..." />
            <p className="text-center text-gray-500 text-sm mt-4">
              Kérlek várj, amíg kiszámítjuk az eredményeidet
            </p>
          </div>
        </div>
      )}

      <QuizContainer onComplete={handleQuizComplete} />
    </main>
  );
}
