import type { Config } from 'tailwindcss';

/**
 * Cine Sphere Design System — Apple-style premium theme.
 *
 * Palette philosophy: Apple's product-page language — true black canvas,
 * #f5f5f7 light editorial sections, #86868b neutral gray copy on both,
 * and Apple blue as the single accent. Token names are kept from the
 * original system (piano/ivory/champagne) so component classes are stable;
 * only the values are remapped.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core surfaces — Apple blacks & grays
        piano: {
          DEFAULT: '#000000', // true Apple black
          900: '#0a0a0a',
          800: '#101010',
          700: '#161617',
          600: '#1d1d1f',
        },
        carbon: {
          DEFAULT: '#1d1d1f',
          light: '#2c2c2e',
        },
        // Apple type grays — #f5f5f7 headline white, #86868b body gray
        ivory: {
          DEFAULT: '#f5f5f7',
          muted: '#86868b',
          faint: '#6e6e73',
        },
        // The one accent — Apple blue
        champagne: {
          DEFAULT: '#2997ff', // link blue on dark
          light: '#64d2ff',
          deep: '#0071e3', // button blue
          glow: '#5ac8fa',
        },
      },
      fontFamily: {
        // SF Pro on Apple devices, Inter (next/font) everywhere else.
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'var(--font-display)',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          'var(--font-sans)',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      letterSpacing: {
        luxe: '0.22em',
        wide: '0.12em',
      },
      backgroundImage: {
        'gold-sheen':
          'linear-gradient(110deg, #0071e3 0%, #2997ff 45%, #64d2ff 55%, #0071e3 100%)',
        'piano-fade':
          'radial-gradient(ellipse at center, #161617 0%, #000000 70%)',
        'carbon-weave':
          'repeating-linear-gradient(45deg, #1d1d1f 0px, #1d1d1f 2px, #161617 2px, #161617 4px)',
      },
      boxShadow: {
        glass: '0 8px 40px -8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        gold: '0 0 28px -4px rgba(41,151,255,0.45)',
      },
      backdropBlur: {
        glass: '14px',
      },
      animation: {
        'fade-up': 'fadeUp 1.1s cubic-bezier(0.16,1,0.3,1) forwards',
        'gold-shift': 'goldShift 6s linear infinite',
        breathe: 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        goldShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        breathe: {
          '0%,100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
