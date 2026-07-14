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
        obsidian: { DEFAULT: '#0D1117', light: '#161B22', lighter: '#21262D' },
        emerald: { deep: '#0F5132', mid: '#157347', bright: '#198754' },
        gold: { DEFAULT: '#C9A84C', light: '#E8C96A', dim: '#A07830' },
        ivory: { DEFAULT: '#F5F0E8', dim: '#D4CFC7' },
        atmblue: { DEFAULT: '#1A4A6E', bright: '#2D7DD2' },
        riskyamber: { DEFAULT: '#D97706', light: '#F59E0B' },
        criticalred: { DEFAULT: '#DC2626', light: '#EF4444' },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        dmsans: ['DM Sans', 'system-ui', 'sans-serif'],
        dmmono: ['DM Mono', 'monospace'],
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'drone-float': 'droneFloat 3s ease-in-out infinite',
        'radar-pulse': 'radarPulse 2s ease-out infinite',
      },
      keyframes: {
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        droneFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        radarPulse: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      backdropBlur: { xs: '4px' },
      boxShadow: {
        gold: '0 0 20px rgba(201, 168, 76, 0.2), 0 0 60px rgba(201, 168, 76, 0.05)',
        critical: '0 0 20px rgba(220, 38, 38, 0.3)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '24px' },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
