'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { UserInfo } from '@/types';
import Button from '@/components/ui/Button';

// Validation schema
const userInfoSchema = z.object({
  full_name: z
    .string()
    .min(2, 'A név legalább 2 karakter hosszú legyen')
    .max(100, 'A név maximum 100 karakter lehet'),
  email: z
    .string()
    .email('Érvényes email címet adj meg'),
  age: z
    .number()
    .min(16, 'Minimum 16 éves korhatár')
    .max(99, 'Érvénytelen életkor')
    .optional()
    .nullable(),
});

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  disabled?: boolean;
}

export default function UserInfoForm({ onSubmit, disabled = false }: UserInfoFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    age: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Check for debug mode (URL param or development env)
  const [isDebugMode, setIsDebugMode] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const debugParam = params.get('debug') === 'true';
    const isDev = process.env.NODE_ENV === 'development';
    setIsDebugMode(debugParam || isDev);
  }, []);

  // Validate single field
  const validateField = (name: string, value: any) => {
    try {
      const schema = userInfoSchema.shape[name as keyof typeof userInfoSchema.shape];
      schema.parse(value);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [name]: error.errors[0].message,
        }));
      }
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'age' ? (value === '' ? '' : value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));

    // Validate if field was touched
    if (touched[name]) {
      const validationValue = name === 'age'
        ? (value === '' ? null : Number(value))
        : value;
      validateField(name, validationValue);
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const validationValue = name === 'age'
      ? (value === '' ? null : Number(value))
      : value;
    validateField(name, validationValue);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      full_name: true,
      email: true,
      age: true,
    });

    // Prepare data for validation
    const dataToValidate = {
      full_name: formData.full_name,
      email: formData.email,
      age: formData.age === '' ? undefined : Number(formData.age),
    };

    console.log('UserInfoForm submitting:', dataToValidate);

    // Validate all fields
    try {
      const validatedData = userInfoSchema.parse(dataToValidate);
      console.log('UserInfoForm validated:', validatedData);
      onSubmit(validatedData as UserInfo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const isFormValid = () => {
    return (
      formData.full_name.length >= 2 &&
      formData.email.includes('@') &&
      Object.keys(errors).length === 0
    );
  };

  // DEBUG: Auto-fill form (only in development)
  const handleDebugAutoFill = () => {
    const timestamp = Date.now();
    setFormData({
      full_name: 'Teszt Mária',
      email: `teszt${timestamp}@example.com`,
      age: '42',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold bg-gradient-spiritual bg-clip-text text-transparent mb-3">
          Már majdnem kész!
        </h2>
        <p className="text-gray-600">
          Add meg az adataidat, hogy elküldhessük a személyre szabott elemzésed.
        </p>

        {/* DEBUG: Auto-fill button (debug mode or development) */}
        {isDebugMode && (
          <button
            type="button"
            onClick={handleDebugAutoFill}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors text-sm"
            title="Automatikus kitöltés teszt adatokkal"
          >
            🚀 Gyors Kitöltés
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Teljes neved <span className="text-spiritual-rose-500">*</span>
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder="pl. Nagy Katalin"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-spiritual-purple-400 ${
              errors.full_name && touched.full_name
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 focus:border-spiritual-purple-400'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            required
            aria-invalid={errors.full_name && touched.full_name ? 'true' : 'false'}
            aria-describedby={errors.full_name && touched.full_name ? 'full_name-error' : undefined}
          />
          {errors.full_name && touched.full_name && (
            <p id="full_name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.full_name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Email címed <span className="text-spiritual-rose-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder="pl. katalin@example.com"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-spiritual-purple-400 ${
              errors.email && touched.email
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 focus:border-spiritual-purple-400'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            required
            aria-invalid={errors.email && touched.email ? 'true' : 'false'}
            aria-describedby={errors.email && touched.email ? 'email-error' : 'email-hint'}
          />
          {errors.email && touched.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.email}
            </p>
          )}
          <p id="email-hint" className="mt-2 text-xs text-gray-500">
            📧 Az email címedet csak az eredmény elküldésére használjuk. Nem küldünk spam-et!
          </p>
        </div>

        {/* Age */}
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Életkorod <span className="text-gray-400">(opcionális)</span>
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder="pl. 42"
            min="16"
            max="99"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-spiritual-purple-400 ${
              errors.age && touched.age
                ? 'border-red-400 bg-red-50'
                : 'border-gray-200 focus:border-spiritual-purple-400'
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            aria-invalid={errors.age && touched.age ? 'true' : 'false'}
            aria-describedby={errors.age && touched.age ? 'age-error' : undefined}
          />
          {errors.age && touched.age && (
            <p id="age-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.age}
            </p>
          )}
        </div>

        {/* Privacy Note */}
        <div className="bg-spiritual-purple-50 rounded-xl p-4 border border-spiritual-purple-100">
          <p className="text-sm text-gray-700">
            🔒 <strong>Adatvédelem:</strong> Az adataidat bizalmasan kezeljük, és kizárólag
            a csakra elemzésed elkészítésére és elküldésére használjuk fel.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          disabled={!isFormValid() || disabled}
          className="w-full py-4 text-lg font-semibold"
        >
          {disabled ? 'Feldolgozás...' : 'Eredmény megtekintése ✨'}
        </Button>
      </form>
    </motion.div>
  );
}
