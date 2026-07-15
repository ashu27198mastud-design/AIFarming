'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Leaf, Lock, Mail, Wheat } from 'lucide-react';
import { Fragment, FormEvent, useEffect, useState } from 'react';
import { TRANSLATIONS, type LanguageCode } from '@/lib/i18n';
import { buildSupabaseGoogleOAuthUrl } from '@/lib/supabase-auth';
import {
  clearAuthSession,
  createSession,
  readAuthSession,
  saveLocalAccount,
  verifyLocalAccount,
  writeAuthSession,
} from '@/lib/auth-session';

const LANGUAGE_STORAGE_KEY = 'km-lang';
const LANGUAGE_OVERRIDE_STORAGE_KEY = 'km-lang-override';
const WORDMARK_INTERVAL_MS = 2500;
const DEMO_IDENTIFIER = 'asha@kisanmitra.demo';
const DEMO_PASSWORD = 'Kisan123';

type LoginCopy = {
  tagline: string;
  identifier: string;
  password: string;
  login: string;
  signupButton: string;
  google: string;
  or: string;
  signup: string;
  loginLink: string;
  forgot: string;
  consentPrefix: string;
  consentLink: string;
  demo: string;
  badCredentials: string;
  shortPassword: string;
  missingFields: string;
  accountCreated: string;
  forgotMessage: string;
  googleUnavailable: string;
};

type Wordmark = {
  code: string;
  label: string;
  lang: string;
  dir?: 'ltr' | 'rtl';
};

type WordmarkState = {
  current: number;
  previous: number | null;
  tick: number;
};

const UI_LANGUAGES: Array<{ code: LanguageCode; label: string; aria: string }> = [
  { code: 'hi', label: 'हिं', aria: 'Hindi' },
  { code: 'mr', label: 'मराठी', aria: 'Marathi' },
  { code: 'en', label: 'EN', aria: 'English' },
];

const WORDMARKS: Wordmark[] = [
  { code: 'hi', label: 'किसानमित्र', lang: 'hi' },
  { code: 'bn', label: 'কিষাণমিত্র', lang: 'bn' },
  { code: 'te', label: 'కిసాన్‌మిత్ర', lang: 'te' },
  { code: 'mr', label: 'किसानमित्र', lang: 'mr' },
  { code: 'ta', label: 'கிசான்மித்ரா', lang: 'ta' },
  { code: 'ur', label: 'کسان متر', lang: 'ur', dir: 'rtl' },
  { code: 'gu', label: 'કિસાનમિત્ર', lang: 'gu' },
  { code: 'kn', label: 'ಕಿಸಾನ್‌ಮಿತ್ರ', lang: 'kn' },
  { code: 'ml', label: 'കിസാൻമിത്ര', lang: 'ml' },
  { code: 'or', label: 'କିଷାଣମିତ୍ର', lang: 'or' },
  { code: 'pa', label: 'ਕਿਸਾਨਮਿੱਤਰ', lang: 'pa' },
  { code: 'as', label: 'কিষাণমিত্ৰ', lang: 'as' },
  { code: 'mai', label: 'किसानमित्र', lang: 'mai' },
  { code: 'sat', label: 'ᱠᱤᱥᱟᱱᱢᱤᱛᱨᱚ', lang: 'sat' },
  { code: 'ks', label: 'کِسان مِتر', lang: 'ks', dir: 'rtl' },
  { code: 'ne', label: 'किसानमित्र', lang: 'ne' },
  { code: 'sd', label: 'ڪسان متر', lang: 'sd', dir: 'rtl' },
  { code: 'doi', label: 'किसानमित्र', lang: 'doi' },
  { code: 'kok', label: 'किसानमित्र', lang: 'kok' },
  { code: 'mni', label: 'ꯀꯤꯁꯥꯟꯃꯤꯇ꯭ꯔ', lang: 'mni' },
  { code: 'brx', label: 'किसानमित्र', lang: 'brx' },
  { code: 'sa', label: 'कृषकमित्रम्', lang: 'sa' },
  { code: 'en', label: 'KisanMitra', lang: 'en' },
];

const LOGIN_COPY: Record<LanguageCode, LoginCopy> = {
  hi: {
    tagline: 'नुकसान से पहले, सही फैसला।',
    identifier: 'मोबाइल नंबर या ईमेल',
    password: 'पासवर्ड',
    login: 'लॉगिन करें',
    signupButton: 'खाता बनाएं',
    google: 'Google से जारी रखें',
    or: 'या',
    signup: 'नया खाता बनाएं',
    loginLink: 'लॉगिन पर लौटें',
    forgot: 'पासवर्ड भूल गए?',
    consentPrefix: 'लॉगिन करके आप सहमत हैं — आपका डेटा केवल आपकी खेती की सलाह के लिए।',
    consentLink: 'गोपनीयता',
    demo: 'बिना लॉगिन देखें (डेमो)',
    badCredentials: 'मोबाइल/ईमेल या पासवर्ड सही नहीं है।',
    shortPassword: 'पासवर्ड कम से कम 6 अक्षर का रखें।',
    missingFields: 'मोबाइल/ईमेल और पासवर्ड भरें।',
    accountCreated: 'खाता बन गया। अब डैशबोर्ड खोल रहे हैं।',
    forgotMessage: 'पासवर्ड रीसेट जल्द आएगा। अभी नया खाता बनाएं या डेमो देखें।',
    googleUnavailable: 'Google लॉगिन अभी पूरा नहीं हुआ। डेमो देखें या फिर कोशिश करें।',
  },
  mr: {
    tagline: 'नुकसान होण्यापूर्वी, योग्य निर्णय.',
    identifier: 'मोबाइल नंबर किंवा ईमेल',
    password: 'पासवर्ड',
    login: 'लॉगिन करा',
    signupButton: 'खाते तयार करा',
    google: 'Google ने पुढे चला',
    or: 'किंवा',
    signup: 'नवे खाते तयार करा',
    loginLink: 'लॉगिनवर परत या',
    forgot: 'पासवर्ड विसरलात?',
    consentPrefix: 'लॉगिन करून आपण सहमत आहात — आपला डेटा फक्त शेतीच्या सल्ल्यासाठी वापरला जाईल.',
    consentLink: 'गोपनीयता',
    demo: 'लॉगिन शिवाय पाहा (डेमो)',
    badCredentials: 'मोबाइल/ईमेल किंवा पासवर्ड बरोबर नाही.',
    shortPassword: 'पासवर्ड किमान 6 अक्षरांचा ठेवा.',
    missingFields: 'मोबाइल/ईमेल आणि पासवर्ड भरा.',
    accountCreated: 'खाते तयार झाले. आता डॅशबोर्ड उघडत आहे.',
    forgotMessage: 'पासवर्ड रीसेट लवकरच येईल. आत्ता नवे खाते तयार करा किंवा डेमो पाहा.',
    googleUnavailable: 'Google लॉगिन अजून पूर्ण झाले नाही. डेमो पाहा किंवा पुन्हा प्रयत्न करा.',
  },
  en: {
    tagline: 'Before the loss, the right decision.',
    identifier: 'Mobile number or email',
    password: 'Password',
    login: 'Log in',
    signupButton: 'Create account',
    google: 'Continue with Google',
    or: 'or',
    signup: 'Create new account',
    loginLink: 'Back to login',
    forgot: 'Forgot password?',
    consentPrefix: 'By logging in you agree — your data is used only for your farming advice.',
    consentLink: 'Privacy',
    demo: 'View without login (demo)',
    badCredentials: 'The mobile/email or password is not correct.',
    shortPassword: 'Use a password with at least 6 characters.',
    missingFields: 'Enter mobile/email and password.',
    accountCreated: 'Account created. Opening your dashboard.',
    forgotMessage: 'Password reset is coming soon. Create a new account or view the demo for now.',
    googleUnavailable: 'Google login could not be completed yet. View the demo or try again.',
  },
};

function readSavedLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'hi';
  const savedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
  return savedLang && TRANSLATIONS[savedLang] ? savedLang : 'hi';
}

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

function GoogleGIcon() {
  return (
    <svg aria-hidden="true" className="auth-google-g" viewBox="0 0 24 24" focusable="false">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<LanguageCode>('hi');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState<{ tone: 'error' | 'info'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [wordmarkState, setWordmarkState] = useState<WordmarkState>({ current: 0, previous: null, tick: 0 });
  const [toast, setToast] = useState<string | null>(null);

  const copy = LOGIN_COPY[lang];
  const wordmark = WORDMARKS[wordmarkState.current];
  const previousWordmark = wordmarkState.previous === null ? null : WORDMARKS[wordmarkState.previous];

  const handleLangChange = (code: LanguageCode) => {
    setLang(code);
    window.localStorage.setItem(LANGUAGE_OVERRIDE_STORAGE_KEY, 'true');
  };

  useEffect(() => {
    const hasOverride = window.localStorage.getItem(LANGUAGE_OVERRIDE_STORAGE_KEY) === 'true';
    const savedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    let toastTimer: number | undefined;

    if (!hasOverride && !savedLang && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (latitude >= 15.6 && latitude <= 22.0 && longitude >= 72.6 && longitude <= 80.9) {
            setLang('mr');
            setToast(TRANSLATIONS.mr.langAutoSwitched);
            toastTimer = window.setTimeout(() => setToast(null), 3000);
          }
        },
        undefined,
        { timeout: 5000 }
      );
    }
    return () => {
      if (toastTimer) window.clearTimeout(toastTimer);
    };
  }, []);

  useEffect(() => {
    const startupTimer = window.setTimeout(() => {
      setLang(readSavedLanguage());
      const forceLogin = new URLSearchParams(window.location.search).get('login') === '1';
      if (forceLogin) {
        clearAuthSession();
        window.history.replaceState(null, '', '/');
        return;
      }

      const session = readAuthSession();
      if (session) {
        if (!session.setupCompleted) {
          router.replace('/setup');
        } else {
          router.replace('/dashboard');
        }
      }
    }, 0);
    return () => window.clearTimeout(startupTimer);
  }, [router]);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    if (!('matchMedia' in window)) return undefined;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let intervalId: number | undefined;
    let startupTimer: number | undefined;

    const startCycle = () => {
      if (intervalId) window.clearInterval(intervalId);
      if (startupTimer) window.clearTimeout(startupTimer);

      if (motionQuery.matches) {
        startupTimer = window.setTimeout(() => setWordmarkState({ current: 0, previous: null, tick: 0 }), 0);
        return;
      }

      intervalId = window.setInterval(() => {
        setWordmarkState((current) => {
          const next = (current.current + 1) % WORDMARKS.length;
          return { current: next, previous: current.current, tick: current.tick + 1 };
        });
      }, WORDMARK_INTERVAL_MS);
    };

    const legacyMotionQuery = motionQuery as MediaQueryList & {
      addListener?: (listener: () => void) => void;
      removeListener?: (listener: () => void) => void;
    };

    startCycle();
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', startCycle);
    } else {
      legacyMotionQuery.addListener?.(startCycle);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      if (startupTimer) window.clearTimeout(startupTimer);
      if (typeof motionQuery.removeEventListener === 'function') {
        motionQuery.removeEventListener('change', startCycle);
      } else {
        legacyMotionQuery.removeListener?.(startCycle);
      }
    };
  }, []);

  const finishLogin = (options: { mode: 'user' | 'demo'; identifier: string; name?: string }) => {
    const session = createSession({ ...options, language: lang });
    writeAuthSession(session);
    if (!session.setupCompleted) {
      router.replace('/setup');
    } else {
      router.replace('/dashboard');
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const cleanIdentifier = normalizeIdentifier(identifier);
    if (!cleanIdentifier || !password) {
      setMessage({ tone: 'error', text: copy.missingFields });
      return;
    }
    if (password.length < 6) {
      setMessage({ tone: 'error', text: copy.shortPassword });
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      if (mode === 'signup') {
        saveLocalAccount({ identifier: cleanIdentifier, password, name: 'Kisan', language: lang });
        setMessage({ tone: 'info', text: copy.accountCreated });
        finishLogin({ mode: 'user', identifier: cleanIdentifier, name: 'Kisan' });
        return;
      }

      const account = verifyLocalAccount(cleanIdentifier, password);
      if (account) {
        finishLogin({ mode: 'user', identifier: cleanIdentifier, name: account.name });
        return;
      }

      if (cleanIdentifier === DEMO_IDENTIFIER && password === DEMO_PASSWORD) {
        finishLogin({ mode: 'demo', identifier: cleanIdentifier, name: 'Asha Pawar' });
        return;
      }

      setSubmitting(false);
      setMessage({ tone: 'error', text: copy.badCredentials });
    }, 250);
  };

  const continueWithGoogle = () => {
    setMessage(null);
    try {
      window.location.href = buildSupabaseGoogleOAuthUrl(window.location.origin);
    } catch {
      setMessage({ tone: 'info', text: copy.googleUnavailable });
    }
  };

  const continueAsDemo = () => finishLogin({ mode: 'demo', identifier: 'demo@kisanmitra.local', name: 'Asha Pawar' });

  return (
    <main className="auth-minimal animate-fade-slide-up">
      {toast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-3 text-sm font-bold text-[#1F6B4F] shadow-lg backdrop-blur-xl animate-fade-slide-up">
          <Leaf className="h-4 w-4 animate-pulse-slow" />
          <span>{toast}</span>
        </div>
      )}
      <div className="auth-aurora" aria-hidden="true" />
      <div className="auth-glass-field" aria-hidden="true">
        <span className="auth-glass-piece auth-glass-piece-1" />
        <span className="auth-glass-piece auth-glass-piece-2"><Wheat /></span>
        <span className="auth-glass-piece auth-glass-piece-3" />
        <span className="auth-glass-piece auth-glass-piece-4"><Leaf /></span>
        <span className="auth-glass-piece auth-glass-piece-5" />
        <span className="auth-glass-piece auth-glass-piece-6" />
      </div>

      <nav className="auth-language-links" aria-label={copy.tagline}>
        {UI_LANGUAGES.map((item, index) => (
          <Fragment key={item.code}>
            {index > 0 && <span aria-hidden="true">|</span>}
            <button
              type="button"
              onClick={() => handleLangChange(item.code)}
              aria-label={item.aria}
              aria-pressed={lang === item.code}
              className={lang === item.code ? 'auth-language-active' : undefined}
            >
              {item.label}
            </button>
          </Fragment>
        ))}
      </nav>

      <section className="auth-minimal-column" aria-label={copy.login}>
        <header className="auth-wordmark-block">
          <div className="auth-wordmark-viewport" aria-live="polite">
            {previousWordmark && (
              <span
                key={`previous-${wordmarkState.tick}`}
                aria-hidden="true"
                className="auth-cycle-word auth-cycle-word-exit"
                dir={previousWordmark.dir || 'ltr'}
                lang={previousWordmark.lang}
              >
                {previousWordmark.label}
              </span>
            )}
            <h1
              key={`current-${wordmarkState.tick}`}
              className="auth-cycle-word auth-cycle-word-enter"
              dir={wordmark.dir || 'ltr'}
              lang={wordmark.lang}
            >
              {wordmark.label}
            </h1>
          </div>
          <span key={`rule-${wordmarkState.tick}`} className="auth-tricolor-rule" aria-hidden="true" />
          <p className="auth-tagline">{copy.tagline}</p>
        </header>

        <section className="auth-login-card" aria-label={copy.login}>
          <form onSubmit={submit} className="auth-login-form">
            <label className="auth-input-wrap">
              <Mail aria-hidden="true" className="auth-input-icon" />
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder={copy.identifier}
                aria-label={copy.identifier}
                inputMode="email"
                autoComplete="username"
              />
            </label>

            <label className="auth-input-wrap">
              <Lock aria-hidden="true" className="auth-input-icon" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={copy.password}
                aria-label={copy.password}
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="auth-eye-button"
                aria-label={copy.password}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </label>

            {message && <p className={`auth-message auth-message-${message.tone}`}>{message.text}</p>}

            <button type="submit" disabled={submitting} className="auth-primary-button">
              {mode === 'signup' ? copy.signupButton : copy.login}
            </button>

            <div className="auth-divider">
              <span />
              <strong>{copy.or}</strong>
              <span />
            </div>

            <button type="button" onClick={continueWithGoogle} className="auth-google-button">
              <GoogleGIcon />
              {copy.google}
            </button>

            <div className="auth-form-links">
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); }}>
                {mode === 'login' ? copy.signup : copy.loginLink}
              </button>
              <span aria-hidden="true">·</span>
              <button type="button" onClick={() => setMessage({ tone: 'info', text: copy.forgotMessage })}>
                {copy.forgot}
              </button>
            </div>

            <p className="auth-consent">
              {copy.consentPrefix}{' '}
              <Link href="/privacy">{copy.consentLink}</Link>
            </p>

            <button type="button" onClick={continueAsDemo} className="auth-demo-link">
              {copy.demo}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
