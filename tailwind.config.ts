import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spirituális színpaletta - 35+ női közönségnek
        spiritual: {
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87',
          },
          rose: {
            50: '#fff1f2',
            100: '#ffe4e6',
            200: '#fecdd3',
            300: '#fda4af',
            400: '#fb7185',
            500: '#f43f5e',
            600: '#e11d48',
            700: '#be123c',
            800: '#9f1239',
            900: '#881337',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
        },
        // Csakra színek
        chakra: {
          root: '#DC143C',        // Gyökércsakra - Piros
          sacral: '#FF8C00',      // Szakrális - Narancs
          solar: '#FFD700',       // Napfonat - Arany/Sárga
          heart: '#32CD32',       // Szív - Zöld
          throat: '#4169E1',      // Torok - Kék
          third: '#9370DB',       // Harmadik szem - Indigó
          crown: '#9400D3',       // Korona - Lila
        },
      },
      backgroundImage: {
        'gradient-spiritual': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-rose-gold': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-purple-pink': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'gradient-mystical': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
