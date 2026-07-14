import type { Metadata, Viewport } from 'next';
import './globals.css';
import './google-clean.css';

export const metadata: Metadata = {
  title: 'KisanMitra — आपकी फसल का साथी | Your Crop\'s Companion',
  description: 'किसानमित्र — भारतीय किसानों के लिए एक सरल और सुगम कृषि सहायक ऐप। फ़ोटो लें और बीमारी की तुरंत जांच करें। | KisanMitra — A simple and direct farmer-first crop assistant.',
  keywords: ['KisanMitra', 'किसानमित्र', 'smart farming India', 'crop disease diagnosis', 'AI farmer assistant', 'mandi prices'],
  authors: [{ name: 'KisanMitra Team' }],
  openGraph: {
    title: 'KisanMitra — आपकी फसल का साथी',
    description: 'किसानमित्र — फ़ोटो लें और फसल की बीमारी की तुरंत जांच करें। | KisanMitra — Take a photo to diagnose crop diseases instantly.',
    type: 'website',
    siteName: 'KisanMitra',
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
