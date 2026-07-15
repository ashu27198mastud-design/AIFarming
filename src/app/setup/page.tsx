'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Leaf, MapPin, User, Check } from 'lucide-react';
import { readAuthSession, writeAuthSession, createSession } from '@/lib/auth-session';
import { TRANSLATIONS, type LanguageCode } from '@/lib/i18n';

export default function SetupPage() {
  const router = useRouter();
  const [lang, setLang] = useState<LanguageCode>('hi');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [consent, setConsent] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const copy = TRANSLATIONS[lang];

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

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });

        try {
          const response = await fetch(`/api/location/reverse?lat=${lat}&lng=${lng}&fallback=Nashik`);
          if (!response.ok) throw new Error();
          const data = await response.json();
          if (data.village) {
            setVillage(data.village);
          }
        } catch {
          // Fallback to default
          setVillage('Nashik');
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setError(copy.locationUnavailable);
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !village.trim()) {
      setError(copy.setupRequiredFields);
      return;
    }

    if (!consent) {
      return;
    }

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
      <main className="auth-minimal flex items-center justify-center min-h-screen text-[#202124]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-[#E6F4EA] text-[#137333] shadow-sm">
          <Leaf className="h-7 w-7 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="auth-minimal min-h-screen flex items-center justify-center px-4 py-8">
      <div className="auth-aurora" aria-hidden="true" />
      <div className="auth-glass-field" aria-hidden="true">
        <span className="auth-glass-piece auth-glass-piece-1" />
        <span className="auth-glass-piece auth-glass-piece-2"><Leaf /></span>
        <span className="auth-glass-piece auth-glass-piece-3" />
        <span className="auth-glass-piece auth-glass-piece-4"><Leaf /></span>
      </div>

      <section className="auth-minimal-column w-full max-w-md" aria-label={copy.profileSetupTitle}>
        <div className="w-full rounded-[24px] border border-white/90 bg-white/86 p-6 shadow-glass backdrop-blur-glass animate-fade-slide-up">
          <header className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#137333]">
              <Leaf className="h-6 w-6" />
            </div>
            <h1 className="mt-3 text-2xl font-black text-[#123524]">{copy.profileSetupTitle}</h1>
            <p className="mt-2 text-sm text-[#4F5B54] font-medium leading-relaxed">
              {copy.profileSetupDesc}
            </p>
          </header>

          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div role="alert" className="p-3 text-sm font-semibold rounded-xl bg-red-50 text-red-700 border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="setup-name" className="text-xs font-bold text-[#4F5B54] uppercase tracking-wider block">
                {copy.fullNameLabel}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#80868b] pointer-events-none" />
                <input
                  id="setup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 text-base font-bold text-[#202124] rounded-2xl border border-[#dadce0] bg-white focus:border-[#1e8e3e] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="setup-village" className="text-xs font-bold text-[#4F5B54] uppercase tracking-wider block">
                {copy.villageNameLabel}
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#80868b] pointer-events-none" />
                <input
                  id="setup-village"
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 text-base font-bold text-[#202124] rounded-2xl border border-[#dadce0] bg-white focus:border-[#1e8e3e] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={detectLocation}
              disabled={detecting}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl border border-[#dadce0] bg-white text-sm font-black text-[#3c4043] hover:bg-[#f8f9fa] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <MapPin className="h-4 w-4" />
              <span>{detecting ? copy.detectingLocation : copy.detectLocationBtn}</span>
            </button>

            <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
              <div className="relative flex items-center pt-0.5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-6 w-6 rounded-lg border-2 border-[#dadce0] bg-white peer-checked:bg-[#1e8e3e] peer-checked:border-[#1e8e3e] transition-all flex items-center justify-center">
                  <Check className="h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-xs font-bold text-[#5f6368] leading-tight pt-0.5">
                {copy.privacyConsent}
              </span>
            </label>

            <button
              type="submit"
              disabled={!consent}
              className="w-full h-14 mt-4 inline-flex items-center justify-center rounded-2xl bg-[#1e8e3e] text-base font-black text-white shadow-md hover:bg-[#137333] disabled:bg-[#f1f3f4] disabled:text-[#9aa0a6] disabled:shadow-none transition-all"
            >
              <span>{copy.completeSetupBtn}</span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
