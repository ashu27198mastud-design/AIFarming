'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CloudRain, LayoutDashboard, ListChecks, MoreHorizontal, Settings, ShieldCheck, Sprout, Store, TrendingUp } from 'lucide-react';
import type { LanguageCode, TranslationSet } from '@/lib/i18n';

export type TabId = 'home' | 'weather' | 'mandi' | 'farm' | 'tools' | 'commerce' | 'devices';

type Props = {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  t: TranslationSet;
  locality: string;
  userName: string;
  lang: LanguageCode;
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

export default function BottomNav({ activeTab, onChange, t, locality, userName, lang }: Props) {
  const [moreOpen, setMoreOpen] = useState(false);
  const commerceLabel = lang === 'en' ? 'Seller hub' : lang === 'hi' ? 'बिक्री केंद्र' : 'विक्री केंद्र';
  const deviceLabel = lang === 'en' ? 'Smart devices' : lang === 'hi' ? 'स्मार्ट उपकरण' : 'स्मार्ट उपकरणे';
  const moreLabel = lang === 'en' ? 'More' : lang === 'hi' ? 'और' : 'अधिक';
  const items = [
    { id: 'home' as const, label: t.home, icon: LayoutDashboard },
    { id: 'weather' as const, label: t.weather, icon: CloudRain },
    { id: 'mandi' as const, label: t.mandi, icon: TrendingUp },
    { id: 'farm' as const, label: t.myFarm, icon: Sprout },
    { id: 'tools' as const, label: t.farmPlan, icon: ListChecks },
    { id: 'commerce' as const, label: commerceLabel, icon: Store },
    { id: 'devices' as const, label: deviceLabel, icon: ShieldCheck },
  ];
  const secondaryIds: TabId[] = ['tools', 'commerce', 'devices'];
  const secondaryItems = items.filter((item) => secondaryIds.includes(item.id));
  const chooseTab = (tab: TabId) => {
    setMoreOpen(false);
    onChange(tab);
  };

  return (
    <nav className="app-navigation" aria-label="Primary navigation">
      <div className="app-navigation-surface">
        <button
          type="button"
          onClick={() => chooseTab('home')}
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
            const secondary = secondaryIds.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => chooseTab(id)}
                className={'app-nav-item' + (secondary ? ' app-nav-secondary' : '')}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                data-tooltip={label}
              >
                <span className="app-nav-icon"><Icon className="h-5 w-5" /></span>
                <span className="app-nav-label">{label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((current) => !current)}
            className="app-nav-item app-nav-more"
            aria-current={secondaryIds.includes(activeTab) ? 'page' : undefined}
            aria-expanded={moreOpen}
            aria-label={moreLabel}
          >
            <span className="app-nav-icon"><MoreHorizontal className="h-5 w-5" /></span>
            <span className="app-nav-label">{moreLabel}</span>
          </button>
          {moreOpen && (
            <div className="app-nav-more-menu" role="menu">
              {secondaryItems.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => chooseTab(id)} role="menuitem">
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                  {activeTab === id && <span className="app-nav-menu-active" />}
                </button>
              ))}
            </div>
          )}
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
