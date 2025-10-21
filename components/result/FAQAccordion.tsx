"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { faqConversionItems, type FAQItem } from "@/data/faq-conversion";

/**
 * FAQAccordion Component - 2025 Modern Design
 *
 * Displays conversion-focused frequently asked questions with modern glassmorphism design.
 * Part of v2.1 conversion optimization strategy to remove purchase objections.
 *
 * Features:
 * - Modern 2025 glassmorphism card design
 * - WCAG AAA compliant colors (readable text)
 * - One item open at a time (exclusive accordion)
 * - Smooth expand/collapse animations with Framer Motion
 * - Rotating chevron icon
 * - Category badges with improved contrast
 * - Professional, trustworthy appearance
 *
 * @example
 * <FAQAccordion />
 */

/**
 * Category badge color mapping - Modern 2025 with high contrast
 */
const CATEGORY_COLORS: Record<FAQItem['category'], string> = {
  benefits: "bg-spiritual-purple-100 text-spiritual-purple-700 border-spiritual-purple-200",
  urgency: "bg-spiritual-rose-100 text-spiritual-rose-700 border-spiritual-rose-200",
  product: "bg-blue-100 text-blue-700 border-blue-200",
  trust: "bg-spiritual-gold-100 text-spiritual-gold-700 border-spiritual-gold-200",
};

/**
 * Category label mapping (Hungarian)
 */
const CATEGORY_LABELS: Record<FAQItem['category'], string> = {
  benefits: "Előnyök",
  urgency: "Időérzékeny",
  product: "Termék",
  trust: "Megbízhatóság",
};

/**
 * Individual accordion item component
 */
interface AccordionItemProps {
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ faq, isOpen, onToggle }: AccordionItemProps): JSX.Element {
  const { question, answer, category } = faq;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="
        bg-white
        border border-spiritual-purple-200
        rounded-2xl
        overflow-hidden
        shadow-[0_2px_8px_rgba(139,92,246,0.08),0_8px_24px_rgba(139,92,246,0.12)]
        hover:shadow-[0_4px_16px_rgba(139,92,246,0.12),0_12px_32px_rgba(139,92,246,0.18)]
        hover:scale-[1.01]
        transition-all duration-300
      "
    >
      {/* Question Header (Clickable) */}
      <button
        onClick={onToggle}
        className="
          w-full flex items-start justify-between gap-4
          p-5 md:p-6
          text-left
          focus:outline-none
          focus-visible:ring-4 focus-visible:ring-spiritual-purple-300/50
          focus-visible:ring-offset-2
          transition-all
        "
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <div className="flex-1">
          {/* Category Badge */}
          <span
            className={`
              inline-block mb-3
              px-3 py-1
              rounded-full
              text-xs font-semibold
              border
              ${CATEGORY_COLORS[category]}
            `}
          >
            {CATEGORY_LABELS[category]}
          </span>

          {/* Question Text */}
          <h3 className="
            font-semibold
            text-gray-900
            text-base md:text-lg
            leading-snug
            transition-colors duration-200
          ">
            {question}
          </h3>
        </div>

        {/* Chevron Icon */}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 flex-shrink-0 text-spiritual-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>

      {/* Answer Content (Expandable) */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${faq.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 pt-2">
              <div className="
                border-t border-spiritual-purple-100
                pt-4
              ">
                <p className="
                  text-gray-700
                  leading-relaxed
                  text-sm md:text-base
                  whitespace-pre-line
                ">
                  {answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Main FAQ Accordion Component
 */
export default function FAQAccordion(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const handleToggle = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              font-serif
              text-3xl md:text-4xl
              font-bold
              text-gray-900
              mb-4
            "
          >
            ❓ Gyakran Ismételt Kérdések
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="
              text-gray-600
              text-base md:text-lg
              max-w-2xl mx-auto
            "
          >
            Minden, amit tudnod kell a csakra elemzésről
          </motion.p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqConversionItems.map((faq, index) => (
            <AccordionItem
              key={faq.id}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Bottom CTA (Optional - can add later) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">
            További kérdésed van?
          </p>
          <a
            href="mailto:hello@eredeticsakra.hu"
            className="
              inline-flex items-center gap-2
              px-6 py-3
              bg-gradient-to-r from-spiritual-purple-500 to-spiritual-rose-500
              text-white
              font-semibold
              rounded-full
              hover:scale-105
              hover:shadow-lg
              transition-all duration-300
            "
          >
            <span>Írj nekünk</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
