/**
 * Google Fonts configuration using next/font
 * Optimizes font loading for better performance
 */

import { Inter, Playfair_Display } from 'next/font/google';

/**
 * Inter font for body text
 * Weights: 300, 400, 500, 600, 700
 */
export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

/**
 * Playfair Display font for headings
 * Weights: 400, 600, 700
 */
export const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
});
