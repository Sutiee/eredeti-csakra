"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface StickyCtaProps {
  blockedChakrasCount: number;
  resultId: string;
  email: string;
  onCtaClick?: (copyVariant: string) => void;
}

/**
 * StickyCTA Component
 *
 * Sticky bottom CTA bar that appears after 30% scroll depth.
 * Features:
 * - Dynamic copy based on blocked chakra count
 * - Dismissible with localStorage persistence (24h)
 * - Slide-up animation with Framer Motion
 * - Pre-header with benefit ("✨ + meditációk ma")
 * - Analytics tracking on click
 * - Direct Stripe checkout (bypasses cart/checkout page)
 *
 * v2.1 Feature: Conversion Booster (+27% lift expected)
 */
export default function StickyCTA({
  blockedChakrasCount,
  resultId,
  email,
  onCtaClick,
}: StickyCtaProps) {
  const router = useRouter();
  const [showSticky, setShowSticky] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Dynamic CTA copy based on blocked chakra count
  const getCtaCopy = (): string => {
    if (blockedChakrasCount >= 3) {
      return "Egyensúlyt kérek";
    } else if (blockedChakrasCount >= 1) {
      return "Tervet kérek";
    } else {
      return "Harmónia őrzése";
    }
  };

  const ctaCopy = getCtaCopy();

  // Check localStorage for dismissed state on mount
  useEffect(() => {
    const dismissedUntil = localStorage.getItem("dismissed_sticky_cta_v21");
    if (dismissedUntil) {
      const dismissTime = parseInt(dismissedUntil, 10);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (now - dismissTime < twentyFourHours) {
        setIsDismissed(true);
        return;
      } else {
        // Expired, remove from localStorage
        localStorage.removeItem("dismissed_sticky_cta_v21");
      }
    }
  }, []);

  // Scroll listener for 30% trigger
  useEffect(() => {
    if (isDismissed) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const threshold = windowHeight * 0.3; // 30% of viewport

      setShowSticky(scrolled > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  // Handle dismiss
  const handleDismiss = () => {
    setIsDismissed(true);
    setShowSticky(false);
    localStorage.setItem("dismissed_sticky_cta_v21", Date.now().toString());
  };

  // Handle CTA click - DIRECT STRIPE CHECKOUT
  const handleCtaClick = async () => {
    // Analytics tracking
    if (onCtaClick) {
      onCtaClick(ctaCopy);
    }

    // DIRECT STRIPE CHECKOUT - Bypass checkout/cart page
    // Create Stripe Checkout Session and redirect immediately
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId: resultId,
          email: email,
          items: [
            {
              productId: 'ai_analysis_pdf',
              quantity: 1,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.url;
      } else {
        console.error('[StickyCTA] Failed to create checkout session:', data);
        // Fallback to checkout page if API fails
        router.push(`/checkout/${resultId}?product=ai_analysis_pdf`);
      }
    } catch (error) {
      console.error('[StickyCTA] Error creating checkout session:', error);
      // Fallback to checkout page if request fails
      router.push(`/checkout/${resultId}?product=ai_analysis_pdf`);
    }
  };

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {showSticky && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="bg-white/95 backdrop-blur-md shadow-2xl border-t-2 border-spiritual-purple-200">
            <div className="container mx-auto px-4 py-4">
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left: Pre-header + CTA */}
                <div className="flex-1 text-center sm:text-left">
                  {/* Pre-header */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <span className="text-xl" aria-hidden="true">
                      ✨
                    </span>
                    <span className="text-sm text-gray-600 font-medium">
                      + meditációk ma
                    </span>
                  </div>

                  {/* CTA Text */}
                  <p className="text-base text-gray-700">
                    Készen állsz a változásra?
                  </p>
                </div>

                {/* Center/Right: CTA Button */}
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={handleCtaClick}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-spiritual-purple-600 to-spiritual-rose-600 text-white font-bold text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{
                      boxShadow:
                        "0 4px 20px rgba(139, 92, 246, 0.3), 0 2px 8px rgba(236, 72, 153, 0.2)",
                    }}
                  >
                    <span>{ctaCopy}</span>
                    <motion.span
                      className="text-xl"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      aria-hidden="true"
                    >
                      →
                    </motion.span>
                  </motion.button>

                  {/* Dismiss Button */}
                  <button
                    onClick={handleDismiss}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                    aria-label="Bezárás"
                  >
                    <span className="text-lg" aria-hidden="true">
                      ×
                    </span>
                  </button>
                </div>
              </div>

              {/* Trust micro-signal */}
              <div className="text-center mt-2">
                <p className="text-xs text-gray-500">
                  ✓ 14 napos pénzvisszafizetési garancia
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
