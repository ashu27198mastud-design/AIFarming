'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Leaf, MapPin, User, Check, ArrowRight } from 'lucide-react';
import { readAuthSession, writeAuthSession, createSession } from '@/lib/auth-session';
import { TRANSLATIONS, type LanguageCode } from '@/lib/i18n';

export default function SetupPage() {
  const router = useRouter();
  const [lang, setLang] = useState<LanguageCode>('hi');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'theme-dawn' | 'theme-day' | 'theme-dusk' | 'theme-night'>('theme-day');

  const copy = TRANSLATIONS[lang];

  useEffect(() => {
    const applyTheme = () => {
      const hour = new Date().getHours();
      if (hour >= 4 && hour < 7) setTheme('theme-dawn');
      else if (hour >= 7 && hour < 17) setTheme('theme-day');
      else if (hour >= 17 && hour < 20) setTheme('theme-dusk');
      else setTheme('theme-night');
    };
    applyTheme();
    const intervalId = window.setInterval(applyTheme, 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const startupTimer = window.setTimeout(() => {
      const session = readAuthSession();
      if (!session) {
        router.replace('/');
        return;
      }
      setLang(session.language);
      if (session.setupCompleted) {
        router.replace('/dashboard');
        return;
      }
      setLoading(false);
    }, 0);

    return () => window.clearTimeout(startupTimer);
  }, [router]);

  const handleNextStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  const handleNextStep2 = (e: FormEvent) => {
    e.preventDefault();
    if (!village.trim()) return;
    setStep(3);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });
        setDetecting(false);
      },
      () => {
        setError(copy.locationUnavailable);
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  const handleFinish = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const session = readAuthSession();
    if (!session) {
      router.replace('/');
      return;
    }

    const updatedSession = createSession({
      mode: session.mode,
      identifier: session.identifier,
      name: name.trim(),
      language: session.language,
      setupCompleted: true,
      village: village.trim(),
      coords: coords || { lat: 20.014, lng: 73.785 },
      consentAt: new Date().toISOString(),
    });

    writeAuthSession(updatedSession);
    router.replace('/dashboard');
  };

  if (loading) {
    return (
      <main className={`living-field-root ${theme} auth-minimal flex items-center justify-center`}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-white/80 text-[#1e8e3e] shadow-sm">
          <Leaf className="h-7 w-7 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className={`living-field-root ${theme} auth-minimal min-h-screen flex items-center justify-center px-4 py-8`}>
      <div className="living-field-sky-glow" aria-hidden="true" />
      <div className="auth-aurora" aria-hidden="true" />
      
      <section className="auth-minimal-column w-full max-w-md animate-fade-slide-up" aria-label={copy.profileSetupTitle}>
        <div className="auth-login-card w-full rounded-[24px]" style={{ backgroundColor: 'var(--lf-card-bg)', borderColor: 'var(--lf-card-border)', padding: '32px' }}>
          
          <header className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#1e8e3e] mb-4">
              <Leaf className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-[#123524]" style={{ color: 'var(--lf-ink)' }}>{copy.profileSetupTitle}</h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 1 ? 'bg-[#1e8e3e]' : 'bg-black/10'}`} />
              <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 2 ? 'bg-[#1e8e3e]' : 'bg-black/10'}`} />
              <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 3 ? 'bg-[#1e8e3e]' : 'bg-black/10'}`} />
            </div>
          </header>

          <div className="relative overflow-hidden min-h-[220px]">
            {/* STEP 1: NAME */}
            {step === 1 && (
              <form onSubmit={handleNextStep1} className="absolute inset-0 flex flex-col justify-center animate-fade-slide-up">
                <label htmlFor="setup-name" className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--lf-ink)' }}>
                  {copy.setupStep1Title}
                </label>
                <div className="auth-input-wrap">
                  <User aria-hidden="true" className="auth-input-icon" />
                  <input
                    id="setup-name"
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={copy.fullNameLabel}
                    className="w-full"
                    style={{ height: '56px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="auth-primary-button mt-6 flex items-center justify-center gap-2"
                >
                  {copy.nextBtn} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* STEP 2: VILLAGE */}
            {step === 2 && (
              <form onSubmit={handleNextStep2} className="absolute inset-0 flex flex-col justify-center animate-fade-slide-up">
                <label htmlFor="setup-village" className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--lf-ink)' }}>
                  {copy.setupStep2Title}
                </label>
                <div className="auth-input-wrap">
                  <MapPin aria-hidden="true" className="auth-input-icon" />
                  <input
                    id="setup-village"
                    type="text"
                    required
                    autoFocus
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder={copy.villageNameLabel}
                    className="w-full"
                    style={{ height: '56px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!village.trim()}
                  className="auth-primary-button mt-6 flex items-center justify-center gap-2"
                >
                  {copy.nextBtn} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* STEP 3: GPS */}
            {step === 3 && (
              <form onSubmit={handleFinish} className="absolute inset-0 flex flex-col justify-center animate-fade-slide-up">
                <label className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--lf-ink)' }}>
                  {copy.setupStep3Title}
                </label>

                {error && (
                  <div role="alert" className="mb-4 p-3 text-sm font-semibold rounded-xl bg-red-50 text-red-700 border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detecting || !!coords}
                  className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl border bg-white text-base font-bold text-[#3c4043] shadow-sm mb-4"
                  style={{ borderColor: 'var(--lf-card-border)' }}
                >
                  {coords ? (
                    <>
                      <Check className="h-5 w-5 text-[#1e8e3e]" />
                      <span className="text-[#1e8e3e]">{copy.locationUpdated}</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5" />
                      <span>{detecting ? copy.detectingLocation : copy.detectLocationBtn}</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={!coords}
                  className="auth-primary-button flex items-center justify-center gap-2"
                >
                  {copy.completeSetupBtn} <Check className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
