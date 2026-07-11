import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KisanMitra — आपकी फसल का साथी | Your Crop\'s Companion',
  description: 'किसानमित्र — भारतीय किसानों के लिए एक सरल और सुगम कृषि सहायक ऐप। फ़ोटो लें और बीमारी की तुरंत जांच करें। | KisanMitra — A simple and direct farmer-first crop assistant. Take a photo to diagnose crop diseases instantly.',
  keywords: ['KisanMitra', 'किसानमित्र', 'smart farming India', 'crop disease diagnosis', 'AI farmer assistant', 'mandi prices'],
  authors: [{ name: 'KisanMitra Team' }],
  openGraph: {
    title: 'KisanMitra — आपकी फसल का साथी',
    description: 'किसानमित्र — फ़ोटो लें और फसल की बीमारी की तुरंत जांच करें। | KisanMitra — Take a photo to diagnose crop diseases instantly.',
    type: 'website',
    siteName: 'KisanMitra',
  },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FAFDF7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#FAFDF7] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
