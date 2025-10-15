'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-100',
      border: 'border-green-400',
      text: 'text-green-700',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-100',
      border: 'border-red-400',
      text: 'text-red-700',
      icon: '✕',
    },
    info: {
      bg: 'bg-blue-100',
      border: 'border-blue-400',
      text: 'text-blue-700',
      icon: 'ℹ',
    },
  };

  const style = styles[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className={`fixed top-4 right-4 max-w-md ${style.bg} border-2 ${style.border} ${style.text} px-6 py-4 rounded-xl shadow-lg z-50`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl font-bold flex-shrink-0">{style.icon}</span>
          <div className="flex-1">
            <p className="font-semibold mb-1">
              {type === 'error' ? 'Hiba történt' : type === 'success' ? 'Siker' : 'Információ'}
            </p>
            <p className="text-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-lg font-bold hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="Bezárás"
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
