'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Droplets, Plane, Battery, Wind, CheckCircle, AlertTriangle,
  Play, Square, RotateCcw, Shield, Gauge, Navigation, Eye,
  MapPin, Clock, Activity, ChevronRight, X, ArrowRight
} from 'lucide-react';
import { useFarmStore } from '@/store/farmStore';

const MODE_CONFIG = {
  advisory: { label: 'Advisory Mode', desc: 'Receive recommendations only', color: '#2D7DD2' },
  approval: { label: 'Approval Mode', desc: 'Approve each irrigation action', color: '#C9A84C' },
  automation: { label: 'Automation Mode', desc: 'Auto-activate within safety limits', color: '#059669' },
};

const DRONE_WAYPOINTS = [
  { lat: 20.010, lng: 73.780, label: 'Start' },
  { lat: 20.013, lng: 73.785, label: 'Row A' },
  { lat: 20.016, lng: 73.780, label: 'Row B' },
  { lat: 20.018, lng: 73.785, label: 'Row C' },
  { lat: 20.016, lng: 73.790, label: 'Row D' },
  { lat: 20.013, lng: 73.790, label: 'Return' },
];

function IrrigationPanel() {
  const { irrigationStatus, irrigationMode, pauseIrrigation, resumeIrrigation, setIrrigationMode, addTimelineEvent, farmTwin } = useFarmStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'pause' | 'resume' | null>(null);
  const [justActed, setJustActed] = useState(false);

  const handleAction = (action: 'pause' | 'resume') => {
    setPendingAction(action);
    setShowConfirm(true);
  };

  const confirmAction = () => {
    if (pendingAction === 'pause') {
      pauseIrrigation();
      addTimelineEvent({
        id: `irr-${Date.now()}`,
        farmId: farmTwin.farmId,
        fieldId: 'field-north',
        timestamp: new Date().toISOString(),
        type: 'irrigation',
        title: 'Irrigation paused',
        description: 'Scheduled irrigation paused — soil moisture above optimal + rain forecast.',
        dataSource: 'live',
      });
    } else {
      resumeIrrigation();
    }
    setShowConfirm(false);
    setJustActed(true);
    setTimeout(() => setJustActed(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="aether-card">
        <div className="section-label text-[10px] mb-3">IRRIGATION CONTROL MODE</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.entries(MODE_CONFIG) as [keyof typeof MODE_CONFIG, typeof MODE_CONFIG[keyof typeof MODE_CONFIG]][]).map(([mode, cfg]) => (
            <button key={mode} onClick={() => setIrrigationMode(mode)}
              className={`p-3 rounded-xl text-left transition-all border ${
                irrigationMode === mode
                  ? `border-[${cfg.color}] bg-[${cfg.color}10]`
                  : 'border-[#30363D] hover:border-[#484F58]'
              }`}
              style={irrigationMode === mode ? { borderColor: cfg.color, background: `${cfg.color}15` } : {}}>
              <div className="text-xs font-bold mb-1" style={{ color: irrigationMode === mode ? cfg.color : 'var(--text-secondary)' }}>{cfg.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{cfg.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Status card */}
      <div className="aether-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="section-label text-[10px] mb-1">NORTH FIELD — DRIP IRRIGATION</div>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${irrigationStatus === 'active' ? 'bg-emerald-400 animate-pulse' : irrigationStatus === 'paused' ? 'bg-amber-400' : 'bg-gray-500'}`} />
              <span className="font-semibold text-white capitalize">{irrigationStatus}</span>
            </div>
          </div>
          <Droplets className="w-8 h-8" style={{ color: irrigationStatus === 'active' ? '#60A5FA' : '#484F58' }} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Water Quantity', value: '2,400 L', icon: Droplets },
            { label: 'Duration', value: '45 min', icon: Clock },
            { label: 'Soil Moisture', value: '78%', icon: Gauge },
            { label: 'Rain Forecast', value: '34mm', icon: Wind },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg p-3" style={{ background: '#0D1117', border: '1px solid #21262D' }}>
              <Icon className="w-3.5 h-3.5 mb-1" style={{ color: 'var(--atm-blue-bright)' }} />
              <div className="text-sm font-bold text-white">{value}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg p-3 mb-4" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)' }}>
          <div className="text-xs font-semibold mb-1" style={{ color: '#F59E0B' }}>Reason for recommended pause</div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Soil moisture at 78% field capacity (optimal: 65%). 34mm rainfall forecast within 18 hours. Irrigation would cause waterlogging and root stress at flowering stage.</p>
        </div>

        {justActed && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)' }}>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Action applied — Farm Twin updated</span>
          </motion.div>
        )}

        <div className="flex gap-3">
          {irrigationStatus !== 'paused' ? (
            <button onClick={() => handleAction('pause')} className="btn-danger flex items-center gap-2">
              <Square className="w-4 h-4" /> Pause Irrigation
            </button>
          ) : (
            <button onClick={() => handleAction('resume')} className="btn-primary flex items-center gap-2">
              <Play className="w-4 h-4" /> Resume Irrigation
            </button>
          )}
          <button className="btn-secondary flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Manual Override
          </button>
        </div>

        {/* Safety note */}
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          ⚠️ Simulated irrigation control. In production, this connects to smart valve hardware via MQTT.
        </p>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="aether-card max-w-sm w-full p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                <span className="font-semibold text-white">Confirm Action</span>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {pendingAction === 'pause'
                  ? 'Pause irrigation for North Field. The scheduled cycle will be suspended until manually resumed or soil moisture drops below 60%.'
                  : 'Resume irrigation for North Field.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={confirmAction} className="btn-primary flex-1">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DronePanel() {
  const { droneMission, droneProgress, droneStatus, startDroneMission, updateDroneProgress, completeDroneMission, farmTwin } = useFarmStore();
  const [step, setStep] = useState<'idle' | 'review' | 'safety' | 'flying' | 'complete'>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startMission = () => {
    startDroneMission();
    setStep('flying');
    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += 2;
      updateDroneProgress(progress);
      if (progress >= 100) {
        clearInterval(intervalRef.current!);
        completeDroneMission();
        setStep('complete');
      }
    }, 120);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="rounded-lg px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(45,125,210,0.08)', border: '1px solid rgba(45,125,210,0.2)' }}>
        <Activity className="w-4 h-4 flex-shrink-0" style={{ color: '#60A5FA' }} />
        <span className="text-xs" style={{ color: '#93C5FD' }}>Simulated drone telemetry for prototype demonstration. All flight data is simulated.</span>
      </div>

      {/* Drone status */}
      <div className="aether-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="section-label text-[10px] mb-1">AUTONOMOUS AERIAL OPERATIONS CORE</div>
            <div className="font-semibold text-white">Drone — Unit AG-01</div>
          </div>
          <motion.div animate={{ y: step === 'flying' ? [0, -4, 0] : 0 }} transition={{ repeat: Infinity, duration: 2 }}>
            <Plane className={`w-8 h-8 ${step === 'flying' ? 'text-emerald-400' : 'text-gray-500'}`} />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Battery', value: `${Math.max(94 - Math.floor(droneProgress * 0.3), 70)}%`, icon: Battery, color: '#34D399' },
            { label: 'Altitude', value: '30m', icon: Navigation, color: '#60A5FA' },
            { label: 'Coverage', value: `${droneProgress}%`, icon: Eye, color: 'var(--gold)' },
            { label: 'Status', value: step === 'flying' ? 'Flying' : step === 'complete' ? 'Complete' : 'Ready', icon: Activity, color: step === 'flying' ? '#34D399' : step === 'complete' ? 'var(--gold)' : '#484F58' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-lg p-3" style={{ background: '#0D1117', border: '1px solid #21262D' }}>
              <Icon className="w-3.5 h-3.5 mb-1" style={{ color }} />
              <div className="text-sm font-bold" style={{ color }}>{value}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {(step === 'flying' || step === 'complete') && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Mission progress</span>
              <span className="text-xs font-mono" style={{ color: 'var(--gold)' }}>{droneProgress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#21262D' }}>
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #0F5132, #C9A84C)' }}
                animate={{ width: `${droneProgress}%` }} transition={{ duration: 0.1 }} />
            </div>
          </div>
        )}

        {/* Waypoints */}
        <div className="mb-4">
          <div className="section-label text-[10px] mb-2">FLIGHT PATH — NORTH FIELD</div>
          <div className="flex flex-wrap gap-2">
            {DRONE_WAYPOINTS.map((wp, i) => {
              const reached = droneProgress > (i / DRONE_WAYPOINTS.length) * 100;
              return (
                <div key={wp.label} className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                    style={{ background: reached ? 'rgba(15,81,50,0.3)' : '#21262D', color: reached ? '#34D399' : 'var(--text-muted)', border: `1px solid ${reached ? 'rgba(52,211,153,0.3)' : '#30363D'}` }}>
                    {i + 1}
                  </div>
                  <span className="text-[10px]" style={{ color: reached ? '#34D399' : 'var(--text-muted)' }}>{wp.label}</span>
                  {i < DRONE_WAYPOINTS.length - 1 && <ArrowRight className="w-3 h-3" style={{ color: '#30363D' }} />}
                </div>
              );
            })}
          </div>
        </div>

        {step === 'idle' && (
          <button onClick={() => setStep('review')} className="btn-primary flex items-center gap-2">
            <Plane className="w-4 h-4" /> Deploy Drone Inspection
          </button>
        )}
        {step === 'review' && (
          <div className="space-y-3">
            <div className="rounded-lg p-3" style={{ background: 'rgba(15,81,50,0.08)', border: '1px solid rgba(15,81,50,0.2)' }}>
              <div className="section-label text-[10px] mb-2">PRE-FLIGHT CHECKS</div>
              <div className="space-y-1.5">
                {['Battery: 94% ✓', 'Wind speed: 8 km/h ✓ (safe <20)', 'No active no-fly zones ✓', 'Weather suitable ✓', 'Field boundary loaded ✓'].map(check => (
                  <div key={check} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" /> {check}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('idle')} className="btn-secondary flex-1">Cancel</button>
              <button onClick={startMission} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Play className="w-4 h-4" /> Approve & Launch
              </button>
            </div>
          </div>
        )}
        {step === 'flying' && (
          <button className="btn-danger flex items-center gap-2">
            <Square className="w-4 h-4" /> Emergency Return
          </button>
        )}
        {step === 'complete' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-lg p-4 mb-3" style={{ background: 'rgba(15,81,50,0.1)', border: '1px solid rgba(15,81,50,0.3)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Mission Complete</span>
              </div>
              <div className="section-label text-[10px] mb-2">OBSERVATIONS GENERATED</div>
              <ul className="space-y-1">
                {['Localised stress zone identified in rows 7–9 (NE quadrant)', 'NDVI drop: 0.61 → 0.52 in affected area', 'Fungal pressure confirmed — matches Resolution Card res-001', 'Healthy canopy maintained in 85% of field area', 'Moisture anomaly detected near irrigation joint (row 12)'].map(obs => (
                  <li key={obs} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-emerald-400 flex-shrink-0">·</span>{obs}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => setStep('idle')} className="btn-secondary">Start New Mission</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function OperationsPage() {
  const [tab, setTab] = useState<'irrigation' | 'drone' | 'tasks'>('drone');

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="section-label mb-1">FARM OPERATIONS</div>
        <h1 className="text-2xl font-inter font-bold text-white">Operational Control Centre</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Irrigation · Autonomous Aerial Operations · Task Management</p>
      </div>

      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: '#161B22', border: '1px solid #30363D' }}>
        {(['drone', 'irrigation', 'tasks'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
              tab === t ? 'bg-[rgba(201,168,76,0.15)] text-white border border-[rgba(201,168,76,0.25)]' : 'text-gray-400 hover:text-white'
            }`}>
            {t === 'drone' ? '✈ Drone' : t === 'irrigation' ? '💧 Irrigation' : '✓ Tasks'}
          </button>
        ))}
      </div>

      {tab === 'irrigation' && <IrrigationPanel />}
      {tab === 'drone' && <DronePanel />}
      {tab === 'tasks' && (
        <div className="space-y-3">
          {[
            { title: 'Apply copper fungicide spray', field: 'North Field', due: 'Within 4 hours', priority: 'critical', status: 'pending' },
            { title: 'Photograph tomato canopy (follow-up)', field: 'North Field', due: 'In 48 hours', priority: 'high', status: 'scheduled' },
            { title: 'Check soil moisture after rainfall', field: 'North Field', due: 'Tomorrow', priority: 'medium', status: 'scheduled' },
            { title: 'Plan harvest logistics team', field: 'North Field', due: 'In 5 days', priority: 'low', status: 'pending' },
          ].map(task => (
            <div key={task.title} className={`aether-card priority-${task.priority}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-sm text-white mb-1">{task.title}</div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{task.field}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.due}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{
                  background: task.priority === 'critical' ? 'rgba(220,38,38,0.1)' : task.priority === 'high' ? 'rgba(217,119,6,0.1)' : 'rgba(45,125,210,0.1)',
                  color: task.priority === 'critical' ? '#EF4444' : task.priority === 'high' ? '#F59E0B' : '#60A5FA',
                }}>{task.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
