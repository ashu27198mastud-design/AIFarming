'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Globe2, Lock, Mail, Phone } from 'lucide-react';
import { FormEvent, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { wordmarkFontClass } from '@/app/fonts';
import {
  clearAuthSession,
  createSession,
  readAuthSession,
  saveLocalAccount,
  verifyLocalAccount,
  writeAuthSession,
} from '@/lib/auth-session';
import type { LanguageCode } from '@/lib/i18n';
import { LOGIN_COPY, LOGIN_LANGUAGES } from '@/lib/i18n/login';
import {
  languageFromBrowser,
  languageFromLocation,
  WORDMARK_INTERVAL_MS,
  WORDMARKS,
  wordmarkIndexForLanguage,
  type ApproximateLocation,
} from '@/lib/morning-light';
import { buildSupabaseGoogleOAuthUrl } from '@/lib/supabase-auth';
import styles from './MorningLightLogin.module.css';

const LANGUAGE_STORAGE_KEY = 'km-lang';
const LANGUAGE_OVERRIDE_STORAGE_KEY = 'km-lang-override';
const LANGUAGE_DETECTED_STORAGE_KEY = 'km-lang-detected-v12';
const CONSENT_PENDING_KEY = 'km-consent-pending';
const DEMO_IDENTIFIER = 'asha@kisanmitra.demo';
const DEMO_PASSWORD = 'Kisan123';

type Message = { tone: 'error' | 'info'; text: string };
type WordmarkState = { index: number; phase: 'enter' | 'exit'; tick: number };
type MorningLightLoginProps = { initialLanguage?: LanguageCode; languagePreferenceLocked?: boolean };

function safeGetStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The server cookie remains the durable language source.
  }
}

function persistLanguage(language: LanguageCode): void {
  safeSetStorage(LANGUAGE_STORAGE_KEY, language);
}

function readSavedLanguage(fallback: LanguageCode): LanguageCode {
  const saved = safeGetStorage(LANGUAGE_STORAGE_KEY);
  return saved === 'mr' || saved === 'en' || saved === 'hi' ? saved : fallback;
}

function Typewriter({
  lines,
  reducedMotion,
  className,
}: {
  lines: readonly string[];
  reducedMotion: boolean;
  className: string;
}) {
  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const line = lines[lineIndex];
    let delay = deleting ? 28 : 60;
    if (!deleting && text === line) delay = 2600;
    if (deleting && text.length === 0) delay = 180;

    const timer = window.setTimeout(() => {
      if (!deleting && text === line) {
        setDeleting(true);
        return;
      }
      if (deleting && text.length === 0) {
        setDeleting(false);
        setLineIndex((current) => (current + 1) % lines.length);
        return;
      }
      setText(deleting ? text.slice(0, -1) : line.slice(0, text.length + 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [deleting, lineIndex, lines, reducedMotion, text]);

  return <span className={className} aria-hidden="true">{reducedMotion ? lines[0] : text}</span>;
}
function GoogleMark() {
  return (
    <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path style={{ fill: 'var(--google-blue)' }} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path style={{ fill: 'var(--google-green)' }} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path style={{ fill: 'var(--google-yellow)' }} d="M5.84 14.1A6.5 6.5 0 0 1 5.49 12c0-.74.13-1.44.35-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94z" />
      <path style={{ fill: 'var(--google-red)' }} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1C7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function CropStalk() {
  return (
    <svg viewBox="0 0 84 210" aria-hidden="true">
      <path d="M43 210C43 142 40 76 47 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M43 168C29 160 21 146 18 131M43 139c16-10 23-23 25-38M44 107C30 98 25 86 24 72M45 77c13-9 19-21 20-33" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18 131c11 0 17 5 25 14M68 101c-11 1-17 6-24 15M24 72c10 1 15 6 21 13M65 44c-9 1-14 6-19 13" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function MorningScene({ showBird }: { showBird: boolean }) {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={`${styles.plane} ${styles.sky}`}>
        <div className={styles.sun} />
      </div>

      <div className={`${styles.plane} ${styles.farField}`}>
        <svg viewBox="0 0 1600 280" preserveAspectRatio="none">
          <path d="M0 202C170 170 300 194 445 176c164-20 270 28 430 4 170-26 287 29 405 4 116-25 215-9 320-28" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0 238c188-42 330-8 492-28 184-22 330 24 514 5 188-20 351 8 594-26" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className={`${styles.plane} ${styles.mainField}`}>
        <svg viewBox="0 0 1600 280" preserveAspectRatio="none">
          <path className={styles.mainStroke} d="M0 222C176 181 324 212 475 187c154-25 273 32 438 5 173-28 308 30 430 4 101-22 175-17 257-39V280H0Z" />
          <path className={styles.rimStroke} d="M0 222C176 181 324 212 475 187c154-25 273 32 438 5 173-28 308 30 430 4 101-22 175-17 257-39" />
          <g className={styles.mainStroke}>
            <path d="M438 191v-62m0 18c-30 4-45-14-33-31 8-12 24-14 33-6 11-16 37-12 40 7 19-2 29 21 12 32-13 8-34 4-52-2Z" />
            <path d="M1200 198h48v-22h-34l-13 9Zm14-22 10-19h29l15 19m-53 22a10 10 0 1 0 20 0m18 0a12 12 0 1 0 24 0m-8-42v-16h11" />
            <path d="M90 252c145-31 262-26 384-7m103 4c139-27 270-24 399-4m101 7c122-25 242-28 386-11" strokeDasharray="9 10" />
          </g>
        </svg>
      </div>

      <div className={`${styles.plane} ${styles.foreground}`}>
        {[0, 1, 2, 3].map((item) => <span className={styles.stalk} key={item}><CropStalk /></span>)}
      </div>

      <div className={styles.cloudShadow} />
      <span className={`${styles.mote} ${styles.moteOne}`} />
      <span className={`${styles.mote} ${styles.moteTwo}`} />
      {showBird && (
        <svg className={styles.bird} viewBox="0 0 36 18">
          <path d="M2 14c7-8 12-8 16-2 4-6 9-6 16 2-7-3-12-2-16 2-4-4-9-5-16-2Z" fill="currentColor" />
        </svg>
      )}
      <div className={styles.grain} />
    </div>
  );
}

export default function MorningLightLogin({
  initialLanguage = 'hi',
  languagePreferenceLocked = false,
}: MorningLightLoginProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const manualLanguageRef = useRef(languagePreferenceLocked);
  const [lang, setLang] = useState<LanguageCode>(initialLanguage);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [languageToast, setLanguageToast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showBird, setShowBird] = useState(false);
  const [wordmarkState, setWordmarkState] = useState<WordmarkState>({ index: 0, phase: 'enter', tick: 0 });
  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('otp');
  const [otpStage, setOtpStage] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountMode, setAccountMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState<Message | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copy = LOGIN_COPY[lang];
  const activeWordmarkIndex = reducedMotion ? wordmarkIndexForLanguage(lang) : wordmarkState.index;
  const wordmark = WORDMARKS[activeWordmarkIndex];

  useEffect(() => {
    let controller: AbortController | undefined;
    let locationTimeout = 0;
    let toastTimeout = 0;

    const startupTimer = window.setTimeout(() => {
      const forceLogin = new URLSearchParams(window.location.search).get('login') === '1';
      if (forceLogin) {
        clearAuthSession();
        window.history.replaceState(null, '', '/');
      } else {
        const session = readAuthSession();
        if (session) {
          router.replace(session.setupCompleted ? '/dashboard' : '/setup');
          return;
        }
      }

      const savedLanguage = readSavedLanguage(initialLanguage);
      const manuallySelected = languagePreferenceLocked || safeGetStorage(LANGUAGE_OVERRIDE_STORAGE_KEY) === 'true';
      const alreadyDetected = safeGetStorage(LANGUAGE_DETECTED_STORAGE_KEY) === 'true';
      manualLanguageRef.current = manuallySelected;
      setLang(savedLanguage);
      if (manuallySelected || alreadyDetected) return;

      controller = new AbortController();
      locationTimeout = window.setTimeout(() => controller?.abort(), 4000);

      void fetch('/api/location/approximate', { cache: 'no-store', signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error('location-unavailable');
          return response.json() as Promise<ApproximateLocation>;
        })
        .then((location) => {
          if (!manualLanguageRef.current) setLang(languageFromLocation(location));
        })
        .catch(() => {
          if (!manualLanguageRef.current) setLang(languageFromBrowser(window.navigator.language));
        })
        .finally(() => {
          window.clearTimeout(locationTimeout);
          safeSetStorage(LANGUAGE_DETECTED_STORAGE_KEY, 'true');
          if (manualLanguageRef.current) return;
          setLanguageToast(true);
          toastTimeout = window.setTimeout(() => setLanguageToast(false), 3000);
        });
    }, 0);

    return () => {
      controller?.abort();
      window.clearTimeout(startupTimer);
      window.clearTimeout(locationTimeout);
      window.clearTimeout(toastTimeout);
    };
  }, [initialLanguage, languagePreferenceLocked, router]);

  useLayoutEffect(() => {
    const element = wordmarkRef.current;
    if (!element) return;

    const fitWordmark = () => {
      element.style.removeProperty('--word-fit-size');
      const baseSize = Number.parseFloat(window.getComputedStyle(element).fontSize);
      const availableWidth = Math.max(0, element.clientWidth - 12);
      const renderedWidth = element.scrollWidth;
      if (renderedWidth <= element.clientWidth || renderedWidth === 0) return;
      element.style.setProperty('--word-fit-size', Math.floor(baseSize * (availableWidth / renderedWidth)).toString() + 'px');
    };

    fitWordmark();
    const observer = new ResizeObserver(fitWordmark);
    observer.observe(element);
    return () => observer.disconnect();
  }, [wordmark.code, wordmarkState.tick]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
    persistLanguage(lang);
  }, [lang]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = window.setInterval(() => {
      setWordmarkState((current) => ({ ...current, phase: 'exit' }));
    }, WORDMARK_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;
    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      targetX = event.clientX / window.innerWidth - 0.5;
      targetY = event.clientY / window.innerHeight - 0.5;
    };
    const leave = () => {
      targetX = 0;
      targetY = 0;
    };
    const render = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      root.style.setProperty('--p1x', `${currentX * 4}px`);
      root.style.setProperty('--p1y', `${currentY * 4}px`);
      root.style.setProperty('--p2x', `${currentX * 10}px`);
      root.style.setProperty('--p2y', `${currentY * 10}px`);
      root.style.setProperty('--p3x', `${currentX * 18}px`);
      root.style.setProperty('--p3y', `${currentY * 18}px`);
      root.style.setProperty('--p4x', `${currentX * 28}px`);
      root.style.setProperty('--p4y', `${currentY * 28}px`);
      frame = window.requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerleave', leave);
    frame = window.requestAnimationFrame(render);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerleave', leave);
      window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (window.sessionStorage.getItem('km-morning-bird-seen') === 'true') return;
    window.sessionStorage.setItem('km-morning-bird-seen', 'true');
    const timer = window.setTimeout(() => setShowBird(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!languageMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLanguageMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [languageMenuOpen]);

  const selectLanguage = (nextLanguage: LanguageCode) => {
    manualLanguageRef.current = true;
    setLang(nextLanguage);
    setLanguageMenuOpen(false);
    setLanguageToast(false);
    persistLanguage(nextLanguage);
    safeSetStorage(LANGUAGE_OVERRIDE_STORAGE_KEY, 'true');
    void fetch('/api/preferences/language', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ language: nextLanguage }),
      credentials: 'same-origin',
      keepalive: true,
    }).catch(() => undefined);
  };

  const finishLogin = (options: { mode: 'user' | 'demo'; identifier: string; name?: string; setupCompleted?: boolean }) => {
    const consentAt = new Date().toISOString();
    const session = createSession({
      ...options,
      language: lang,
      consentAt,
      village: options.mode === 'demo' ? 'Nashik' : undefined,
      coords: options.mode === 'demo' ? { lat: 20.014, lng: 73.785 } : undefined,
    });
    writeAuthSession(session);
    router.replace(session.setupCompleted ? '/dashboard' : '/setup');
  };

  const continueWithGoogle = () => {
    setMessage(null);
    try {
      window.localStorage.setItem(CONSENT_PENDING_KEY, new Date().toISOString());
      window.location.href = buildSupabaseGoogleOAuthUrl(window.location.origin);
    } catch {
      setMessage({ tone: 'info', text: copy.googleUnavailable });
    }
  };

  const submitOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (otpStage === 'phone') {
      if (phone.length !== 10) {
        setMessage({ tone: 'error', text: copy.missingPhone });
        return;
      }
      setSubmitting(true);
      window.setTimeout(() => {
        setOtpStage('verify');
        setSubmitting(false);
      }, 650);
      return;
    }

    if (otp.length < 4) {
      setMessage({ tone: 'error', text: copy.missingOtp });
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => finishLogin({ mode: 'user', identifier: phone, name: 'Kisan' }), 650);
  };

  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const normalizedIdentifier = identifier.trim().toLowerCase();
    if (!normalizedIdentifier || !password) {
      setMessage({ tone: 'error', text: copy.missingFields });
      return;
    }
    if (password.length < 6) {
      setMessage({ tone: 'error', text: copy.shortPassword });
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      if (accountMode === 'signup') {
        saveLocalAccount({ identifier: normalizedIdentifier, password, name: 'Kisan', language: lang });
        setMessage({ tone: 'info', text: copy.accountCreated });
        finishLogin({ mode: 'user', identifier: normalizedIdentifier, name: 'Kisan' });
        return;
      }

      const account = verifyLocalAccount(normalizedIdentifier, password);
      if (account) {
        finishLogin({ mode: 'user', identifier: normalizedIdentifier, name: account.name });
        return;
      }
      if (normalizedIdentifier === DEMO_IDENTIFIER && password === DEMO_PASSWORD) {
        finishLogin({ mode: 'demo', identifier: normalizedIdentifier, name: 'Asha Pawar', setupCompleted: true });
        return;
      }
      setSubmitting(false);
      setMessage({ tone: 'error', text: copy.badCredentials });
    }, 350);
  };

  const continueAsDemo = () => finishLogin({
    mode: 'demo',
    identifier: 'demo@kisanmitra.local',
    name: 'Asha Pawar',
    setupCompleted: true,
  });

  const rootStyle = {
    '--p1x': '0px',
    '--p1y': '0px',
    '--p2x': '0px',
    '--p2y': '0px',
    '--p3x': '0px',
    '--p3y': '0px',
    '--p4x': '0px',
    '--p4y': '0px',
  } as CSSProperties;

  return (
    <main ref={rootRef} className={styles.root} style={rootStyle}>
      <MorningScene showBird={showBird} />

      <div className={styles.languageControl}>
        <button
          type="button"
          className={styles.globeButton}
          aria-label={copy.changeLanguage}
          aria-expanded={languageMenuOpen}
          aria-controls="login-language-menu"
          onClick={() => setLanguageMenuOpen((open) => !open)}
        >
          <Globe2 aria-hidden="true" size={20} />
        </button>
        {languageMenuOpen && (
          <div id="login-language-menu" className={styles.languageMenu} role="menu" aria-label={copy.changeLanguage}>
            {LOGIN_LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                role="menuitemradio"
                aria-checked={lang === item.code}
                className={`${styles.languageOption} ${lang === item.code ? styles.languageOptionActive : ''}`}
                onClick={() => selectLanguage(item.code)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {languageToast && (
        <div className={styles.languageToast} role="status">
          <span>{copy.languageSuggestion}</span>
          <button type="button" className={styles.toastButton} aria-label={copy.changeLanguage} onClick={() => setLanguageMenuOpen(true)}>
            <Globe2 aria-hidden="true" size={18} />
          </button>
        </div>
      )}

      <div className={styles.layout}>
        <section className={styles.brandStage} aria-label="KisanMitra">
          <div className={styles.brandBlock}>
            <div className={styles.wordViewport} aria-live="polite" aria-atomic="true">
              <h1
                ref={wordmarkRef}
                key={`${wordmark.code}-${wordmarkState.tick}`}
                className={`${styles.word} ${wordmarkFontClass[wordmark.code]} ${wordmarkState.phase === 'exit' ? styles.wordExit : styles.wordEnter} ${wordmark.dir === 'rtl' ? styles.rtl : ''}`}
                lang={wordmark.lang}
                dir={wordmark.dir ?? 'ltr'}
                onAnimationEnd={() => {
                  if (wordmarkState.phase !== 'exit') return;
                  setWordmarkState((current) => ({
                    index: (current.index + 1) % WORDMARKS.length,
                    phase: 'enter',
                    tick: current.tick + 1,
                  }));
                }}
              >
                {wordmark.label}
              </h1>
            </div>
            <span key={`rule-${wordmarkState.tick}`} className={styles.rule} />
            <p className={styles.caption} lang={wordmark.lang} dir={wordmark.dir ?? 'ltr'}>{wordmark.caption}</p>
            <p className={styles.tagline}>{copy.tagline}</p>
            <p className={styles.proof} aria-label={copy.proofLines.join('. ')}>
              <Typewriter key={lang} lines={copy.proofLines} reducedMotion={reducedMotion} className={styles.proofText} />
            </p>
          </div>
        </section>

        <section className={styles.authStage} aria-label={copy.login}>
          <div className={styles.authCard}>
            <button type="button" className={styles.googleButton} onClick={continueWithGoogle} disabled={submitting}>
              <GoogleMark />
              {copy.google}
            </button>

            <div className={styles.divider}>{copy.or}</div>

            {authMethod === 'otp' ? (
              <form className={styles.form} onSubmit={submitOtp} noValidate>
                {otpStage === 'phone' ? (
                  <label className={styles.field}>
                    <Phone className={styles.fieldIcon} aria-hidden="true" />
                    <input
                      className={styles.input}
                      value={phone}
                      onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
                      aria-label={copy.mobileNumber}
                      placeholder={copy.mobileNumber}
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                    />
                  </label>
                ) : (
                  <label className={styles.field}>
                    <Lock className={styles.fieldIcon} aria-hidden="true" />
                    <input
                      className={styles.input}
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                      aria-label={copy.enterOtp}
                      placeholder={copy.enterOtp}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                    />
                  </label>
                )}

                {message && (
                  <p className={`${styles.message} ${message.tone === 'error' ? styles.messageError : styles.messageInfo}`} role={message.tone === 'error' ? 'alert' : 'status'}>
                    {message.text}
                  </p>
                )}

                <button type="submit" className={styles.primaryButton} disabled={submitting}>
                  {submitting && <span className={styles.spinner} aria-hidden="true" />}
                  {submitting ? copy.working : otpStage === 'phone' ? copy.getOtp : copy.verifyOtp}
                </button>
                <button type="button" className={styles.textButton} onClick={() => { setAuthMethod('email'); setMessage(null); }}>
                  {copy.emailLogin}
                </button>
              </form>
            ) : (
              <form className={styles.form} onSubmit={submitEmail} noValidate>
                <label className={styles.field}>
                  <Mail className={styles.fieldIcon} aria-hidden="true" />
                  <input
                    className={styles.input}
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    aria-label={copy.emailIdentifier}
                    placeholder={copy.emailIdentifier}
                    inputMode="email"
                    autoComplete="username"
                  />
                </label>
                <label className={styles.field}>
                  <Lock className={styles.fieldIcon} aria-hidden="true" />
                  <input
                    className={styles.input}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-label={copy.password}
                    placeholder={copy.password}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={accountMode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                    onClick={() => setShowPassword((shown) => !shown)}
                  >
                    {showPassword ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}
                  </button>
                </label>

                {message && (
                  <p className={`${styles.message} ${message.tone === 'error' ? styles.messageError : styles.messageInfo}`} role={message.tone === 'error' ? 'alert' : 'status'}>
                    {message.text}
                  </p>
                )}

                <button type="submit" className={styles.primaryButton} disabled={submitting}>
                  {submitting && <span className={styles.spinner} aria-hidden="true" />}
                  {submitting ? copy.working : accountMode === 'signup' ? copy.createAccount : copy.login}
                </button>

                <div className={styles.formLinks}>
                  <button type="button" className={styles.textButton} onClick={() => { setAccountMode((mode) => mode === 'login' ? 'signup' : 'login'); setMessage(null); }}>
                    {accountMode === 'login' ? copy.createAccount : copy.backToLogin}
                  </button>
                  {accountMode === 'login' && (
                    <button type="button" className={styles.textButton} onClick={() => setMessage({ tone: 'info', text: copy.forgotMessage })}>
                      {copy.forgotPassword}
                    </button>
                  )}
                </div>
                <button type="button" className={styles.textButton} onClick={() => { setAuthMethod('otp'); setMessage(null); }}>
                  {copy.getOtp}
                </button>
              </form>
            )}

            <p className={styles.consent}>
              {copy.consentPrefix}{' '}
              <Link className={styles.inlineLink} href="/privacy">{copy.consentLink}</Link>
            </p>
            <button type="button" className={styles.demoButton} onClick={continueAsDemo}>{copy.demo}</button>
          </div>
        </section>
      </div>
    </main>
  );
}
