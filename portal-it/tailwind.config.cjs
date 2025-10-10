const { fontFamily } = require('tailwindcss/defaultTheme');

/***********************************************
 * Tailwind config tuned for dark admin portal *
 **********************************************/
module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(222, 47%, 11%)',
        foreground: 'hsl(210, 40%, 96%)',
        card: {
          DEFAULT: 'hsl(222, 47%, 14%)',
          foreground: 'hsl(210, 40%, 98%)',
        },
        muted: {
          DEFAULT: 'hsl(215, 27%, 16%)',
          foreground: 'hsl(215, 20%, 65%)',
        },
        border: 'hsl(215, 16%, 25%)',
        primary: {
          DEFAULT: 'hsl(199, 89%, 48%)',
          foreground: '#0b1120',
        },
        accent: {
          DEFAULT: 'hsl(267, 87%, 67%)',
          foreground: '#0b1120',
        },
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      boxShadow: {
        card: '0 12px 24px -20px rgba(15, 23, 42, 0.8)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
