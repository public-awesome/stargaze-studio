const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./{components,contexts,hooks,pages,utils}/**/*.{js,cjs,mjs,ts,tsx}'],

  theme: {
    extend: {
      colors: {
        stargaze: { DEFAULT: '#FDC06D' },
        dark: { DEFAULT: '#06090B' },
        gray: { DEFAULT: '#F3F6F8' },
        'dark-gray': { DEFAULT: '#191D20' },
        purple: { DEFAULT: '#7E5DFF' },

        neutral: colors.neutral,
        plumbus: {
          DEFAULT: '#FFC27D',
          light: '#FFC27D',
          matte: '#FFC27D',
          dark: '#FFC27D',
          10: '#FFF0ED',
          20: '#FACBC8',
          30: '#F5A7A2',
          40: '#F0827D',
          50: '#D9726F',
          60: '#C26261',
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
          background: `linear-gradient(64.38deg, #00027D 15.06%, #FFC27D 100.6%), #252020`,
        },
        '.stargaze-gradient-brand': {
          background: `linear-gradient(102.33deg, #FFC27D 10.96%, #FFC27D 93.51%)`,
        },
      })
    }),
  ],
}
