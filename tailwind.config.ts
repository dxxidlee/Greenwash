import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        greenwash: {
          primary: '#008F46',
          dark: '#006633',
          light: '#00B359',
        },
        dystopian: {
          bg: '#0a0a0a',
          surface: '#1a1a1a',
          border: '#333333',
          text: '#e0e0e0',
          muted: '#888888',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        montreal: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'rotate-slow': 'rotate 20s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'glitch': 'glitch 0.3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { boxShadow: '0 0 5px #008F46' },
          '100%': { boxShadow: '0 0 20px #008F46, 0 0 30px #008F46' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'dystopian-grid': 'linear-gradient(rgba(0,143,70,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,143,70,0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
