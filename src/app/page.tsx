'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Globe2, Leaf, Lock, Mail, Sprout } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { LANGUAGES, TRANSLATIONS, type LanguageCode } from '@/lib/i18n';
import {
  createSession,
  readAuthSession,
  readLocalAccounts,
  saveLocalAccount,
  verifyLocalAccount,
  writeAuthSession,
} from '@/lib/auth-session';

const LANGUAGE_STORAGE_KEY = 'km-lang';

type LoginCopy = {
  appName: string;
  tagline: string;
  problem: string;
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

const LOGIN_COPY: Record<LanguageCode, LoginCopy> = {
  hi: {
    appName: 'KisanMitra Predict',
    tagline: 'नुकसान से पहले, सही फैसला।',
    problem: 'हर साल किसान अपनी फसल का 30% तक खो देता है — बीमारी देर से पकड़ में आती है, गलत समय पर बिकती है, मौसम की चेतावनी नहीं मिलती। KisanMitra पहले बताता है।',
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
    googleUnavailable: 'Google लॉगिन के लिए Supabase सेटअप जोड़ना बाकी है। अभी डेमो देखें।',
  },
  mr: {
    appName: 'KisanMitra Predict',
    tagline: 'नुकसान होण्यापूर्वी, योग्य निर्णय.',
    problem: 'दरवर्षी शेतकरी पिकाचे 30% पर्यंत नुकसान सहन करतो — रोग उशिरा समजतो, विक्री चुकीच्या वेळी होते, हवामानाचा इशारा मिळत नाही. KisanMitra आधी सांगतो.',
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
    googleUnavailable: 'Google लॉगिनसाठी Supabase सेटअप अजून जोडायचा आहे. आत्ता डेमो पाहा.',
  },
  en: {
    appName: 'KisanMitra Predict',
    tagline: 'Before the loss, the right decision.',
    problem: 'Every year a farmer loses up to 30% of the crop — disease is found late, produce sells at the wrong time, and weather warnings arrive too late. KisanMitra tells you first.',
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
    googleUnavailable: 'Google login needs Supabase setup. View the demo for now.',
  },
};

function readSavedLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'hi';
  const savedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
  return savedLang && TRANSLATIONS[savedLang] ? savedLang : 'hi';
}

function isEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
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

  const copy = LOGIN_COPY[lang];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  useEffect(() => {
    const startupTimer = window.setTimeout(() => {
      setLang(readSavedLanguage());
      const session = readAuthSession();
      if (session) router.replace('/dashboard');
    }, 0);
    return () => window.clearTimeout(startupTimer);
  }, [router]);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, [lang]);

  const problemLines = useMemo(() => copy.problem.split(' — '), [copy.problem]);

  const finishLogin = (options: { mode: 'user' | 'demo'; identifier: string; name?: string }) => {
    const session = createSession({ ...options, language: lang });
    writeAuthSession(session);
    router.replace('/dashboard');
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

      if (readLocalAccounts().length === 0) {
        finishLogin({ mode: 'user', identifier: cleanIdentifier, name: isEmail(cleanIdentifier) ? 'Kisan' : 'Asha Pawar' });
        return;
      }

      setSubmitting(false);
      setMessage({ tone: 'error', text: copy.badCredentials });
    }, 250);
  };

  const continueWithGoogle = () => {
    setMessage(null);
    if (!supabaseUrl) {
      setMessage({ tone: 'info', text: copy.googleUnavailable });
      return;
    }
    const redirectTo = `${window.location.origin}/dashboard`;
    window.location.href = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  };

  const continueAsDemo = () => finishLogin({ mode: 'demo', identifier: 'demo@kisanmitra.local', name: 'Asha Pawar' });

  return (
    <main className="auth-canvas relative flex h-[100svh] items-center justify-center overflow-hidden px-3 py-3 text-[#202124] sm:px-6">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-white/80 bg-white/80 p-1 shadow-sm backdrop-blur-xl sm:right-6 sm:top-6">
        {LANGUAGES.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLang(item.code)}
            className={`min-h-10 rounded-full px-3 text-xs font-black transition ${lang === item.code ? 'bg-[#1E8E3E] text-white shadow-sm' : 'text-[#3C4043] hover:bg-white'}`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <section className="auth-card grid max-h-[calc(100svh-24px)] w-full max-w-[440px] grid-rows-[auto_auto_1fr] gap-3 overflow-hidden rounded-[28px] border border-white/90 bg-white/86 p-4 shadow-[0_24px_80px_rgba(60,64,67,0.16)] backdrop-blur-2xl sm:max-w-[480px] sm:p-5">
        <header className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-[#E6F4EA] text-[#137333] shadow-sm">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="text-[25px] font-black leading-tight text-[#123524]">🌾 {copy.appName}</h1>
          <p className="mt-1 text-sm font-extrabold text-[#4F6F58]">{copy.tagline}</p>
        </header>

        <section className="rounded-2xl border border-[#DDE8DE] bg-[#F6FBF6] px-4 py-3 text-center">
          <p className="text-[15px] font-black leading-5 text-[#21452D] sm:text-base">
            {problemLines[0]}
          </p>
          <p className="mt-1 line-clamp-2 text-[13px] font-bold leading-5 text-[#5F6F64] sm:text-sm">{problemLines.slice(1).join(' — ') || copy.problem}</p>
        </section>

        <form onSubmit={submit} className="flex min-h-0 flex-col gap-2.5">
          <label className="relative block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#137333]" />
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="min-h-14 w-full rounded-2xl border border-[#C8D9CC] bg-white pl-12 pr-4 text-lg font-bold text-[#202124] outline-none transition placeholder:text-[#7A857C] focus:border-[#1E8E3E] focus:ring-4 focus:ring-[#E6F4EA]"
              placeholder={copy.identifier}
              inputMode="email"
              autoComplete="username"
            />
          </label>

          <label className="relative block">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#137333]" />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-14 w-full rounded-2xl border border-[#C8D9CC] bg-white pl-12 pr-14 text-lg font-bold text-[#202124] outline-none transition placeholder:text-[#7A857C] focus:border-[#1E8E3E] focus:ring-4 focus:ring-[#E6F4EA]"
              placeholder={copy.password}
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[#3C4043] hover:bg-[#F1F3F4]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </label>

          {message && (
            <p className={`rounded-2xl px-4 py-2 text-sm font-black ${message.tone === 'error' ? 'bg-[#FCE8E6] text-[#B3261E]' : 'bg-[#E8F0FE] text-[#174EA6]'}`}>{message.text}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#1E8E3E] text-lg font-black text-white shadow-[0_12px_26px_rgba(30,142,62,0.28)] transition hover:bg-[#137333] disabled:opacity-70"
          >
            <Leaf className="h-5 w-5" /> {mode === 'signup' ? copy.signupButton : copy.login}
          </button>

          <div className="flex items-center gap-3 text-xs font-black text-[#6B756E]">
            <span className="h-px flex-1 bg-[#DDE5DF]" />
            {copy.or}
            <span className="h-px flex-1 bg-[#DDE5DF]" />
          </div>

          <button
            type="button"
            onClick={continueWithGoogle}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#DADCE0] bg-white text-base font-black text-[#202124] transition hover:bg-[#F8F9FA]"
          >
            <Globe2 className="h-5 w-5 text-[#1A73E8]" /> {copy.google}
          </button>

          <div className="flex items-center justify-center gap-3 text-[13px] font-black">
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); }} className="text-[#137333] hover:underline">
              {mode === 'login' ? copy.signup : copy.loginLink}
            </button>
            <span className="text-[#C8D0CB]">|</span>
            <button type="button" onClick={() => setMessage({ tone: 'info', text: copy.forgotMessage })} className="text-[#5F6368] hover:underline">
              {copy.forgot}
            </button>
          </div>

          <p className="text-center text-[11px] font-bold leading-4 text-[#6A756F]">
            {copy.consentPrefix}{' '}
            <Link href="/privacy" className="text-[#137333] underline underline-offset-2">{copy.consentLink}</Link>
          </p>

          <button type="button" onClick={continueAsDemo} className="mx-auto -mt-1 text-sm font-black text-[#1967D2] hover:underline">
            {copy.demo}
          </button>
        </form>
      </section>
    </main>
  );
}
