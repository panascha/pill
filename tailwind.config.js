/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#FAFAF9',
          subtle: '#F5F4F2',
          border: '#E8E5E0',
        },
        ink: {
          DEFAULT: '#1C1917',
          muted: '#78716C',
          faint: '#A8A29E',
        },
        accent: {
          DEFAULT: '#0F766E',
          hover: '#0D6660',
          light: '#CCFBF1',
        },
        warning: {
          DEFAULT: '#B45309',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#B91C1C',
          light: '#FEE2E2',
        },
        success: {
          DEFAULT: '#15803D',
          light: '#DCFCE7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
