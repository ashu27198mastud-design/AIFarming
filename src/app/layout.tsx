import type { Metadata, Viewport } from 'next';
import './globals.css';
import './google-clean.css';
import './google-compact.css';
import './liquid-glass.css';

export const metadata: Metadata = {
  title: 'KisanMitra Predict',
  description: 'A farmer-first crop intelligence app for disease detection, weather warnings, market prices, and practical crop advice.',
  keywords: ['KisanMitra Predict', 'smart farming India', 'crop disease diagnosis', 'AI farmer assistant', 'mandi prices'],
  authors: [{ name: 'KisanMitra Team' }],
  openGraph: {
    title: 'KisanMitra Predict',
    description: 'Detect crop diseases, plan treatments, follow weather alerts, and compare live market prices.',
    type: 'website',
    siteName: 'KisanMitra Predict',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F7F9FC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
