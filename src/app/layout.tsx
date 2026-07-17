import type { Metadata, Viewport } from 'next';
import './globals.css';
import './google-clean.css';
import './google-compact.css';
import './liquid-glass.css';


export const metadata: Metadata = {
  title: 'ANVAYA Agriculture OS',
  description: 'A farmer-first agriculture system connecting crop intelligence, weather, soil guidance, and market planning for India.',
  keywords: ['ANVAYA Agriculture OS', 'smart farming India', 'crop intelligence', 'AI farmer assistant', 'mandi planning'],
  authors: [{ name: 'ANVAYA Team' }],
  openGraph: {
    title: 'ANVAYA Agriculture OS',
    description: 'Weather, soil, crop, and market decisions in one trusted agriculture system.',
    type: 'website',
    siteName: 'ANVAYA Agriculture OS',
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
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
