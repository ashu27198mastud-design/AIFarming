'use client';

import Link from 'next/link';
import { CloudRain, LayoutDashboard, ListChecks, Settings, Sprout, TrendingUp } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';

export type TabId = 'home' | 'weather' | 'mandi' | 'farm' | 'tools';

type Props = {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  t: TranslationSet;
  locality: string;
  userName: string;
};

function initialsFor(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
  return initials.toUpperCase() || 'K';
}

export default function BottomNav({ activeTab, onChange, t, locality, userName }: Props) {
  const items = [
    { id: 'home' as const, label: t.home, icon: LayoutDashboard },
    { id: 'weather' as const, label: t.weather, icon: CloudRain },
    { id: 'mandi' as const, label: t.mandi, icon: TrendingUp },
    { id: 'farm' as const, label: t.myFarm, icon: Sprout },
    { id: 'tools' as const, label: t.farmPlan, icon: ListChecks },
  ];

  return (
    <nav className="app-navigation" aria-label="Primary navigation">
      <div className="app-navigation-surface">
        <button
          type="button"
          onClick={() => onChange('home')}
          className="sidebar-brand"
          data-tooltip={t.title}
          aria-label={t.title}
        >
          <span className="sidebar-brand-mark"><Sprout className="h-5 w-5" /></span>
          <span className="sidebar-brand-copy">
            <strong>{t.title}</strong>
            <small>{locality}</small>
          </span>
        </button>

        <div className="sidebar-nav-list">
          {items.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                className="app-nav-item"
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                data-tooltip={label}
              >
                <span className="app-nav-icon"><Icon className="h-5 w-5" /></span>
                <span className="app-nav-label">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-profile">
          <span className="sidebar-avatar" data-tooltip={userName} data-user-content>{initialsFor(userName)}</span>
          <span className="sidebar-profile-copy" data-user-content>
            <strong>{userName}</strong>
            <small>{locality}</small>
          </span>
          <Link
            href="/setup"
            className="sidebar-settings"
            aria-label={t.profileSetupTitle}
            title={t.profileSetupTitle}
            data-tooltip={t.profileSetupTitle}
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
