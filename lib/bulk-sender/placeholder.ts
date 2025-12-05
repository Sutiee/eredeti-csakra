/**
 * Placeholder replacement utilities for Bulk Email Sender
 */

import type { BulkSenderRecipient } from '@/types';

/**
 * Replace placeholders in text with recipient data
 * Supports: {{name}}, {{email}}, and any other {{placeholder}}
 */
export function replacePlaceholders(
  text: string,
  recipient: BulkSenderRecipient
): string {
  let result = text;

  // Replace {{name}} - use email username if name is missing
  const name = recipient.name || recipient.email.split('@')[0];
  result = result.replace(/\{\{name\}\}/gi, name);

  // Replace {{email}}
  result = result.replace(/\{\{email\}\}/gi, recipient.email);

  return result;
}

/**
 * Get list of available placeholders
 */
export function getAvailablePlaceholders(): string[] {
  return ['{{name}}', '{{email}}'];
}
