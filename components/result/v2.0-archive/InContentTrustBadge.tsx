"use client";

import { motion } from "framer-motion";

/**
 * InContentTrustBadge Component
 *
 * Lightweight trust signal badges scattered between chakra cards on the result page.
 * Part of v2.1 conversion optimization strategy to reduce decision anxiety.
 *
 * @example
 * // Usage pattern in result page:
 * <ChakraCard chakra="root" ... />
 * <ChakraCard chakra="sacral" ... />
 * <InContentTrustBadge type="guarantee" />
 * <ChakraCard chakra="solar-plexus" ... />
 * <ChakraCard chakra="heart" ... />
 * <InContentTrustBadge type="stripe" />
 * <ChakraCard chakra="throat" ... />
 * <InContentTrustBadge type="rating" />
 * <ChakraCard chakra="third-eye" ... />
 * <ChakraCard chakra="crown" ... />
 * <InContentTrustBadge type="social-proof" />
 */

type BadgeType = 'guarantee' | 'stripe' | 'ssl' | 'rating' | 'social-proof';

interface InContentTrustBadgeProps {
  /**
   * Type of trust signal to display
   * - guarantee: 14 day money-back guarantee
   * - stripe: Secure Stripe payment
   * - ssl: SSL encryption security
   * - rating: Customer rating (4.9/5)
   * - social-proof: User count (2,000+)
   */
  type: BadgeType;
}

/**
 * Badge content configuration
 * Each badge has an emoji icon and Hungarian text
 */
const BADGE_CONTENT: Record<BadgeType, { icon: string; text: string }> = {
  guarantee: {
    icon: "🛡️",
    text: "14 nap pénzvisszafizetési garancia",
  },
  stripe: {
    icon: "💳",
    text: "Stripe biztonságos fizetés",
  },
  ssl: {
    icon: "🔒",
    text: "SSL titkosítás",
  },
  rating: {
    icon: "⭐",
    text: "4.9/5 (347 értékelés)",
  },
  "social-proof": {
    icon: "👥",
    text: "2,000+ magyar nő kipróbálta",
  },
};

/**
 * Framer Motion animation variants
 * Subtle fade-in with slight upward motion
 */
const badgeVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function InContentTrustBadge({ type }: InContentTrustBadgeProps): JSX.Element {
  const { icon, text } = BADGE_CONTENT[type];

  return (
    <div className="flex justify-center my-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={badgeVariants}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-white/30"
      >
        {/* Emoji Icon */}
        <span className="text-lg" role="img" aria-hidden="true">
          {icon}
        </span>

        {/* Badge Text */}
        <span className="text-sm font-medium text-white/90">
          {text}
        </span>
      </motion.div>
    </div>
  );
}
