'use client';

import { Leaf, User } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';
import type { ScanHistoryItem } from '@/components/tabs/HomeTab';

type Props = {
  t: TranslationSet;
  lang: string;
  scans: ScanHistoryItem[];
  farm: {
    region: string;
    farmSizeHectares: number;
  };
};

export default function FarmTab({ t, lang, scans, farm }: Props) {
  return (
    <div className="space-y-4">
      <div className="m3-card flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9] text-[#2E7D32]"><User className="h-8 w-8" /></div>
        <div>
          <h2 className="text-lg font-black text-zinc-800">{t.farmerName}</h2>
          <p className="text-xs font-bold text-zinc-500">{farm.region}</p>
          <p className="mt-1.5 inline-block rounded-full bg-[#E8F5E9] px-2.5 py-0.5 text-xs font-bold text-[#2E7D32]">{farm.farmSizeHectares} {lang === 'en' ? 'Hectares' : 'हेक्टेयर'}</p>
        </div>
      </div>

      <div className="m3-card">
        <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-500">{t.activeCrop}</span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="h-6 w-6 text-[#2E7D32]" />
            <div><h3 className="text-sm font-black text-zinc-800">टमाटर / Tomato</h3><span className="text-xs font-bold text-zinc-500">फूल आने की अवस्था / Flowering stage</span></div>
          </div>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Arka Rakshak</span>
        </div>
      </div>

      <div className="m3-card space-y-3">
        <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500">{t.savedScans}</span>
        {scans.length === 0 ? (
          <p className="py-6 text-center text-sm font-semibold text-zinc-400">{t.noScans}</p>
        ) : scans.map((scan) => (
          <div key={scan.id} className="flex items-center gap-3 border-b border-zinc-50 py-3 last:border-0">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100"><img src={scan.thumbnail} alt="Scan preview" className="h-full w-full object-cover" /></div>
            <div className="min-w-0 flex-1"><h4 className="truncate text-sm font-black text-zinc-800">{scan.disease}</h4><span className="block text-xs font-bold text-zinc-400">{scan.date} · {scan.dataSource}</span></div>
            <span className="flex-shrink-0 text-base">{scan.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
