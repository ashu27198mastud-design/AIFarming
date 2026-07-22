import { describe, expect, it } from 'vitest';
import { dashboardLocationFromPath, dashboardPath } from './dashboard-navigation';

describe('dashboard navigation', () => {
  it.each([
    ['home', '/dashboard'],
    ['weather', '/dashboard/weather'],
    ['mandi', '/dashboard/markets'],
    ['farm', '/dashboard/farm'],
    ['tools', '/dashboard/planner'],
    ['commerce', '/dashboard/sell'],
  ] as const)('creates a stable URL for %s', (tab, path) => {
    expect(dashboardPath(tab)).toBe(path);
  });

  it('keeps the selected smart device in the URL', () => {
    expect(dashboardPath('devices', 'spraylock')).toBe('/dashboard/devices/spraylock');
    expect(dashboardPath('devices', 'drone')).toBe('/dashboard/devices/drone');
  });

  it.each([
    ['/dashboard', 'home', 'drone'],
    ['/dashboard/weather', 'weather', 'drone'],
    ['/dashboard/markets', 'mandi', 'drone'],
    ['/dashboard/planner', 'tools', 'drone'],
    ['/dashboard/sell', 'commerce', 'drone'],
    ['/dashboard/devices/spraylock', 'devices', 'spraylock'],
    ['/dashboard/devices/drone', 'devices', 'drone'],
  ] as const)('restores %s', (path, tab, device) => {
    expect(dashboardLocationFromPath(path)).toEqual({ tab, device });
  });
});
