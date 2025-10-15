/**
 * Thank You Message Component
 * Eredeti Csakra - Purchase Confirmation Message
 */

'use client';

import { motion } from 'framer-motion';

type Purchase = {
  id: string;
  product_name: string;
  amount: number;
  currency: string;
};

type ThankYouMessageProps = {
  purchases: Purchase[];
};

/**
 * Thank You Message Component
 */
export default function ThankYouMessage({ purchases }: ThankYouMessageProps) {
  const totalAmount = purchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
        Vásárlás részletei
      </h2>

      <div className="space-y-3 mb-6">
        {purchases.map((purchase, index) => (
          <motion.div
            key={purchase.id}
            className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <div>
              <p className="font-semibold text-gray-800">{purchase.product_name}</p>
              <p className="text-sm text-gray-500">Digitális termék</p>
            </div>
            <p className="text-lg font-bold text-purple-700">
              {purchase.amount.toLocaleString()} {purchase.currency}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="flex justify-between items-center pt-4 border-t-2 border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-xl font-bold text-gray-800">Végösszeg:</span>
        <span className="text-2xl font-bold text-purple-700">
          {totalAmount.toLocaleString()} HUF
        </span>
      </motion.div>

      <motion.div
        className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <div>
            <p className="font-semibold text-blue-900">
              Megerősítő emailt küldtünk
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Ellenőrizd a postaládád! A vásárlás részleteit és a letöltési linkeket
              emailben is megküldtük.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
