import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dae8ff',
          500: '#5b7cff',
          600: '#4661e6',
          700: '#3851c2',
          900: '#1e2554',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
