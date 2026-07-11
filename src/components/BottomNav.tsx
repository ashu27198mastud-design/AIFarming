'use client';

import { Camera, CloudRain, Sprout, TrendingUp } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';

export type TabId = 'home' | 'weather' | 'mandi' | 'farm';

type Props = {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  t: TranslationSet;
};

export default function BottomNav({ activeTab, onChange, t }: Props) {
  const items = [
    { id: 'home' as const, label: t.home, icon: Camera },
    { id: 'weather' as const, label: t.weather, icon: CloudRain },
    { id: 'mandi' as const, label: t.mandi, icon: TrendingUp },
    { id: 'farm' as const, label: t.myFarm, icon: Sprout },
  ];

  return (
    <nav className="bottom-dock-wrap" aria-label="Primary navigation">
      <div className="bottom-dock">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} type="button" onClick={() => onChange(id)} className="nav-tab-button flex-1" aria-current={active ? 'page' : undefined}>
              <div className={`nav-icon ${active ? 'nav-icon-active' : 'text-[#777D79]'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`mt-1 text-[11px] font-extrabold tracking-[-0.01em] ${active ? 'text-[#29312D]' : 'text-[#8A8F8B]'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
