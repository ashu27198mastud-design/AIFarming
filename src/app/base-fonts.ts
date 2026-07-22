import { Anek_Devanagari, Mukta } from 'next/font/google';

export const displayFont = Anek_Devanagari({
  variable: '--font-display',
  weight: ['500', '600', '700'],
  subsets: ['devanagari', 'latin'],
  display: 'swap',
});

export const bodyFont = Mukta({
  variable: '--font-body',
  weight: ['400', '500', '600'],
  subsets: ['devanagari', 'latin'],
  display: 'swap',
});
