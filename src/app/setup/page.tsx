'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Leaf, MapPin, Sprout, User } from 'lucide-react';
import { readAuthSession, writeAuthSession, createSession } from '@/lib/auth-session';
import { TRANSLATIONS, type LanguageCode } from '@/lib/i18n';
import styles from './setup.module.css';

const PRODUCT_BRAND = 'ANVAYA';
const PRODUCT_DESCRIPTOR = 'Agriculture OS';
const PRODUCT_ARIA_LABEL = `${PRODUCT_BRAND} ${PRODUCT_DESCRIPTOR}`;
const SETUP_TOTAL_STEPS = 3;

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

  const copy = TRANSLATIONS[lang];

  const stepProgressLabel = `${step} / ${SETUP_TOTAL_STEPS}`;

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
      <main className={styles.setupRoot}>
        <Image
          alt=""
          aria-hidden="true"
          className={styles.backdrop}
          fill
          priority
          sizes="100vw"
          src="/images/anvaya-onboarding-field.webp"
        />
        <div className={styles.veil} aria-hidden="true" />
        <div className={styles.loadingPanel}>
          <Leaf className="h-7 w-7 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.setupRoot}>
      <Image
        alt=""
        aria-hidden="true"
        className={styles.backdrop}
        fill
        priority
        sizes="100vw"
        src="/images/anvaya-onboarding-field.webp"
      />
      <div className={styles.veil} aria-hidden="true" />

      <section className={styles.shell} aria-label={copy.profileSetupTitle}>
        <div className={styles.leftColumn}>
          <div className={styles.brand} aria-label={PRODUCT_ARIA_LABEL}>
            <span className={styles.brandSymbol} aria-hidden="true">
              <Sprout className="h-5 w-5" />
            </span>
            <div>
              <span className={styles.brandName}>{PRODUCT_BRAND}</span>
              <span className={styles.brandDescriptor}>{PRODUCT_DESCRIPTOR}</span>
            </div>
          </div>

          <div className={styles.panel}>
            <header className={styles.panelHeader}>
              <div className={styles.kickerRow}>
                <span className={styles.stepCount}>{stepProgressLabel}</span>
                <div className={styles.progress} role="progressbar" aria-valuemin={1} aria-valuemax={SETUP_TOTAL_STEPS} aria-valuenow={step}>
                  {[1, 2, 3].map((item) => (
                    <span
                      key={item}
                      className={`${styles.progressSegment} ${step >= item ? styles.progressSegmentActive : ''}`}
                    />
                  ))}
                </div>
              </div>
              <h1 className={styles.title}>{copy.profileSetupTitle}</h1>
              <p className={styles.description}>{copy.profileSetupDesc}</p>
            </header>

            <div className={`${styles.stage} relative overflow-hidden`}>
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
                    className={styles.locationButton}
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
        </div>
      </section>
    </main>
  );
}
