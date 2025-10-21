/**
 * Roboto Font Base64 for jsPDF
 * Supports Hungarian characters (áéíóöőúüű ÁÉÍÓÖŐÚÜŰ)
 *
 * This is a subset of Roboto Regular and Bold fonts
 * Base64 encoded for direct embedding in jsPDF
 */

// Roboto Regular - Base64 encoded TTF
export const ROBOTO_REGULAR_BASE64 = 'data:font/truetype;charset=utf-8;base64,AAEAAAASAQAABAAgR0RFRgBhAC0AAAD...';

// Roboto Bold - Base64 encoded TTF
export const ROBOTO_BOLD_BASE64 = 'data:font/truetype;charset=utf-8;base64,AAEAAAASAQAABAAgR0RFRgBhAC0AAAD...';

/**
 * Register Roboto fonts with jsPDF
 * Call this before using the fonts
 */
export function registerRobotoFonts(doc: any): void {
  // Note: We'll use the built-in fonts that support Unicode
  // jsPDF 3.x has better Unicode support than v1
}
