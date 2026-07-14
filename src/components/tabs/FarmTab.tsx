'use client';

import { Leaf, MapPin, User } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';
import type { ScanHistoryItem } from '@/components/tabs/HomeTab';

type Props = {
  t: TranslationSet;
  lang: string;
  scans: ScanHistoryItem[];
  farm: { region: string; farmSizeHectares: number };
};

function statusClass(severity: string) {
  if (severity === 'critical' || severity === 'high') return 'status-danger';
  if (severity === 'medium') return 'status-warning';
  if (severity === 'unknown') return 'status-unknown';
  return 'status-live';
}

export default function FarmTab({ t, lang, scans, farm }: Props) {
  return (
    <div className="space-y-4">
      <section className="m3-card flex items-center gap-4">
        <div className="avatar-3d flex items-center justify-center text-[#188038]"><User className="h-6 w-6" /></div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold text-[#202124]">{t.farmerName}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#5F6368]"><MapPin className="h-3.5 w-3.5" />{farm.region}</p>
        </div>
        <span className="metric-pill">{farm.farmSizeHectares} {lang === 'en' ? 'ha' : 'हे.'}</span>
      </section>

      <section className="m3-card flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="icon-tile text-[#188038]"><Leaf className="h-5 w-5" /></div>
          <div className="min-w-0">
            <span className="section-kicker">{t.activeCrop}</span>
            <h3 className="mt-1 truncate text-base font-bold text-[#202124]">टमाटर / Tomato</h3>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#5F6368]">Flowering</span>
      </section>

      <section className="m3-card">
        <div className="flex items-center justify-between">
          <span className="section-kicker">{t.savedScans}</span>
          <span className="metric-pill">{scans.length}</span>
        </div>

        {scans.length === 0 ? (
          <p className="py-8 text-center text-sm font-medium text-[#80868B]">{t.noScans}</p>
        ) : (
          <div className="mt-3 divide-y divide-[#EEF0EF]">
            {scans.map((scan) => (
              <div key={scan.id} className="scan-row flex items-center gap-3 py-3">
                <div className="scan-thumbnail h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl bg-[#F1F3F4]">
                  <img src={scan.thumbnail} alt="Scan preview" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-[#202124]">{scan.disease}</h4>
                  <span className="mt-1 block text-[11px] font-medium text-[#80868B]">{scan.date}</span>
                </div>
                <span className={`status-orb ${statusClass(scan.severity)}`} aria-label={`Severity ${scan.severity}`} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
