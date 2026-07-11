'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu, MapPin, Leaf, Droplets, Calendar, BarChart3,
  TrendingUp, AlertCircle, CheckCircle, Clock, Activity,
  Database, Shield, Zap, ArrowRight, Star, Globe
} from 'lucide-react';
import { useFarmStore } from '@/store/farmStore';
import { DEMO_COUNTRY_PACKS } from '@/lib/demo-seed';

const STAGE_COLORS: Record<string, string> = {
  germination: '#8B5CF6', seedling: '#06B6D4', vegetative: '#10B981',
  flowering: '#F59E0B', fruiting: '#EF4444', ripening: '#F97316', harvest: '#C9A84C',
};

const EVENT_ICONS: Record<string, React.ComponentType<any>> = {
  observation: Activity, resolution: CheckCircle, treatment: Shield,
  irrigation: Droplets, drone_mission: Zap, weather_event: AlertCircle,
  market_action: TrendingUp, verification: BarChart3, ai_recommendation: Cpu,
};

export default function FarmTwinPage() {
  const { farmTwin, selectedCountry, setSelectedCountry } = useFarmStore();
  const [tab, setTab] = useState<'overview' | 'history' | 'timeline' | 'data'>('overview');
  const pack = DEMO_COUNTRY_PACKS.find(p => p.code === selectedCountry) ?? DEMO_COUNTRY_PACKS[0];

  const crop = farmTwin.cropCycles[0];
  const field = farmTwin.fields[0];

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <div className="section-label mb-1">FARM DIGITAL TWIN</div>
          <h1 className="text-2xl font-inter font-bold text-white">{farmTwin.farmName}</h1>
          <p className="text-sm flex items-center gap-2 mt-1" style={{ color: 'var(--text-muted)' }}>
            <MapPin className="w-3.5 h-3.5" />{farmTwin.region} · {farmTwin.farmSizeHectares} hectares
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Data Quality</div>
            <div className="text-lg font-bold gold-text">{farmTwin.dataQualityScore}%</div>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0F5132, #C9A84C)', border: '2px solid rgba(201,168,76,0.3)' }}>
            <Cpu className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Country Pack Selector */}
      <div className="aether-card p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          <span className="section-label text-[10px]">GLOBAL OPERATING MODE</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_COUNTRY_PACKS.map(p => (
            <button key={p.code} onClick={() => setSelectedCountry(p.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCountry === p.code
                  ? 'bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.35)] text-white'
                  : 'border border-[#30363D] text-gray-400 hover:border-[#484F58]'
              }`}>
              <span>{p.flag}</span> {p.name}
            </button>
          ))}
        </div>
        {selectedCountry && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Currency', value: pack.currency },
              { label: 'Area Unit', value: pack.areaUnit },
              { label: 'Language', value: pack.language },
              { label: 'Market Source', value: pack.marketConnectors[0] },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg p-2" style={{ background: '#0D1117' }}>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                <div className="text-xs font-medium text-white">{value}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: '#161B22', border: '1px solid #30363D' }}>
        {(['overview', 'history', 'timeline', 'data'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
              tab === t ? 'bg-[rgba(201,168,76,0.15)] text-white border border-[rgba(201,168,76,0.25)]' : 'text-gray-400 hover:text-white'
            }`}>
            {t === 'data' ? 'Data Model' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Crop status */}
          {crop && (
            <div className="aether-card">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                <span className="section-label text-[10px]">ACTIVE CROP</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Crop</div>
                  <div className="font-bold text-white">{crop.cropName}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{crop.cropVariety}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Stage</div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: `${STAGE_COLORS[crop.cropStage]}20`, color: STAGE_COLORS[crop.cropStage], border: `1px solid ${STAGE_COLORS[crop.cropStage]}40` }}>
                    {crop.cropStage.charAt(0).toUpperCase() + crop.cropStage.slice(1)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Sown</div>
                  <div className="text-sm text-white">{new Date(crop.sowingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Harvest Est.</div>
                  <div className="text-sm text-white">{new Date(crop.expectedHarvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                </div>
              </div>
            </div>
          )}

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farmTwin.fields.map(f => (
              <div key={f.id} className="aether-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                    <span className="font-semibold text-white">{f.name}</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--gold)' }}>{f.areaHectares} ha</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Soil', value: f.soilCharacteristics.type },
                    { label: 'pH', value: f.soilCharacteristics.ph.toString() },
                    { label: 'Irrigation', value: f.irrigationMethod },
                    { label: 'Water Source', value: f.waterSource },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded p-2" style={{ background: '#0D1117' }}>
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</div>
                      <div className="text-xs font-medium text-white capitalize">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Farmer profile */}
          <div className="aether-card">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4" style={{ color: 'var(--gold)' }} />
              <span className="section-label text-[10px]">FARMER PROFILE</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Farmer', value: farmTwin.farmerName },
                { label: 'Country', value: farmTwin.country },
                { label: 'Region', value: farmTwin.region },
                { label: 'Farm Mode', value: farmTwin.farmMode.replace('_', ' ').toUpperCase() },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                  <div className="text-sm font-medium text-white capitalize">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          <div className="aether-card">
            <div className="section-label text-[10px] mb-4">YIELD HISTORY</div>
            <div className="space-y-3">
              {farmTwin.historicalYield.map(record => (
                <div key={record.year} className="flex items-center justify-between py-3 border-b border-[#21262D] last:border-0">
                  <div>
                    <div className="font-semibold text-white">{record.year} · {record.cropName}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{record.fieldId.replace('-', ' ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: '#34D399' }}>{record.yieldTons}t</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>₹{(record.netRevenue / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="aether-card">
            <div className="section-label text-[10px] mb-4">PEST & DISEASE INCIDENTS</div>
            {farmTwin.pestIncidents.map(inc => (
              <div key={inc.id} className="flex items-start gap-3 py-3 border-b border-[#21262D] last:border-0">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: inc.severity === 'high' ? '#EF4444' : '#F59E0B' }} />
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">{inc.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(inc.date).toLocaleDateString()} · {inc.type}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Treatment: {inc.treatmentApplied}</div>
                  <div className="text-xs" style={{ color: '#34D399' }}>Outcome: {inc.outcome}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="space-y-3">
          {farmTwin.activityTimeline.map((event, i) => {
            const Icon = EVENT_ICONS[event.type] ?? Activity;
            return (
              <motion.div key={event.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#21262D', border: '1px solid #30363D' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                  </div>
                  {i < farmTwin.activityTimeline.length - 1 && <div className="w-px h-8 mt-1" style={{ background: '#21262D' }} />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">{event.title}</span>
                    <span className="simulated-badge">{event.dataSource}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{new Date(event.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
              </motion.div>
            );
          })}
          {farmTwin.activityTimeline.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No events yet. Approve a resolution to add to the timeline.</div>
          )}
        </div>
      )}

      {tab === 'data' && (
        <div className="aether-card">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            <span className="section-label text-[10px]">DATA MODEL — 26 FIRESTORE COLLECTIONS</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['users', 'organisations', 'farms', 'fields', 'crop_cycles', 'farm_twins', 'observations', 'satellite_observations', 'drone_missions', 'drone_telemetry', 'crop_scans', 'diagnoses', 'weather_forecasts', 'climate_risks', 'soil_readings', 'irrigation_actions', 'market_prices', 'harvest_scenarios', 'resolution_cards', 'approvals', 'farm_tasks', 'treatment_followups', 'outcome_verifications', 'activity_timeline', 'country_packs', 'chat_sessions', 'research_experiments', 'consent_records'].map(col => (
              <div key={col} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#0D1117', border: '1px solid #21262D' }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--gold)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{col}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
