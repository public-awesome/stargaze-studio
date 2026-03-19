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
        stargaze: { DEFAULT: '#DB2676', 80: '#C81F71' },
        dark: { DEFAULT: '#06090B' },
        gray: { DEFAULT: '#A9A9A9' },
        'dark-gray': { DEFAULT: '#191D20' },
        purple: { DEFAULT: '#7E5DFF' },

        neutral: colors.neutral,
        plumbus: {
          DEFAULT: '#DB2676',
          light: '#AF1F5F',
          matte: '#5D89E9',
          dark: '#FFC900',
          10: '#FFF0ED',
          20: '#5D89E9',
          30: '#F5A7A2',
          40: '#DB2676',
          50: '#DB2676',
          60: '#DB2676',
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
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(219, 38, 118, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(219, 38, 118, 0.4)' },
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-lg': '0 20px 40px rgba(0, 0, 0, 0.5)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'glow-plumbus': '0 0 20px rgba(219, 38, 118, 0.3)',
        'glow-plumbus-lg': '0 0 30px rgba(219, 38, 118, 0.4)',
      },
    },
  },

  plugins: [
    // tailwindcss official plugins
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/line-clamp'),
    require('tailwindcss-opentype'),

    // custom gradient background and glass utilities
    plugin(({ addUtilities }) => {
      addUtilities({
        '.stargaze-gradient-bg': {
          background: `linear-gradient(64.38deg, #00027D 15.06%, #7F97D2 100.6%), #252020`,
        },
        '.stargaze-gradient-brand': {
          background: `linear-gradient(102.33deg, #FFC27D 10.96%, #7F97D2 93.51%)`,
        },
        // Glass morphism utilities
        '.glass-panel': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-panel-dark': {
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
        '.glass-border': {
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        },
      })
    }),
    require('daisyui'),
  ],
}
