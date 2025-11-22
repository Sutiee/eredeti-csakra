'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { QuizAnswers, UserInfo } from '@/types';
import QuizContainer from '@/components/quiz/QuizContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import { useAnalytics } from '@/lib/admin/tracking/client';

// Light result user data type
interface LightResultUserData {
  name: string;
  email: string;
  age?: number;
}

// Inner component that uses useSearchParams
function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightUserData, setLightUserData] = useState<LightResultUserData | null>(null);
  const [lightResultId, setLightResultId] = useState<string | null>(null);
  const [isLoadingLightData, setIsLoadingLightData] = useState(false);
  const { trackEvent } = useAnalytics();

  // Check for from=purchase flow
  const fromPurchase = searchParams.get('from') === 'purchase';
  const lightId = searchParams.get('light_id');

  // Fetch light result user data when coming from purchase flow
  useEffect(() => {
    if (fromPurchase && lightId) {
      setIsLoadingLightData(true);
      setLightResultId(lightId);

      fetch(`/api/light-result/${lightId}`)
        .then(response => response.json())
        .then(data => {
          if (data.data) {
            setLightUserData({
              name: data.data.name,
              email: data.data.email,
              age: data.data.age,
            });
            // Track analytics event for this flow
            trackEvent('full_quiz_from_purchase', { light_result_id: lightId });
          } else {
            console.error('Light result not found:', data.error);
            setError('Nem sikerult betolteni az adataidat. Kerlek probalj ujra.');
          }
        })
        .catch(err => {
          console.error('Error fetching light result:', err);
          setError('Hiba tortent az adatok betoltesekor.');
        })
        .finally(() => {
          setIsLoadingLightData(false);
        });
    }
  }, [fromPurchase, lightId, trackEvent]);

  // Track page view on mount
  useEffect(() => {
    trackEvent('page_view', { page_path: '/kviz', page_name: 'quiz' });
    trackEvent('quiz_start');
  }, [trackEvent]);

  // Track abandonment on unmount (if quiz not completed)
  useEffect(() => {
    return () => {
      if (!isSubmitting) {
        trackEvent('quiz_abandoned');
      }
    };
  }, [trackEvent, isSubmitting]);

  const handleQuizComplete = async (answers: QuizAnswers, userInfo: UserInfo) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Prepare request body
      const requestBody: {
        name: string;
        email: string;
        age?: number;
        answers: QuizAnswers;
        light_result_id?: string;
      } = {
        name: userInfo.full_name, // API expects 'name', but UserInfo has 'full_name'
        email: userInfo.email,
        age: userInfo.age || undefined, // Convert null to undefined for optional field
        answers,
      };

      // Include light_result_id if coming from purchase flow
      if (lightResultId) {
        requestBody.light_result_id = lightResultId;
      }

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

      // Track quiz completion
      trackEvent('quiz_completed', { result_id: data.data?.id });

      // Redirect based on flow type
      if (data.data?.id) {
        // Small delay to show success state
        setTimeout(() => {
          if (lightResultId) {
            // Coming from purchase flow - go to success page for PDF generation and upsells
            router.push(`/success/${data.data.id}`);
          } else {
            // Normal quiz flow - go to result page
            router.push(`/eredmeny/${data.data.id}`);
          }
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

  // Show loading state while fetching light data
  // Also wait if we're expecting light data but haven't loaded it yet
  if (isLoadingLightData || (fromPurchase && lightId && !lightUserData)) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <LoadingSpinner size="lg" message="Adataid betöltése..." />
        </div>
      </main>
    );
  }

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

      <QuizContainer
        onComplete={handleQuizComplete}
        initialUserInfo={lightUserData ? {
          full_name: lightUserData.name,
          email: lightUserData.email,
          age: lightUserData.age,
        } : undefined}
        welcomeMessage={lightUserData ? `Üdv újra, ${lightUserData.name}! Folytasd a részletes elemzést.` : undefined}
        skipUserInfoForm={!!lightUserData}
      />
    </main>
  );
}

// Main export with Suspense boundary for useSearchParams
export default function QuizPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <LoadingSpinner size="lg" message="Betoltes..." />
        </div>
      </main>
    }>
      <QuizPageContent />
    </Suspense>
  );
}
