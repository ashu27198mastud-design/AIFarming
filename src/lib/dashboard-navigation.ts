export type DashboardTabId = 'home' | 'weather' | 'mandi' | 'farm' | 'tools' | 'commerce' | 'devices';
export type DeviceId = 'spraylock' | 'drone';

export type DashboardLocation = {
  tab: DashboardTabId;
  device: DeviceId;
};

const TAB_PATHS: Record<Exclude<DashboardTabId, 'devices'>, string> = {
  home: '/dashboard',
  weather: '/dashboard/weather',
  mandi: '/dashboard/markets',
  farm: '/dashboard/farm',
  tools: '/dashboard/planner',
  commerce: '/dashboard/sell',
};

export function dashboardPath(tab: DashboardTabId, device: DeviceId = 'drone'): string {
  if (tab === 'devices') return `/dashboard/devices/${device}`;
  return TAB_PATHS[tab];
}

export function dashboardLocationFromPath(pathname: string): DashboardLocation {
  const parts = pathname.split('/').filter(Boolean);
  const section = parts[1] || '';

  if (section === 'weather') return { tab: 'weather', device: 'drone' };
  if (section === 'markets' || section === 'mandi') return { tab: 'mandi', device: 'drone' };
  if (section === 'farm') return { tab: 'farm', device: 'drone' };
  if (section === 'planner' || section === 'tools') return { tab: 'tools', device: 'drone' };
  if (section === 'sell' || section === 'commerce') return { tab: 'commerce', device: 'drone' };
  if (section === 'devices') {
    return { tab: 'devices', device: parts[2] === 'spraylock' ? 'spraylock' : 'drone' };
  }

  return { tab: 'home', device: 'drone' };
}
