const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./{components,contexts,hooks,pages,utils}/**/*.{js,cjs,mjs,ts,tsx}'],

  daisyui: {
    themes: ['dracula'],
  },

  theme: {
    extend: {
      colors: {
        stargaze: { DEFAULT: '#FFA900' },
        dark: { DEFAULT: '#06090B' },
        gray: { DEFAULT: '#F3F6F8' },
        'dark-gray': { DEFAULT: '#191D20' },
        purple: { DEFAULT: '#7E5DFF' },

        neutral: colors.neutral,
        plumbus: {
          DEFAULT: '#FFA900',
          light: '#FFC922',
          matte: '#5D89E9',
          dark: '#FFC900',
          10: '#FFF0ED',
          20: '#5D89E9',
          30: '#F5A7A2',
          40: '#FFA900',
          50: '#FFA900',
          60: '#FFA900',
          70: '#AB5152',
          80: '#944144',
          90: '#7D3136',
          100: '#662027',
          110: '#4F1019',
          120: '#38000B',
        },
        twitter: { DEFAULT: '#1DA1F2' },
      },
      fontFamily: {
        heading: ["'Basement Grotesque'", ...defaultTheme.fontFamily.sans],
        sans: ['Roboto', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },

  plugins: [
    // tailwindcss official plugins
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/line-clamp'),

    // custom gradient background
    plugin(({ addUtilities }) => {
      addUtilities({
        '.stargaze-gradient-bg': {
          background: `linear-gradient(64.38deg, #00027D 15.06%, #7F97D2 100.6%), #252020`,
        },
        '.stargaze-gradient-brand': {
          background: `linear-gradient(102.33deg, #FFC27D 10.96%, #7F97D2 93.51%)`,
        },
      })
    }),
    require('daisyui'),
  ],
}
