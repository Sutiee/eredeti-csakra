/**
 * 404 Not Found Page
 * Spiritual-themed page for missing routes
 * Provides helpful navigation back to the site
 */

import type { Metadata } from 'next';
import NotFoundClient from '@/components/error-pages/NotFoundClient';

export const metadata: Metadata = {
  title: 'Oldal nem található',
  description: 'A keresett oldal nem található. Térj vissza a kezdőlapra.',
};

export default function NotFound() {
  return <NotFoundClient />;
}
