'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Leaf, Map, Settings2, TrendingUp,
  MessageCircle, Satellite, Cpu, Menu, X, Bell, ChevronRight
} from 'lucide-react';
import { useFarmStore } from '@/store/farmStore';

const NAV_ITEMS = [
  { href: '/stream', label: 'Stream', icon: LayoutDashboard, desc: 'Aether Stream' },
  { href: '/twin', label: 'Farm Twin', icon: Cpu, desc: 'Digital Farm Profile' },
  { href: '/fields', label: 'Fields', icon: Map, desc: 'Field Map & Zones' },
  { href: '/operations', label: 'Operations', icon: Settings2, desc: 'Drone & Irrigation' },
  { href: '/markets', label: 'Markets', icon: TrendingUp, desc: 'Supply Chain & Profit' },
  { href: '/aether', label: 'Aether', icon: MessageCircle, desc: 'AI Assistant & Lab' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { farmTwin, streamCards } = useFarmStore();
  const activeAlerts = streamCards.filter(c => !c.dismissed && c.priority === 'critical').length;

  return (
    <div className="flex h-screen bg-[#0D1117] overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 md:relative md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ background: '#0D1117', borderRight: '1px solid #21262D' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#21262D]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0F5132, #C9A84C)' }}>
            <Satellite className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-inter font-black text-sm text-white tracking-wider">AETHER AG</div>
            <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>Agriculture Intel OS</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Farm info */}
        <div className="px-4 py-3 mx-3 my-3 rounded-lg" style={{ background: 'rgba(15, 81, 50, 0.12)', border: '1px solid rgba(15, 81, 50, 0.25)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="pulse-dot-green"></span>
            <span className="text-xs font-semibold text-white">{farmTwin.farmerName}</span>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{farmTwin.farmName}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{farmTwin.region} · {farmTwin.farmSizeHectares}ha</div>
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, desc }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <button key={href} onClick={() => { router.push(href); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  active ? 'bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)]' : 'hover:bg-[rgba(255,255,255,0.04)]'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? 'var(--gold)' : 'var(--text-muted)' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: active ? 'white' : 'var(--text-secondary)' }}>{label}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                </div>
                {active && <ChevronRight className="w-3 h-3" style={{ color: 'var(--gold)' }} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="aether-card p-3 text-center">
            <div className="simulated-badge mx-auto mb-1">⚡ Demo Mode</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>All features functional</div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#21262D] flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-[#161B22]">
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-white">
              {NAV_ITEMS.find(n => pathname.startsWith(n.href))?.desc ?? 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {activeAlerts > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#EF4444' }}>
                <Bell className="w-3 h-3" />
                {activeAlerts} Critical
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(15, 81, 50, 0.12)', border: '1px solid rgba(15, 81, 50, 0.25)' }}>
              <Leaf className="w-3 h-3" style={{ color: '#34D399' }} />
              <span className="text-xs font-medium text-white">{farmTwin.cropCycles[0]?.cropName} · {farmTwin.cropCycles[0]?.cropStage}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="h-full">
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-[#21262D]" style={{ background: 'rgba(13, 17, 23, 0.95)', backdropFilter: 'blur(16px)' }}>
        <div className="flex">
          {NAV_ITEMS.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <button key={href} onClick={() => router.push(href)} className="flex-1 flex flex-col items-center py-2 gap-0.5">
                <Icon className="w-5 h-5" style={{ color: active ? 'var(--gold)' : 'var(--text-muted)' }} />
                <span className="text-[10px]" style={{ color: active ? 'var(--gold)' : 'var(--text-muted)' }}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
