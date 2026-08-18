/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#f5f6fb',
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4338ca',
          light: '#e0e7ff',
        },
        secondary: {
          DEFAULT: '#10b981',
          dark: '#047857',
          light: '#d1fae5',
        },
        danger: {
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
          light: '#fee2e2',
        },
        ink: {
          DEFAULT: '#1e2233',
          muted: '#6b7280',
        },
        line: '#e2e4f0',
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(30, 34, 51, 0.06)',
        md: '0 8px 24px rgba(30, 34, 51, 0.1)',
      },
    },
  },
  plugins: [],
};
