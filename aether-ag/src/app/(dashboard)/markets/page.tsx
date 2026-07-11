'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, BarChart3, Calendar, Truck,
  CheckCircle, AlertTriangle, Star, ArrowRight, DollarSign, Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DEMO_HARVEST_SCENARIOS } from '@/lib/demo-seed';

const PRICE_TREND_DATA = [
  { date: 'Jul 1', price: 16.5, volume: 820 },
  { date: 'Jul 3', price: 17.2, volume: 780 },
  { date: 'Jul 5', price: 17.8, volume: 750 },
  { date: 'Jul 7', price: 18.5, volume: 710 },
  { date: 'Jul 9', price: 19.2, volume: 690 },
  { date: 'Jul 11', price: 19.8, volume: 660 },
  { date: 'Today', price: 21.5, volume: 640 },
  { date: '+3d', price: 22.5, volume: 620, forecast: true },
  { date: '+5d', price: 23.2, volume: 600, forecast: true },
  { date: '+7d', price: 20.8, volume: 750, forecast: true },
  { date: '+10d', price: 18.2, volume: 900, forecast: true },
  { date: '+14d', price: 16.5, volume: 1100, forecast: true },
];

const CHANNEL_DATA = DEMO_HARVEST_SCENARIOS.map(s => ({
  name: s.label,
  revenue: Math.round(s.estimatedNetRevenue / 1000),
  risk: s.weatherRisk === 'low' ? 20 : s.weatherRisk === 'medium' ? 50 : 80,
  confidence: s.confidence,
  recommended: s.recommended,
}));

const RISK_COLOR = { low: '#34D399', medium: '#F59E0B', high: '#EF4444' };

export default function MarketsPage() {
  const [selectedScenario, setSelectedScenario] = useState<string>('h-coop');

  const selected = DEMO_HARVEST_SCENARIOS.find(s => s.id === selectedScenario)!;
  const current = DEMO_HARVEST_SCENARIOS.find(s => s.id === 'h-now')!;
  const uplift = selected.estimatedNetRevenue - current.estimatedNetRevenue;

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="section-label mb-1">MARKET INTELLIGENCE</div>
        <h1 className="text-2xl font-inter font-bold text-white">Supply Chain & Profitability</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Harvest scenario analysis · Simulated APMC market data · Last updated just now
        </p>
        <div className="mt-2"><span className="simulated-badge">⚡ Simulated market information — for demonstration only</span></div>
      </div>

      {/* Price trend chart */}
      <div className="aether-card mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="section-label text-[10px] mb-1">TOMATO PRICE TREND — NASHIK APMC</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-inter gold-text">₹21.50/kg</span>
              <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#34D399' }}>
                <TrendingUp className="w-4 h-4" />+12% (5-day)
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Supply Surge Risk</div>
            <div className="font-bold" style={{ color: '#F59E0B' }}>+14 days</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Pune competitor supply</div>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PRICE_TREND_DATA}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis dataKey="date" tick={{ fill: '#484F58', fontSize: 10 }} />
              <YAxis tick={{ fill: '#484F58', fontSize: 10 }} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 8 }} labelStyle={{ color: '#8B949E' }} itemStyle={{ color: '#C9A84C' }} formatter={(v: any) => [`₹${v}/kg`, 'Price']} />
              <Area type="monotone" dataKey="price" stroke="#C9A84C" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-muted)' }}>Dotted region = forecast. Simulated data for prototype demonstration.</p>
      </div>

      {/* Scenario comparison */}
      <div className="mb-5">
        <div className="section-label mb-3">HARVEST SCENARIO COMPARISON</div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {DEMO_HARVEST_SCENARIOS.map(scenario => (
            <motion.button key={scenario.id} onClick={() => setSelectedScenario(scenario.id)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`aether-card text-left transition-all cursor-pointer ${
                selectedScenario === scenario.id ? 'border-[rgba(201,168,76,0.5)]' : ''
              }`}
              style={selectedScenario === scenario.id ? { borderColor: 'rgba(201,168,76,0.5)', background: 'rgba(201,168,76,0.05)' } : {}}>
              {scenario.recommended && (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3" style={{ color: 'var(--gold)' }} />
                  <span className="text-[10px] font-bold" style={{ color: 'var(--gold)' }}>RECOMMENDED</span>
                </div>
              )}
              <div className="font-semibold text-sm text-white mb-1">{scenario.label}</div>
              <div className="text-xl font-black font-inter mb-1" style={{ color: scenario.recommended ? '#34D399' : 'var(--text-primary)' }}>
                ₹{(scenario.estimatedNetRevenue / 1000).toFixed(0)}k
              </div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Net ₹{scenario.estimatedPricePerKg}/kg · {scenario.estimatedYieldTons}t</div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: RISK_COLOR[scenario.weatherRisk] }} />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{scenario.weatherRisk} weather risk</span>
              </div>
              <div className="mt-1">
                <div className="h-1 rounded-full" style={{ background: '#21262D' }}>
                  <div className="h-full rounded-full" style={{ width: `${scenario.confidence}%`, background: scenario.recommended ? '#34D399' : '#C9A84C' }} />
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{scenario.confidence}% confidence</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected scenario detail */}
      {selected && (
        <motion.div key={selectedScenario} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="aether-card mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-label text-[10px] mb-1">SELECTED SCENARIO</div>
              <h3 className="font-bold text-white text-lg">{selected.label}</h3>
            </div>
            {selected.recommended && <Star className="w-6 h-6" style={{ color: 'var(--gold)' }} />}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Gross Revenue', value: `₹${(selected.estimatedGrossRevenue / 1000).toFixed(0)}k`, color: '#34D399' },
              { label: 'Logistics', value: `-₹${(selected.logisticsCost / 1000).toFixed(0)}k`, color: '#EF4444' },
              { label: 'Storage', value: `-₹${(selected.storageCost / 1000).toFixed(0)}k`, color: '#EF4444' },
              { label: 'Net Realisation', value: `₹${(selected.estimatedNetRevenue / 1000).toFixed(0)}k`, color: 'var(--gold)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg p-3" style={{ background: '#0D1117', border: '1px solid #21262D' }}>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                <div className="text-lg font-black font-inter" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>
          {uplift > 0 && (
            <div className="rounded-lg p-3" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)' }}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">+₹{(uplift / 1000).toFixed(0)}k more than harvesting today</span>
              </div>
            </div>
          )}
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            {selected.marketOpportunity}. Confidence: {selected.confidence}%. Weather risk: {selected.weatherRisk}.
          </p>
        </motion.div>
      )}

      {/* Revenue comparison chart */}
      <div className="aether-card">
        <div className="section-label text-[10px] mb-4">NET REVENUE BY SCENARIO (₹000)</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHANNEL_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis dataKey="name" tick={{ fill: '#484F58', fontSize: 9 }} />
              <YAxis tick={{ fill: '#484F58', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 8 }} itemStyle={{ color: '#C9A84C' }} formatter={(v: any) => [`₹${v}k`, 'Net Revenue']} />
              <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
