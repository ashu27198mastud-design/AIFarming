'use client';

import { Leaf, MapPin, Sparkles, User } from 'lucide-react';
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

function statusClass(severity: string) {
  if (severity === 'critical' || severity === 'high') return 'status-danger';
  if (severity === 'medium') return 'status-warning';
  if (severity === 'unknown') return 'status-unknown';
  return 'status-live';
}

export default function FarmTab({ t, lang, scans, farm }: Props) {
  return (
    <div className="space-y-5">
      <div className="m3-card profile-card flex items-center gap-4">
        <div className="avatar-3d flex items-center justify-center text-[#53615A]">
          <User className="relative z-10 h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="section-kicker mb-1.5"><Sparkles className="h-3.5 w-3.5 text-[#B18C56]" /> Farm profile</span>
          <h2 className="truncate text-[21px] font-extrabold text-[#202421]">{t.farmerName}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#7D817E]"><MapPin className="h-3.5 w-3.5 text-[#6B7E74]" /> {farm.region}</p>
          <p className="metric-pill mt-3">{farm.farmSizeHectares} {lang === 'en' ? 'Hectares' : 'हेक्टेयर'}</p>
        </div>
      </div>

      <div className="m3-card">
        <span className="section-kicker mb-4">{t.activeCrop}</span>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="icon-tile text-[#65766D]"><Leaf className="relative z-10 h-6 w-6" /></div>
            <div className="min-w-0">
              <h3 className="truncate text-[18px] font-extrabold text-[#202421]">टमाटर / Tomato</h3>
              <span className="mt-1 block text-xs font-bold text-[#7D817E]">फूल आने की अवस्था / Flowering stage</span>
            </div>
          </div>
          <span className="flex-shrink-0 rounded-full border border-[#DFC99E]/80 bg-gradient-to-b from-[#FFFDF8] to-[#F7EEDB] px-3 py-1 text-xs font-extrabold text-[#8B6A36] shadow-[inset_0_1px_0_#fff,0_5px_12px_rgba(145,107,49,0.1)]">Arka Rakshak</span>
        </div>
      </div>

      <div className="m3-card space-y-2">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="section-kicker">{t.savedScans}</span>
          {scans.length > 0 && <span className="metric-pill">{scans.length} scans</span>}
        </div>
        {scans.length === 0 ? (
          <div className="py-9 text-center">
            <div className="icon-tile mx-auto mb-3 text-[#65766D]"><Leaf className="relative z-10 h-6 w-6" /></div>
            <p className="text-sm font-semibold text-zinc-400">{t.noScans}</p>
          </div>
        ) : scans.map((scan) => (
          <div key={scan.id} className="scan-row flex items-center gap-3 border-b border-zinc-100/70 last:border-0">
            <div className="scan-thumbnail h-14 w-14 flex-shrink-0 overflow-hidden rounded-[17px] bg-zinc-100">
              <img src={scan.thumbnail} alt="Scan preview" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-[14px] font-extrabold text-[#252925]">{scan.disease}</h4>
              <span className="mt-1 block text-[11px] font-bold text-zinc-400">{scan.date} · {scan.dataSource === 'live' ? 'Live AI' : scan.dataSource}</span>
            </div>
            <span className={`status-orb ${statusClass(scan.severity)}`} title={scan.severity} aria-label={`Severity ${scan.severity}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
