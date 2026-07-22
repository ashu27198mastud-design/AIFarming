import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        success: 'var(--ok)',
        warning: 'var(--warn)',
        danger: 'var(--danger)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        kicker: ['13px', { lineHeight: '1.3', letterSpacing: '0.06em' }],
        meta: ['14px', { lineHeight: '1.45' }],
        nav: ['15px', { lineHeight: '1' }],
        body: ['16px', { lineHeight: '1.6' }],
        btn: ['16px', { lineHeight: '1' }],
        title: ['18px', { lineHeight: '1.4' }],
        'market-title': ['22px', { lineHeight: '1.3' }],
        stat: ['26px', { lineHeight: '1.1' }],
        'hero-num': ['36px', { lineHeight: '1.05' }],
        hero: ['40px', { lineHeight: '1.15' }],
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 450ms cubic-bezier(.22,1,.36,1) both',
      },
      keyframes: {
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        glass: '14px',
      },
      boxShadow: {
        l1: 'var(--shadow-l1)',
        l2: 'var(--shadow-l2)',
        l3: 'var(--shadow-l3)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;