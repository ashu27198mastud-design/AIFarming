import Link from 'next/link';
import { ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';
import type { LanguageCode } from '@/lib/i18n';

const BRAND_NAME = 'KisanMitra';

const COPY: Record<LanguageCode, {
  back: string;
  eyebrow: string;
  title: string;
  description: string;
  category: string;
  notice: string;
}> = {
  hi: {
    back: 'डैशबोर्ड',
    eyebrow: 'बाजार श्रेणी',
    title: 'यूरिया',
    description: 'अपने क्षेत्र के विक्रेताओं से श्रेणी और उपलब्धता की तुलना करें।',
    category: 'उर्वरक श्रेणी',
    notice: 'यह पृष्ठ किसी एक उत्पाद की सिफारिश नहीं करता।',
  },
  en: {
    back: 'Dashboard',
    eyebrow: 'Bazaar category',
    title: 'Urea',
    description: 'Compare category availability from sellers serving your area.',
    category: 'Fertiliser category',
    notice: 'This page does not recommend a single product.',
  },
  mr: {
    back: 'डॅशबोर्ड',
    eyebrow: 'बाजार श्रेणी',
    title: 'युरिया',
    description: 'तुमच्या परिसरातील विक्रेत्यांकडील श्रेणी आणि उपलब्धता तुलना करा.',
    category: 'खत श्रेणी',
    notice: 'हे पान कोणत्याही एका उत्पादनाची शिफारस करत नाही.',
  },
};

export default async function BazaarPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; category?: string }>;
}) {
  const params = await searchParams;
  const language: LanguageCode = params.lang === 'mr' || params.lang === 'hi' ? params.lang : 'en';
  const copy = COPY[language];

  return (
    <main className="bazaar-page">
      <header className="bazaar-header">
        <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> {copy.back}</Link>
        <span><ShoppingBag className="h-5 w-5" /> {BRAND_NAME}</span>
      </header>
      <section className="bazaar-category-view">
        <span className="section-kicker">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <div className="bazaar-category-card">
          <ShoppingBag className="h-6 w-6" />
          <span><small>{copy.category}</small><strong>{copy.title}</strong></span>
        </div>
        <aside><ShieldCheck className="h-4 w-4" /> {copy.notice}</aside>
      </section>
    </main>
  );
}
