'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  MapPin, Activity, Droplets, Leaf, BarChart3, Satellite,
  Wind, Thermometer, Eye, ChevronRight, Zap
} from 'lucide-react';
import { useFarmStore } from '@/store/farmStore';
import { DEMO_CLIMATE_RISKS } from '@/lib/demo-seed';

// Leaflet must be dynamically imported (no SSR)
const FieldMap = dynamic(() => import('@/components/FieldMap'), { ssr: false, loading: () => (
  <div className="h-80 rounded-xl flex items-center justify-center" style={{ background: '#161B22', border: '1px solid #30363D' }}>
    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading field map...</div>
  </div>
)});

const SATELLITE_LAYERS = [
  { id: 'ndvi', label: 'NDVI — Vegetation Index', color: '#0F5132', desc: 'Normalised Difference Vegetation Index' },
  { id: 'moisture', label: 'Soil Moisture', color: '#2D7DD2', desc: 'Estimated soil water content' },
  { id: 'stress', label: 'Crop Stress', color: '#D97706', desc: 'Thermal and canopy stress indicators' },
];

export default function FieldsPage() {
  const { farmTwin } = useFarmStore();
  const [selectedField, setSelectedField] = useState(farmTwin.fields[0]);
  const [activeLayer, setActiveLayer] = useState('ndvi');

  const fieldObs = farmTwin.observations.filter(o => o.fieldId === selectedField.id);
  const latestNDVI = fieldObs.find(o => o.ndviValue)?.ndviValue ?? 0.61;
  const stressLevel = fieldObs.find(o => o.stressLevel)?.stressLevel ?? 'low';

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="section-label mb-1">FIELD INTELLIGENCE</div>
        <h1 className="text-2xl font-inter font-bold text-white">Field Map & Zone Analysis</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Satellite · Drone · Soil intelligence · Simulated geospatial data</p>
      </div>

      {/* Field selector */}
      <div className="flex gap-3 mb-4">
        {farmTwin.fields.map(field => (
          <button key={field.id} onClick={() => setSelectedField(field)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              selectedField.id === field.id
                ? 'text-white border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.08)]'
                : 'text-gray-400 border-[#30363D] hover:border-[#484F58]'
            }`}>
            <MapPin className="w-3.5 h-3.5 inline mr-1.5" />{field.name} · {field.areaHectares}ha
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="mb-4">
        <FieldMap
          fields={farmTwin.fields}
          selectedFieldId={selectedField.id}
          activeLayer={activeLayer}
        />
      </div>

      {/* Layer selector */}
      <div className="flex gap-2 mb-5">
        {SATELLITE_LAYERS.map(layer => (
          <button key={layer.id} onClick={() => setActiveLayer(layer.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
              activeLayer === layer.id
                ? 'text-white'
                : 'text-gray-400 border-[#30363D]'
            }`}
            style={activeLayer === layer.id ? { borderColor: layer.color, background: `${layer.color}15`, color: layer.color } : {}}>
            <div className="w-2 h-2 rounded-full" style={{ background: layer.color }} />
            {layer.label}
          </button>
        ))}
        <span className="ml-auto simulated-badge self-center">⚡ Simulated layer</span>
      </div>

      {/* Field metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'NDVI', value: latestNDVI.toFixed(2), desc: 'Vegetation Index', color: latestNDVI > 0.6 ? '#34D399' : latestNDVI > 0.4 ? '#F59E0B' : '#EF4444', icon: Leaf },
          { label: 'Crop Stress', value: stressLevel.toUpperCase(), desc: 'Current level', color: stressLevel === 'none' ? '#34D399' : stressLevel === 'low' ? '#F59E0B' : '#EF4444', icon: Activity },
          { label: 'Soil Moisture', value: '78%', desc: 'Field capacity', color: '#60A5FA', icon: Droplets },
          { label: 'Satellite Pass', value: '6h ago', desc: 'Last observation', color: 'var(--gold)', icon: Satellite },
        ].map(({ label, value, desc, color, icon: Icon }) => (
          <div key={label} className="aether-card p-4">
            <Icon className="w-4 h-4 mb-2" style={{ color }} />
            <div className="text-lg font-black font-inter" style={{ color }}>{value}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Observations */}
      <div className="aether-card mb-5">
        <div className="section-label text-[10px] mb-4">THREE-LEVEL OBSERVATION SYSTEM</div>
        <div className="space-y-3">
          {[
            { level: 'LEVEL 1 — SATELLITE', icon: Satellite, color: '#2D7DD2', status: 'Mild stress in NE quadrant', ndvi: '0.61', time: '6 hours ago', source: 'simulated' },
            { level: 'LEVEL 2 — DRONE', icon: Eye, color: '#C9A84C', status: 'Localised yellowing rows 7–9', ndvi: '0.58', time: '1 day ago', source: 'simulated' },
            { level: 'LEVEL 3 — GROUND', icon: Leaf, color: '#0F5132', status: 'Early Blight indicators on lower leaves', ndvi: '—', time: 'Upload to diagnose', source: 'pending' },
          ].map(({ level, icon: Icon, color, status, ndvi, time, source }) => (
            <div key={level} className="flex items-start gap-3 py-3 border-b border-[#21262D] last:border-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold tracking-widest" style={{ color }}>{level}</span>
                  {source === 'simulated' ? <span className="simulated-badge">Simulated</span> : <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#21262D] text-gray-500">Awaiting</span>}
                </div>
                <div className="text-sm font-medium text-white">{status}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{ndvi !== '—' ? `NDVI: ${ndvi} · ` : ''}{time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Climate risks for this field */}
      <div>
        <div className="section-label mb-3">ACTIVE CLIMATE RISKS — {selectedField.name.toUpperCase()}</div>
        <div className="space-y-3">
          {DEMO_CLIMATE_RISKS.filter(r => r.fieldId === selectedField.id).map(risk => (
            <div key={risk.id} className="aether-card p-4" style={{ borderLeft: `3px solid ${risk.riskLevel === 'critical' ? '#DC2626' : risk.riskLevel === 'high' ? '#D97706' : '#2D7DD2'}` }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-sm text-white mb-1">{risk.title}</div>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{risk.description}</p>
                  <div className="text-xs font-semibold" style={{ color: '#34D399' }}>{risk.recommendedAction}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-black font-inter" style={{ color: risk.riskLevel === 'critical' ? '#EF4444' : risk.riskLevel === 'high' ? '#F59E0B' : '#60A5FA' }}>{risk.confidence}%</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>confidence</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
