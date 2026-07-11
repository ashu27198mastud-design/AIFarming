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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#2E7D32]/10 bg-[#FAFDF7]/95 py-2 backdrop-blur-md">
      <div className="mx-auto flex max-w-[480px] items-center justify-around">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} type="button" onClick={() => onChange(id)} className="nav-tab-button flex-1 transition-all">
              <div className={`flex items-center justify-center rounded-full p-2.5 transition-all ${active ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-zinc-500 hover:text-[#2E7D32]'}`}><Icon className="h-6 w-6" /></div>
              <span className={`mt-1 text-[12px] font-black ${active ? 'text-[#2E7D32]' : 'text-zinc-500'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
