'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, Upload, Camera, Mic, Volume2,
  Cpu, Zap, Activity, Gauge, Thermometer, Wind, FlaskConical,
  ChevronRight, Star, AlertTriangle
} from 'lucide-react';
import { useFarmStore } from '@/store/farmStore';
import { DEMO_RESEARCH_EXPERIMENT } from '@/lib/demo-seed';
import type { AetherChatMessage } from '@/types';

const INITIAL_MESSAGES: AetherChatMessage[] = [
  {
    id: 'msg-0',
    role: 'aether',
    content: `Hello Asha! I can see that your North Field tomatoes are at the flowering stage with emerging fungal stress indicators. Humidity has been above 85% for the last 6 hours and rainfall is forecast within 18 hours.

I’ve already placed a Critical resolution card in your Stream. Would you like me to explain the fungal risk in more detail, or can I help you with something else?`,
    timestamp: new Date().toISOString(),
    contextUsed: ['Farm Twin — crop stage', 'Humidity sensor', 'Weather forecast'],
  },
];

const QUICK_PROMPTS = [
  'Explain the fungal risk in detail',
  'Is my irrigation schedule safe?',
  'When should I harvest?',
  'What’s the best treatment for Early Blight?',
];

export default function AetherPage() {
  const [tab, setTab] = useState<'assistant' | 'diagnosis' | 'research'>('assistant');
  const { farmTwin } = useFarmStore();
  const [messages, setMessages] = useState<AetherChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnosisFile, setDiagnosisFile] = useState<File | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [experiment, setExperiment] = useState(DEMO_RESEARCH_EXPERIMENT);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Animate research telemetry
  useEffect(() => {
    if (tab !== 'research') return;
    const interval = setInterval(() => {
      setExperiment(prev => ({
        ...prev,
        frequencyKhz: 40 + Math.random() * 0.5,
        pressurePa: 1800 + Math.random() * 50,
        stabilityPercent: 94 + Math.random() * 3,
        nutrientDistribution: 87 + Math.random() * 3,
        exposureDurationSec: (prev.exposureDurationSec ?? 0) + 1,
        temperature: 24 + Math.random() * 0.5,
        humidity: 52 + Math.random() * 2,
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [tab]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || loading) return;
    setInput('');
    const userMsg: AetherChatMessage = { id: `msg-${Date.now()}`, role: 'user', content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const farmContext = `Farmer: ${farmTwin.farmerName}. Farm: ${farmTwin.farmName}, ${farmTwin.region}. Crop: ${farmTwin.cropCycles[0]?.cropName} at ${farmTwin.cropCycles[0]?.cropStage} stage.`;
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: content, farmContext }) });
      const data = await res.json();
      const aetherMsg: AetherChatMessage = {
        id: `msg-${Date.now()}-a`, role: 'aether',
        content: data.response ?? 'I encountered an issue. Please try again.',
        timestamp: new Date().toISOString(),
        contextUsed: ['Farm Twin', 'Weather forecast'],
      };
      setMessages(prev => [...prev, aetherMsg]);
    } catch {
      const errMsg: AetherChatMessage = {
        id: `msg-err-${Date.now()}`, role: 'aether',
        content: 'Unable to reach AI service. Please check your connection.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnosis = async () => {
    if (!diagnosisFile) return;
    setDiagnosisLoading(true);
    setDiagnosisResult(null);
    try {
      const farmContext = `Crop: ${farmTwin.cropCycles[0]?.cropName} at ${farmTwin.cropCycles[0]?.cropStage} stage. Region: ${farmTwin.region}.`;
      const fd = new FormData();
      fd.append('image', diagnosisFile);
      fd.append('farmContext', farmContext);
      const res = await fetch('/api/ai/diagnose', { method: 'POST', body: fd });
      const data = await res.json();
      setDiagnosisResult(data);
    } catch {
      setDiagnosisResult({ error: 'Analysis failed. Showing demo result.' });
    } finally {
      setDiagnosisLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Tab bar */}
      <div className="flex gap-1 m-4 mb-0 p-1 rounded-xl flex-shrink-0" style={{ background: '#161B22', border: '1px solid #30363D' }}>
        {([['assistant', 'Aether AI'], ['diagnosis', 'Crop Diagnosis'], ['research', 'Research Lab']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === t ? 'bg-[rgba(201,168,76,0.15)] text-white border border-[rgba(201,168,76,0.25)]' : 'text-gray-400 hover:text-white'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* AI Assistant */}
      {tab === 'assistant' && (
        <div className="flex flex-col flex-1 overflow-hidden p-4">
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'aether' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1" style={{ background: 'linear-gradient(135deg, #0F5132, #C9A84C)' }}>
                    <Cpu className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm'
                    : 'rounded-tl-sm'
                }`} style={msg.role === 'user'
                  ? { background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)' }
                  : { background: '#161B22', border: '1px solid #30363D' }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{msg.content}</p>
                  {msg.contextUsed && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.contextUsed.map(c => <span key={c} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: '#0D1117', color: 'var(--text-muted)' }}>{c}</span>)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2" style={{ background: 'linear-gradient(135deg, #0F5132, #C9A84C)' }}>
                  <Cpu className="w-3.5 h-3.5 text-white animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: '#161B22', border: '1px solid #30363D' }}>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--gold)', animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Quick prompts */}
          <div className="flex gap-2 flex-wrap mb-3">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:border-[rgba(201,168,76,0.5)]"
                style={{ background: '#161B22', border: '1px solid #30363D', color: 'var(--text-secondary)' }}>
                {p}
              </button>
            ))}
          </div>
          {/* Input */}
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask Aether about your farm..."
              className="aether-input flex-1" />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="btn-primary px-4 flex items-center gap-1 disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Crop Diagnosis */}
      {tab === 'diagnosis' && (
        <div className="p-4 overflow-y-auto flex-1">
          <div className="section-label mb-2">GROUND IMAGE ANALYSIS</div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Upload a plant, leaf, fruit, or stem photograph. Aether will analyse visible symptoms using Gemini Vision AI.</p>

          <div className="aether-card mb-4">
            <div className="border-2 border-dashed rounded-xl p-8 text-center transition-all" style={{ borderColor: diagnosisFile ? 'rgba(201,168,76,0.5)' : '#30363D' }}
              onClick={() => fileInputRef.current?.click()}>
              {diagnosisFile ? (
                <div>
                  <div className="text-2xl mb-2">🌿</div>
                  <div className="text-sm font-medium text-white">{diagnosisFile.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{(diagnosisFile.size / 1024).toFixed(0)} KB</div>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Click to upload or drag image here</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>JPEG, PNG, WebP · Max 4MB</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e => setDiagnosisFile(e.target.files?.[0] ?? null)} />
            <div className="flex gap-3 mt-3">
              <button onClick={handleDiagnosis} disabled={!diagnosisFile || diagnosisLoading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {diagnosisLoading ? <><Cpu className="w-4 h-4 animate-spin" /> Analysing...</> : <><Zap className="w-4 h-4" /> Analyse with Gemini</>}
              </button>
              <button onClick={() => { setDiagnosisFile(null); setDiagnosisResult(null); }}
                className="btn-secondary">Clear</button>
            </div>
          </div>

          {diagnosisResult && !diagnosisResult.error && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="aether-card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="section-label text-[10px] mb-1">MOST LIKELY DIAGNOSIS</div>
                    <div className="font-bold text-white text-lg">{diagnosisResult.mostLikelyIssue}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Confidence</div>
                    <div className="text-2xl font-black gold-text">{diagnosisResult.confidence}%</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded font-semibold`} style={{
                    background: diagnosisResult.severity === 'critical' ? 'rgba(220,38,38,0.1)' : diagnosisResult.severity === 'high' ? 'rgba(217,119,6,0.1)' : 'rgba(45,125,210,0.1)',
                    color: diagnosisResult.severity === 'critical' ? '#EF4444' : diagnosisResult.severity === 'high' ? '#F59E0B' : '#60A5FA',
                  }}>Severity: {diagnosisResult.severity}</span>
                  <span className="text-xs px-2 py-1 rounded font-semibold" style={{ background: 'rgba(5,150,105,0.1)', color: '#34D399' }}>Urgency: {diagnosisResult.urgency}</span>
                </div>

                {diagnosisResult.visibleIndicators && (
                  <div className="mb-3">
                    <div className="section-label text-[10px] mb-2">VISIBLE INDICATORS</div>
                    <ul className="space-y-1">
                      {diagnosisResult.visibleIndicators.map((ind: string) => (
                        <li key={ind} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />{ind}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg p-3" style={{ background: '#0D1117' }}>
                    <div className="section-label text-[10px] mb-2">IMMEDIATE ACTION</div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{diagnosisResult.immediateAction}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: '#0D1117' }}>
                    <div className="section-label text-[10px] mb-2">ORGANIC OPTIONS</div>
                    <ul className="space-y-1">
                      {diagnosisResult.organicOptions?.map((opt: string) => (
                        <li key={opt} className="text-xs" style={{ color: 'var(--text-secondary)' }}>· {opt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {diagnosisResult.chemicalCategory && (
                  <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}>
                    <div className="section-label text-[10px] mb-1">CHEMICAL CATEGORY</div>
                    <p className="text-xs" style={{ color: '#F59E0B' }}>{diagnosisResult.chemicalCategory}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Consult a certified agronomist for dosage specific to your state regulations.</p>
                  </div>
                )}
                <div className="mt-3 rounded-lg p-3" style={{ background: '#0D1117' }}>
                  <div className="section-label text-[10px] mb-1">PREVENTION ADVICE</div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{diagnosisResult.preventionAdvice}</p>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <AlertTriangle className="w-3 h-3" />
                  {diagnosisResult.disclaimer ?? 'AI analysis is indicative only. Consult a certified agronomist before applying treatments.'}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Research Lab */}
      {tab === 'research' && (
        <div className="p-4 overflow-y-auto flex-1">
          <div className="rounded-lg px-4 py-3 mb-4" style={{ background: 'rgba(45,125,210,0.08)', border: '1px solid rgba(45,125,210,0.2)' }}>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4" style={{ color: '#60A5FA' }} />
              <span className="text-xs font-semibold" style={{ color: '#93C5FD' }}>AETHER RESEARCH LAB</span>
            </div>
            <p className="text-xs mt-1" style={{ color: '#60A5FA' }}>Research prototype. Not a commercially deployed farm-control system. All telemetry is simulated for demonstration purposes.</p>
          </div>

          <div className="section-label mb-2">ACOUSTIC LEVITATION SEED LAB</div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Exploring contactless seed handling, seed coating and micro-nutrient distribution using controlled acoustic fields.</p>

          <div className="aether-card mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-white">Experiment #001</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="pulse-dot-green"></span>
                  <span className="text-xs" style={{ color: '#34D399' }}>Running</span>
                </div>
              </div>
              <Activity className="w-6 h-6" style={{ color: 'var(--gold)' }} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Acoustic Frequency', value: `${experiment.frequencyKhz?.toFixed(1)} kHz`, icon: Gauge, color: '#60A5FA' },
                { label: 'Acoustic Pressure', value: `${experiment.pressurePa?.toFixed(0)} Pa`, icon: Wind, color: '#34D399' },
                { label: 'Seed Mass', value: `${experiment.seedMassGrams?.toFixed(3)} g`, icon: FlaskConical, color: 'var(--gold)' },
                { label: 'Suspension Stability', value: `${experiment.stabilityPercent?.toFixed(1)}%`, icon: Activity, color: '#34D399' },
                { label: 'Nutrient Distribution', value: `${experiment.nutrientDistribution?.toFixed(1)}%`, icon: Star, color: '#F59E0B' },
                { label: 'Exposure Duration', value: `${experiment.exposureDurationSec?.toFixed(0)}s`, icon: Gauge, color: '#C084FC' },
              ].map(({ label, value, icon: Icon, color }) => (
                <motion.div key={label} animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2, delay: Math.random() }}
                  className="rounded-lg p-3" style={{ background: '#0D1117', border: '1px solid #21262D' }}>
                  <Icon className="w-3.5 h-3.5 mb-1" style={{ color }} />
                  <div className="text-sm font-mono font-bold" style={{ color }}>{value}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-lg p-3" style={{ background: '#0D1117', border: '1px solid #21262D' }}>
                <Thermometer className="w-3.5 h-3.5 mb-1" style={{ color: '#F87171' }} />
                <div className="text-sm font-mono font-bold" style={{ color: '#F87171' }}>{experiment.temperature?.toFixed(1)}°C</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Temperature</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#0D1117', border: '1px solid #21262D' }}>
                <Wind className="w-3.5 h-3.5 mb-1" style={{ color: '#60A5FA' }} />
                <div className="text-sm font-mono font-bold" style={{ color: '#60A5FA' }}>{experiment.humidity?.toFixed(1)}%</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Humidity</div>
              </div>
            </div>
          </div>

          <div className="aether-card">
            <div className="section-label text-[10px] mb-3">RESEARCH APPLICATIONS</div>
            <div className="space-y-3">
              {[
                { title: 'Contactless Seed Coating', desc: 'Apply nano-coatings to seeds without physical contact, preserving coating integrity', status: 'Active' },
                { title: 'Micro-Nutrient Distribution', desc: 'Precise nutrient application at seed level using acoustic field manipulation', status: 'Active' },
                { title: 'Germination Enhancement', desc: 'Acoustic pre-treatment to stimulate seed germination rates', status: 'Planned' },
              ].map(({ title, desc, status }) => (
                <div key={title} className="flex items-start gap-3 py-3 border-b border-[#21262D] last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                  <div>
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                  <span className="ml-auto text-[10px] font-semibold" style={{ color: status === 'Active' ? '#34D399' : '#484F58' }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
