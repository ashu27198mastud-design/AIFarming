import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AETHER AG — Agriculture Intelligence Operating System',
  description: 'A predictive agriculture operating system that connects atmospheric intelligence, crop health, water, operations and market decisions. Sense from the sky. Decide with intelligence. Act on the ground.',
  keywords: ['agriculture', 'AI farming', 'crop intelligence', 'precision agriculture', 'smart farming'],
  authors: [{ name: 'AETHER AG' }],
  openGraph: {
    title: 'AETHER AG',
    description: 'Agriculture Intelligence Operating System',
    type: 'website',
  },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0D1117',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian-DEFAULT min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
