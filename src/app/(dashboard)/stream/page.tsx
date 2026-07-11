'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Droplets, TrendingUp, CheckCircle, X, ChevronRight,
  Satellite, Wind, Thermometer, Eye, Zap, Clock, Shield, BarChart3,
  CloudRain, Leaf, ArrowRight, Info
} from 'lucide-react';
import { useFarmStore } from '@/store/farmStore';
import { DEMO_RESOLUTION_CARDS, DEMO_CLIMATE_RISKS, DEMO_YIELD_OUTLOOK } from '@/lib/demo-seed';
import type { StreamCard, ResolutionCard } from '@/types';

const PRIORITY_CONFIG = {
  critical: { color: '#DC2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.35)', icon: AlertTriangle, label: 'CRITICAL' },
  high: { color: '#D97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.35)', icon: Zap, label: 'HIGH' },
  medium: { color: '#2D7DD2', bg: 'rgba(45,125,210,0.08)', border: 'rgba(45,125,210,0.35)', icon: Info, label: 'MEDIUM' },
  low: { color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.35)', icon: CheckCircle, label: 'LOW' },
};

const CARD_ICONS: Record<string, React.ComponentType<any>> = {
  weather: CloudRain, crop_stress: Leaf, irrigation: Droplets,
  market: TrendingUp, drone: Satellite, yield: BarChart3,
};

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="confidence-bar flex-1">
        <div className="confidence-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-mono" style={{ color }}>{value}%</span>
    </div>
  );
}

function DataSourceBadge({ source }: { source: string }) {
  if (source === 'live') return <span className="live-badge"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Live</span>;
  if (source === 'cached') return <span className="cached-badge">⏱ Cached</span>;
  return <span className="simulated-badge">⚡ Simulated</span>;
}

function ResolutionPanel({ card, onClose, onApprove }: {
  card: ResolutionCard;
  onClose: () => void;
  onApprove: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [approved, setApproved] = useState(false);
  const cfg = PRIORITY_CONFIG[card.priority];

  const handleApprove = () => {
    if (!confirmed) { setConfirmed(true); return; }
    setApproved(true);
    setTimeout(() => { onApprove(); onClose(); }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: '#161B22', border: `1px solid ${cfg.border}` }}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-[#30363D]" style={{ background: '#161B22' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
            <span className="text-xs font-bold tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
            <span className="text-sm font-semibold text-white">{card.title}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#21262D] text-gray-400"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Sections */}
          {[
            { label: 'WHAT AETHER DETECTED', content: card.detected, icon: Eye },
            { label: 'WHAT MAY HAPPEN', content: card.mayHappen, icon: AlertTriangle },
            { label: 'WHAT AETHER RECOMMENDS', content: card.recommendation, icon: Shield },
            { label: 'WHY THIS ACTION', content: card.why, icon: Info },
          ].map(({ label, content, icon: Icon }) => (
            <div key={label}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                <span className="section-label text-[10px]">{label}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{content}</p>
            </div>
          ))}

          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'When to Act', value: card.whenToAct, color: cfg.color },
              { label: 'Expected Benefit', value: card.expectedBenefit, color: '#34D399' },
              { label: 'Estimated Cost', value: card.estimatedCost, color: 'var(--text-secondary)' },
              { label: 'Risk of Delay', value: card.riskOfDelay, color: '#EF4444' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg p-3" style={{ background: '#0D1117', border: '1px solid #21262D' }}>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                <div className="text-xs font-medium" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Confidence + Sources */}
          <div>
            <div className="section-label text-[10px] mb-2">CONFIDENCE</div>
            <ConfidenceBar value={card.confidence} color={cfg.color} />
          </div>
          <div>
            <div className="section-label text-[10px] mb-2">DATA SOURCES</div>
            <div className="flex flex-wrap gap-2">
              {card.dataSources.map(s => <span key={s} className="text-xs px-2 py-1 rounded" style={{ background: '#21262D', color: 'var(--text-secondary)' }}>{s}</span>)}
            </div>
            <div className="mt-2"><DataSourceBadge source={card.dataSource} /></div>
          </div>

          {/* Alternatives */}
          <div>
            <div className="section-label text-[10px] mb-2">ALTERNATIVE OPTIONS</div>
            <ul className="space-y-1.5">
              {card.alternatives.map(alt => (
                <li key={alt} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5" />{alt}
                </li>
              ))}
            </ul>
          </div>

          {/* Follow-up */}
          <div className="rounded-lg p-3" style={{ background: 'rgba(15,81,50,0.1)', border: '1px solid rgba(15,81,50,0.25)' }}>
            <div className="section-label text-[10px] mb-1">FOLLOW-UP VERIFICATION</div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{card.followUpVerification}</p>
          </div>

          {/* Actions */}
          {approved ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 py-4 rounded-xl"
              style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)' }}>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-emerald-400">Resolution Approved — Farm Twin Updated</span>
            </motion.div>
          ) : (
            <div className="flex gap-3">
              {confirmed ? (
                <>
                  <button onClick={() => setConfirmed(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleApprove} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Confirm Approval
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onClose} className="btn-secondary flex-1">Review Later</button>
                  <button onClick={handleApprove} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" /> Apply Resolution
                  </button>
                </>
              )}
            </div>
          )}
          {confirmed && !approved && (
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Please review and confirm the resolution above</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function StreamCardComponent({ card, onAction, onDismiss }: {
  card: StreamCard;
  onAction: (cardId: string) => void;
  onDismiss: (cardId: string) => void;
}) {
  const cfg = PRIORITY_CONFIG[card.priority];
  const Icon = CARD_ICONS[card.type] ?? AlertTriangle;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="aether-card cursor-pointer group"
      style={{ borderLeft: `4px solid ${cfg.color}`, background: cfg.bg, borderTop: `1px solid ${cfg.border}`, borderRight: `1px solid ${cfg.border}`, borderBottom: `1px solid ${cfg.border}` }}
      onClick={() => onAction(card.resolutionCardId)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${cfg.color}15` }}>
            <Icon className="w-4 h-4" style={{ color: cfg.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
              <DataSourceBadge source={card.dataSource} />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-gold-DEFAULT transition-colors">{card.title}</h3>
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{card.subtitle}</p>
            <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{card.predictedTime}</span>
              <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{card.financialImpact}</span>
              <span className="flex items-center gap-1"><Leaf className="w-3 h-3" />{card.fieldName}</span>
            </div>
            <div className="mt-3">
              <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>AI Confidence</div>
              <ConfidenceBar value={card.confidence} color={cfg.color} />
            </div>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDismiss(card.id); }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#21262D] text-gray-500 flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={(e) => { e.stopPropagation(); onAction(card.resolutionCardId); }}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
          <Zap className="w-3 h-3" />{card.actionLabel}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onAction(card.resolutionCardId); }}
          className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5">
          Review Details <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

export default function StreamPage() {
  const { streamCards, resolutionCards, approveResolution, dismissCard } = useFarmStore();
  const [activeCard, setActiveCard] = useState<ResolutionCard | null>(null);
  const [justApproved, setJustApproved] = useState<string[]>([]);

  const visibleCards = streamCards.filter(c => !c.dismissed);
  const criticalCards = visibleCards.filter(c => c.priority === 'critical');
  const otherCards = visibleCards.filter(c => c.priority !== 'critical');

  const handleAction = (cardId: string) => {
    const card = resolutionCards[cardId];
    if (card) setActiveCard(card);
  };

  const handleApprove = () => {
    if (activeCard) {
      approveResolution(activeCard.id);
      setJustApproved(prev => [...prev, activeCard.id]);
    }
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="section-label">AETHER STREAM</span>
          {criticalCards.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(220,38,38,0.1)', color: '#EF4444', border: '1px solid rgba(220,38,38,0.25)' }}>
              <span className="pulse-dot"></span>{criticalCards.length} critical
            </div>
          )}
        </div>
        <h1 className="text-2xl font-inter font-bold text-white mb-1">Farm Intelligence Feed</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Personalised decision feed for Asha's Farm, Maharashtra · Last updated just now
        </p>
      </div>

      {/* Yield overview strip */}
      <div className="aether-card mb-5 p-4">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div>
            <div className="section-label text-[10px] mb-1">YIELD OUTLOOK</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-inter" style={{ color: '#34D399' }}>Good</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>24–31 tons/ha</span>
            </div>
          </div>
          <div className="text-right">
            <div className="section-label text-[10px] mb-1">MAIN RISK</div>
            <div className="text-sm font-medium" style={{ color: '#EF4444' }}>Fungal pressure at flowering</div>
          </div>
          <div className="text-right">
            <div className="section-label text-[10px] mb-1">VALUE PROTECTED</div>
            <div className="text-xl font-black font-inter gold-text">₹2.8L</div>
          </div>
          <div>
            <div className="section-label text-[10px] mb-1">CONFIDENCE</div>
            <div className="w-32">
              <ConfidenceBar value={78} color="#34D399" />
            </div>
          </div>
        </div>
      </div>

      {/* Priority cards */}
      {criticalCards.length > 0 && (
        <div className="mb-3">
          <div className="section-label mb-3">REQUIRES IMMEDIATE ATTENTION</div>
          <div className="space-y-3">
            <AnimatePresence>
              {criticalCards.map(card => (
                <StreamCardComponent key={card.id} card={card} onAction={handleAction} onDismiss={dismissCard} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {otherCards.length > 0 && (
        <div className="mb-3">
          <div className="section-label mb-3 mt-5">PENDING REVIEW</div>
          <div className="space-y-3">
            <AnimatePresence>
              {otherCards.map(card => (
                <StreamCardComponent key={card.id} card={card} onAction={handleAction} onDismiss={dismissCard} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {visibleCards.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 aether-card">
          <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#34D399' }} />
          <h3 className="font-semibold text-white mb-2">All clear</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active alerts. Aether continues monitoring.</p>
        </motion.div>
      )}

      {/* Climate risk strip */}
      <div className="mt-6">
        <div className="section-label mb-3">7-DAY CLIMATE RISK</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_CLIMATE_RISKS.map(risk => {
            const cfg = PRIORITY_CONFIG[risk.riskLevel];
            return (
              <div key={risk.id} className="aether-card p-4" style={{ borderLeft: `3px solid ${cfg.color}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold tracking-widest" style={{ color: cfg.color }}>{risk.riskLevel.toUpperCase()}</span>
                </div>
                <div className="font-semibold text-sm text-white mb-1">{risk.title}</div>
                <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{risk.affectedTimeWindow}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{risk.recommendedAction}</div>
                <div className="mt-2">
                  <ConfidenceBar value={risk.confidence} color={cfg.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resolution Panel Modal */}
      <AnimatePresence>
        {activeCard && (
          <ResolutionPanel card={activeCard} onClose={() => setActiveCard(null)} onApprove={handleApprove} />
        )}
      </AnimatePresence>
    </div>
  );
}
