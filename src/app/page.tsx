'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Satellite, Cpu, Sprout, Zap, Globe, BarChart3, Droplets, Wind, ChevronRight, ArrowRight, Star } from 'lucide-react';

const STATS = [
  { label: 'Farms Monitored', value: '12,400+', icon: Sprout },
  { label: 'Yield Improvement', value: '23%', icon: BarChart3 },
  { label: 'Water Saved', value: '38%', icon: Droplets },
  { label: 'Countries', value: '5', icon: Globe },
];

const PILLARS = [
  { icon: BarChart3, color: '#0F5132', title: 'Yield Intelligence', desc: 'Predictive crop-performance combining weather, soil, satellite and field history' },
  { icon: Sprout, color: '#157347', title: 'Disease & Crop Stress', desc: 'Three-level observation: Satellite → Drone → Ground image AI diagnosis' },
  { icon: Wind, color: '#1A4A6E', title: 'Climate-Risk Intelligence', desc: '7-day proactive alerts for fungal risk, frost, waterlogging and wind' },
  { icon: Droplets, color: '#2D7DD2', title: 'Water Intelligence', desc: 'Predictive irrigation with Advisory, Approval, and Automation modes' },
  { icon: BarChart3, color: '#C9A84C', title: 'Market Intelligence', desc: 'Optimum harvest-window and cooperative vs market scenario comparison' },
];

const INTELLIGENCE_LOOP = [
  { step: 'SENSE', desc: 'Satellite, drone, weather, soil', color: '#0F5132' },
  { step: 'PREDICT', desc: 'AI models, risk engine', color: '#157347' },
  { step: 'DECIDE', desc: 'Resolution cards, recommendations', color: '#1A4A6E' },
  { step: 'ACT', desc: 'Irrigation, drone, treatment', color: '#C9A84C' },
  { step: 'VERIFY', desc: 'Before/after evidence', color: '#D97706' },
  { step: 'LEARN', desc: 'Farm twin updates', color: '#198754' },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen hero-gradient overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel rounded-none border-x-0 border-t-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0F5132, #C9A84C)' }}>
              <Satellite className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-inter font-800 text-sm tracking-wider text-white">AETHER AG</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Agriculture Intelligence OS</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {['Stream', 'Farm Twin', 'Fields', 'Operations', 'Markets'].map(item => (
              <button key={item} onClick={() => router.push(`/${item.toLowerCase().replace(' ', '-')}`)} className="nav-item text-sm">{item}</button>
            ))}
          </nav>
          <button onClick={() => router.push('/stream')} className="btn-primary text-sm">
            Launch Demo <ChevronRight className="w-3 h-3 inline ml-1" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium" style={{ background: 'rgba(15, 81, 50, 0.15)', border: '1px solid rgba(15, 81, 50, 0.35)', color: '#34D399' }}>
            <span className="pulse-dot-green"></span>
            Demo Farm Active — Maharashtra, India
          </div>
          <h1 className="text-5xl md:text-7xl font-inter font-black mb-6 leading-none tracking-tight">
            <span className="text-white">THE EARTH SPEAKS</span>
            <br />
            <span className="text-white">IN </span>
            <span className="gold-text">SIGNALS.</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            AETHER TURNS THEM INTO ACTION.
          </p>
          <p className="max-w-2xl mx-auto text-base md:text-lg mb-10" style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            A predictive agriculture operating system that connects atmospheric intelligence,
            crop health, water, operations and market decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/stream')}
              className="btn-primary text-base px-8 py-4 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Launch Demo Farm <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/twin')}
              className="btn-secondary text-base px-8 py-4 flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" /> Create Farm Twin
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="aether-card text-center">
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--gold)' }} />
              <div className="stat-value gold-text">{value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Intelligence Loop */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="mb-20">
          <div className="section-label text-center mb-8">Intelligence Loop</div>
          <div className="flex flex-wrap justify-center gap-3">
            {INTELLIGENCE_LOOP.map(({ step, desc, color }, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="aether-card px-5 py-3 text-center min-w-[120px]">
                  <div className="text-xs font-bold tracking-widest mb-1" style={{ color }}>{step}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                </div>
                {i < INTELLIGENCE_LOOP.length - 1 && <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Five Pillars */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="mb-20">
          <div className="section-label text-center mb-3">Five Agricultural Pillars</div>
          <h2 className="text-3xl font-inter font-bold text-center mb-10 text-white">Everything the farm needs. One operating system.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {PILLARS.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="aether-card group cursor-pointer" onClick={() => router.push('/stream')}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-semibold text-sm text-white mb-2">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Air to Ground Architecture */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="mb-20">
          <div className="section-label text-center mb-3">Air-to-Ground Architecture</div>
          <h2 className="text-3xl font-inter font-bold text-center mb-10 text-white">Sense from the sky. Act on the ground.</h2>
          <div className="glass-panel p-8">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { layer: 'AIR LAYER', color: '#1A4A6E', items: ['Satellite observation (NDVI)', 'Drone telemetry', 'Atmospheric forecasting', 'Regional disease intelligence'], icon: Satellite },
                { layer: 'INTELLIGENCE LAYER', color: '#C9A84C', items: ['Farm Digital Twin', 'Predictive AI models', 'Crop diagnosis (Gemini)', 'Water & market models', 'Risk prioritisation'], icon: Cpu },
                { layer: 'GROUND LAYER', color: '#0F5132', items: ['Farmer one-tap actions', 'Worker task assignments', 'Smart irrigation control', 'Drone mission execution', 'Harvest & logistics'], icon: Sprout },
              ].map(({ layer, color, items, icon: Icon }) => (
                <div key={layer} className="aether-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <span className="font-bold text-xs tracking-widest" style={{ color }}>{layer}</span>
                  </div>
                  <ul className="space-y-2">
                    {items.map(item => <li key={item} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color }}>·</span> {item}
                    </li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-center">
          <div className="glass-panel p-12 max-w-2xl mx-auto">
            <Star className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--gold)' }} />
            <h2 className="text-3xl font-inter font-bold text-white mb-3">Ready to experience AETHER?</h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Asha's farm in Maharashtra is loaded and ready for the 3-minute demonstration.</p>
            <button onClick={() => router.push('/stream')} className="btn-primary text-lg px-10 py-4">
              Launch Demo Farm →
            </button>
            <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>No login required • Fully seeded demo data • All features functional</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363D] py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>AETHER AG — Agriculture Intelligence Operating System</div>
          <div className="flex items-center gap-6">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by Gemini AI · Open-Meteo · Next.js</span>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Built for IIT Hackathon · 2026</div>
        </div>
      </footer>
    </main>
  );
}
