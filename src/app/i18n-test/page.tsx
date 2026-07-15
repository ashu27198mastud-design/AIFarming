'use client';

import { TRANSLATIONS } from '@/lib/i18n';

export default function I18nTestPage() {
  const hiText = TRANSLATIONS.hi.tagline;
  const mrText = TRANSLATIONS.mr.tagline;
  const enText = TRANSLATIONS.en.tagline;

  return (
    <main className="p-8 max-w-md mx-auto bg-white rounded-3xl shadow-lg mt-10 space-y-4">
      <h2 className="text-xl font-bold">{hiText}</h2>
      <h2 className="text-xl font-bold">{mrText}</h2>
      <h2 className="text-xl font-bold">{enText}</h2>
    </main>
  );
}
