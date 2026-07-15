'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CloudRain, Eye, EyeOff, Globe2, Leaf, LineChart, Lock, Mail, ShieldCheck, Sprout } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { LANGUAGES, TRANSLATIONS, type LanguageCode } from '@/lib/i18n';
import { buildSupabaseGoogleOAuthUrl } from '@/lib/supabase-auth';
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
  productName: string;
  productSuffix: string;
  eyebrow: string;
  tagline: string;
  problemLead: string;
  problemDetail: string;
  signInTitle: string;
  signInSubtext: string;
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
  signals: Array<{ label: string; value: string; tone: 'blue' | 'green' | 'amber' }>;
};

const LOGIN_COPY: Record<LanguageCode, LoginCopy> = {
  hi: {
    appName: 'किसानमित्र Predict',
    productName: 'किसानमित्र',
    productSuffix: 'Predict',
    eyebrow: 'आपकी खेती का निर्णय साथी',
    tagline: 'नुकसान से पहले, सही फैसला।',
    problemLead: 'हर साल किसान अपनी फसल का 30% तक खो देता है।',
    problemDetail: 'बीमारी देर से पकड़ में आती है, मौसम की चेतावनी देर से मिलती है, और बाजार का फैसला गलत समय पर होता है।',
    signInTitle: 'अपने खेत का डैशबोर्ड खोलें',
    signInSubtext: 'फसल, मौसम और मंडी सलाह एक जगह।',
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
    signals: [
      { label: 'मौसम', value: 'बारिश 6 बजे', tone: 'blue' },
      { label: 'फसल', value: 'रोग जोखिम कम', tone: 'green' },
      { label: 'मंडी', value: 'टमाटर ऊपर', tone: 'amber' },
    ],
  },
  mr: {
    appName: 'किसानमित्र Predict',
    productName: 'किसानमित्र',
    productSuffix: 'Predict',
    eyebrow: 'तुमच्या शेतीचा निर्णय साथी',
    tagline: 'नुकसान होण्यापूर्वी, योग्य निर्णय.',
    problemLead: 'दरवर्षी शेतकरी पिकाचे 30% पर्यंत नुकसान सहन करतो.',
    problemDetail: 'रोग उशिरा समजतो, हवामानाचा इशारा उशिरा मिळतो, आणि बाजाराचा निर्णय चुकीच्या वेळी होतो.',
    signInTitle: 'तुमचा शेती डॅशबोर्ड उघडा',
    signInSubtext: 'पीक, हवामान आणि मंडी सल्ला एका ठिकाणी.',
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
    signals: [
      { label: 'हवामान', value: 'पाऊस 6 वाजता', tone: 'blue' },
      { label: 'पीक', value: 'रोग धोका कमी', tone: 'green' },
      { label: 'मंडी', value: 'टोमॅटो वर', tone: 'amber' },
    ],
  },
  en: {
    appName: 'KisanMitra Predict',
    productName: 'KisanMitra',
    productSuffix: 'Predict',
    eyebrow: 'Decision support for every farm',
    tagline: 'Before the loss, the right decision.',
    problemLead: 'Farmers lose up to 30% of a crop every year.',
    problemDetail: 'Disease is found late, weather warnings arrive late, and market decisions happen at the wrong time.',
    signInTitle: 'Open your farm dashboard',
    signInSubtext: 'Crop, weather, and mandi advice in one place.',
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
    signals: [
      { label: 'Weather', value: 'Rain at 6 PM', tone: 'blue' },
      { label: 'Crop', value: 'Disease risk low', tone: 'green' },
      { label: 'Mandi', value: 'Tomato rising', tone: 'amber' },
    ],
  },
};

const SIGNAL_ICONS = {
  blue: CloudRain,
  green: ShieldCheck,
  amber: LineChart,
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
    try {
      window.location.href = buildSupabaseGoogleOAuthUrl(window.location.origin);
    } catch {
      setMessage({ tone: 'info', text: copy.googleUnavailable });
    }
  };

  const continueAsDemo = () => finishLogin({ mode: 'demo', identifier: 'demo@kisanmitra.local', name: 'Asha Pawar' });

  return (
    <main className="auth-canvas auth-page relative flex h-[100svh] items-center justify-center overflow-hidden px-4 py-4 text-[#202124] sm:px-6">
      <div className="auth-language-switch absolute right-4 top-4 z-20 flex items-center gap-1 border border-[#DADCE0] bg-white p-1 shadow-sm sm:right-6 sm:top-6">
        {LANGUAGES.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLang(item.code)}
            aria-pressed={lang === item.code}
            className={`min-h-10 px-4 text-sm font-bold transition ${lang === item.code ? 'bg-[#1A73E8] text-white shadow-sm' : 'text-[#3C4043] hover:bg-[#F8F9FA]'}`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <section className="auth-stage grid max-h-[calc(100svh-32px)] w-full max-w-[1120px] overflow-hidden border border-[#E6EAEE] bg-white shadow-[0_24px_80px_rgba(60,64,67,0.14)] md:grid-cols-[minmax(0,1.12fr)_420px]">
        <section className="auth-hero-panel hidden min-h-0 flex-col justify-between overflow-hidden p-10 md:flex lg:p-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="auth-mark flex h-12 w-12 items-center justify-center border border-[#DADCE0] bg-white text-[#188038] shadow-sm">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#5F6368]">{copy.eyebrow}</p>
                <p className="text-xs font-bold uppercase text-[#188038]">KisanMitra AI</p>
              </div>
            </div>

            <div className="mt-12">
              <h1 className="auth-wordmark text-7xl font-black leading-none text-[#202124] lg:text-8xl">{copy.productName}</h1>
              <p className="mt-3 inline-flex items-center gap-2 border border-[#DADCE0] bg-white px-3 py-2 text-lg font-black text-[#1A73E8] shadow-sm">
                <Leaf className="h-5 w-5 text-[#188038]" /> {copy.productSuffix}
              </p>
              <p className="mt-6 max-w-xl text-2xl font-black leading-snug text-[#202124]">{copy.tagline}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="auth-problem-card border border-[#DADCE0] bg-white p-5 shadow-sm">
              <p className="text-lg font-black leading-6 text-[#202124]">{copy.problemLead}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#5F6368]">{copy.problemDetail}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {copy.signals.map((signal) => {
                const Icon = SIGNAL_ICONS[signal.tone];
                return (
                  <div key={`${signal.label}-${signal.value}`} className={`auth-signal auth-signal-${signal.tone} border bg-white p-4 shadow-sm`}>
                    <Icon className="h-5 w-5" />
                    <p className="mt-3 text-xs font-black uppercase text-[#5F6368]">{signal.label}</p>
                    <p className="mt-1 text-sm font-black text-[#202124]">{signal.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="auth-card auth-login-panel flex min-h-0 flex-col justify-center overflow-hidden bg-white p-5 sm:p-7 md:border-l md:border-[#E6EAEE]">
          <header className="mb-5 text-left md:mb-7">
            <div className="mb-4 flex items-center gap-3 md:hidden">
              <div className="auth-mark flex h-11 w-11 items-center justify-center border border-[#DADCE0] bg-white text-[#188038] shadow-sm">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-black leading-tight text-[#202124]">{copy.productName}</h1>
                <p className="text-sm font-black text-[#1A73E8]">{copy.productSuffix}</p>
              </div>
            </div>
            <p className="text-2xl font-black leading-tight text-[#202124] md:text-3xl">{copy.signInTitle}</p>
            <p className="mt-2 text-sm font-bold leading-5 text-[#5F6368]">{copy.signInSubtext}</p>
          </header>

          <form onSubmit={submit} className="flex min-h-0 flex-col gap-3">
            <label className="auth-field relative block">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#188038]" />
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="min-h-14 w-full border border-[#DADCE0] bg-white pl-12 pr-4 text-lg font-bold text-[#202124] outline-none transition placeholder:text-[#80868B] focus:border-[#1A73E8] focus:ring-4 focus:ring-[#E8F0FE]"
                placeholder={copy.identifier}
                inputMode="email"
                autoComplete="username"
              />
            </label>

            <label className="auth-field relative block">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#188038]" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-14 w-full border border-[#DADCE0] bg-white pl-12 pr-14 text-lg font-bold text-[#202124] outline-none transition placeholder:text-[#80868B] focus:border-[#1A73E8] focus:ring-4 focus:ring-[#E8F0FE]"
                placeholder={copy.password}
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[#3C4043] hover:bg-[#F1F3F4]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </label>

            {message && (
              <p className={`border px-4 py-3 text-sm font-black ${message.tone === 'error' ? 'border-[#F4AEA7] bg-[#FCE8E6] text-[#B3261E]' : 'border-[#C2D7FF] bg-[#E8F0FE] text-[#174EA6]'}`}>{message.text}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-14 w-full items-center justify-center gap-2 bg-[#1E8E3E] text-lg font-black text-white shadow-[0_12px_26px_rgba(30,142,62,0.22)] transition hover:bg-[#188038] disabled:opacity-70"
            >
              <Leaf className="h-5 w-5" /> {mode === 'signup' ? copy.signupButton : copy.login}
            </button>

            <div className="flex items-center gap-3 text-xs font-black text-[#6B756E]">
              <span className="h-px flex-1 bg-[#DADCE0]" />
              {copy.or}
              <span className="h-px flex-1 bg-[#DADCE0]" />
            </div>

            <button
              type="button"
              onClick={continueWithGoogle}
              className="flex min-h-14 w-full items-center justify-center gap-2 border border-[#DADCE0] bg-white text-base font-black text-[#202124] transition hover:bg-[#F8F9FA]"
            >
              <Globe2 className="h-5 w-5 text-[#1A73E8]" /> {copy.google}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-3 text-[13px] font-black">
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); }} className="text-[#188038] hover:underline">
                {mode === 'login' ? copy.signup : copy.loginLink}
              </button>
              <span className="text-[#DADCE0]">|</span>
              <button type="button" onClick={() => setMessage({ tone: 'info', text: copy.forgotMessage })} className="text-[#5F6368] hover:underline">
                {copy.forgot}
              </button>
            </div>

            <p className="text-center text-[11px] font-bold leading-4 text-[#6A756F]">
              {copy.consentPrefix}{' '}
              <Link href="/privacy" className="text-[#188038] underline underline-offset-2">{copy.consentLink}</Link>
            </p>

            <button type="button" onClick={continueAsDemo} className="mx-auto text-sm font-black text-[#1A73E8] hover:underline">
              {copy.demo}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
