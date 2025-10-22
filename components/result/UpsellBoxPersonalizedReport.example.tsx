/**
 * UpsellBoxPersonalizedReport - Usage Examples
 *
 * This file demonstrates how to use the UpsellBoxPersonalizedReport component
 * in your result page with proper analytics tracking.
 */

'use client';

import UpsellBoxPersonalizedReport from './UpsellBoxPersonalizedReport';

/**
 * Example 1: Basic Usage (No Analytics)
 *
 * The simplest way to use the component - just pass the result ID.
 */
export function BasicExample({ resultId, email }: { resultId: string; email: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <UpsellBoxPersonalizedReport resultId={resultId} email={email} />
    </div>
  );
}

/**
 * Example 2: With Analytics Tracking
 *
 * Add custom analytics callback to track when users click the CTA.
 * Useful for Google Analytics, Facebook Pixel, or custom tracking.
 */
export function WithAnalyticsExample({ resultId, email }: { resultId: string; email: string }) {
  const handleUpsellClick = () => {
    // Google Analytics 4 Event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'upsell_cta_click', {
        event_category: 'conversion',
        event_label: 'personalized_report_upsell',
        value: 990,
        result_id: resultId,
      });
    }

    // Facebook Pixel Event
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: 'Személyre Szabott Elemzés',
        content_category: 'Digital Product',
        value: 990,
        currency: 'HUF',
      });
    }

    // Custom Analytics
    console.log('[Analytics] Upsell CTA clicked:', {
      resultId,
      product: 'personalized_report',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <UpsellBoxPersonalizedReport
        resultId={resultId}
        email={email}
        onCtaClick={handleUpsellClick}
      />
    </div>
  );
}

/**
 * Example 3: Full Result Page Integration
 *
 * Shows how to integrate the upsell box into a result page
 * with proper positioning and flow.
 */
export function FullResultPageExample({
  resultId,
  email,
  chakraCards
}: {
  resultId: string;
  email: string;
  chakraCards: React.ReactNode;
}) {
  const handleUpsellClick = () => {
    // Track conversion opportunity
    if (typeof window !== 'undefined') {
      console.log('[Conversion] User interested in personalized report');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-white">
      <div className="container mx-auto px-4 py-12">

        {/* Chakra Silhouette & Summary */}
        <section className="mb-12">
          {/* ... Chakra visualization ... */}
        </section>

        {/* First 2 Chakra Cards */}
        <section className="mb-8">
          {/* Display first 2 chakra cards */}
        </section>

        {/* Upsell Box - Strategic Placement After Initial Content */}
        <section className="mb-12">
          <UpsellBoxPersonalizedReport
            resultId={resultId}
            email={email}
            onCtaClick={handleUpsellClick}
          />
        </section>

        {/* Remaining Chakra Cards */}
        <section>
          {chakraCards}
        </section>

        {/* Footer / Additional CTAs */}
        <section className="mt-16">
          {/* ... */}
        </section>
      </div>
    </main>
  );
}

/**
 * Example 4: With Custom Tracking Service
 *
 * Integration with a custom analytics service or tracking library.
 */
export function WithCustomTrackingExample({
  resultId,
  email
}: {
  resultId: string;
  email: string;
}) {
  const trackUpsellInteraction = () => {
    // Custom tracking service
    const trackingData = {
      event: 'upsell_box_cta_clicked',
      properties: {
        result_id: resultId,
        product_id: 'ai_analysis_pdf',
        product_name: 'Személyre Szabott Elemzés',
        price: 990,
        currency: 'HUF',
        discount_percentage: 87,
        original_price: 7990,
        timestamp: Date.now(),
        page_url: window.location.href,
      },
    };

    // Send to your analytics backend
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackingData),
    }).catch(console.error);
  };

  return (
    <UpsellBoxPersonalizedReport
      resultId={resultId}
      email={email}
      onCtaClick={trackUpsellInteraction}
    />
  );
}

/**
 * TypeScript type augmentation for window object
 * Add this to your global types file (e.g., types/global.d.ts)
 */
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
    fbq?: (
      command: string,
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
  }
}

export {};
