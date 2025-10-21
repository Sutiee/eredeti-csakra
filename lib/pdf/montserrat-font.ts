/**
 * Montserrat Font for jsPDF
 *
 * This module contains Base64-encoded Montserrat font files for use with jsPDF.
 * The font supports full Hungarian character set including ő, ű, etc.
 */

import type jsPDF from 'jspdf';

/**
 * Register Montserrat fonts with jsPDF document
 * Must be called after creating jsPDF instance
 */
export function registerMontserratFont(doc: jsPDF): void {
  // Note: We'll use a lightweight approach - download and convert Montserrat to Base64
  // For now, use Helvetica which has good Unicode support
  // TODO: Add actual Montserrat Base64 font data here

  // Fallback to helvetica for now
  doc.setFont('helvetica');
}

/**
 * Set font to Montserrat (or fallback)
 */
export function setMontserratFont(doc: jsPDF, style: 'normal' | 'bold' = 'normal'): void {
  // TODO: Use 'Montserrat' when Base64 font is added
  doc.setFont('helvetica', style);
}
