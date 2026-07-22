import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { isLanguageCode, LANGUAGE_COOKIE_KEY } from '@/lib/language-preference';
import { bodyFont, displayFont } from './base-fonts';
import './globals.css';
import './google-clean.css';
import './google-compact.css';
import './liquid-glass.css';
import './device-hub.css';
import './elite-ui.css';
import './design-tokens.css';
import './v12-foundations.css';

const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase,
  title: 'ANVAYA Agriculture OS',
  description: 'One trusted daily action for crop health, weather, mandi planning, and farmer commerce.',
  keywords: ['ANVAYA Agriculture OS', 'KisanMitra', 'smart farming India', 'crop intelligence', 'mandi planning'],
  authors: [{ name: 'ANVAYA Team' }],
  openGraph: {
    title: 'ANVAYA Agriculture OS',
    description: 'The right farming decision before the loss.',
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
  themeColor: 'rgb(250, 250, 247)',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const savedLanguage = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;
  const initialLanguage = isLanguageCode(savedLanguage) ? savedLanguage : 'hi';

  return (
    <html lang={initialLanguage} dir="ltr" className={`${bodyFont.variable} ${displayFont.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}