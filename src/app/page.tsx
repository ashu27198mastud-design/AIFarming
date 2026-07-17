'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Phone, Globe } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { TRANSLATIONS, type LanguageCode } from '@/lib/i18n';
import AnvayaLanding from '@/components/AnvayaLanding';
import { buildSupabaseGoogleOAuthUrl } from '@/lib/supabase-auth';
import {
  clearAuthSession,
  createSession,
  saveLocalAccount,
  verifyLocalAccount,
  writeAuthSession,
} from '@/lib/auth-session';

const LANGUAGE_STORAGE_KEY = 'km-lang';
const LANGUAGE_OVERRIDE_STORAGE_KEY = 'km-lang-override';
const WORDMARK_INTERVAL_MS = 2000;
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
  mobileNumber: string;
  getOtp: string;
  enterOtp: string;
  verifyOtp: string;
  continueWithEmail: string;
};

type Wordmark = {
  code: string;
  label: string;
  lang: string;
  dir?: 'ltr' | 'rtl';
};

type WordmarkState = {
  current: number;
  isExiting: boolean;
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
  { code: 'te', label: 'కిసాన్మిత్ర', lang: 'te' },
  { code: 'mr', label: 'किसानमित्र', lang: 'mr' },
  { code: 'ta', label: 'கிசான்மித்ரா', lang: 'ta' },
  { code: 'ur', label: 'کسان متر', lang: 'ur', dir: 'rtl' },
  { code: 'gu', label: 'કિસાનમિત્ર', lang: 'gu' },
  { code: 'kn', label: 'ಕಿಸಾನ್ಮಿತ್ರ', lang: 'kn' },
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
    mobileNumber: 'मोबाइल नंबर',
    getOtp: 'OTP प्राप्त करें',
    enterOtp: 'OTP दर्ज करें',
    verifyOtp: 'OTP सत्यापित करें',
    continueWithEmail: 'ईमेल व पासवर्ड से लॉगिन करें',
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
    mobileNumber: 'मोबाइल नंबर',
    getOtp: 'OTP मिळवा',
    enterOtp: 'OTP टाका',
    verifyOtp: 'OTP तपासा',
    continueWithEmail: 'ईमेल आणि पासवर्डने लॉगिन करा',
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
    mobileNumber: 'Mobile Number',
    getOtp: 'Get OTP',
    enterOtp: 'Enter OTP',
    verifyOtp: 'Verify OTP',
    continueWithEmail: 'Continue with Email & Password',
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

function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrast(rgb1: [number, number, number], rgb2: [number, number, number]) {
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function useContrastChecker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const timer = setTimeout(() => {
      const root = document.querySelector('.auth-cinema-root');
      if (!root) return;
      const styles = getComputedStyle(root);
      const bgTop = styles.getPropertyValue('--scene-bg-top').trim();
      const bgBottom = styles.getPropertyValue('--scene-bg-bottom').trim();
      const ink = styles.getPropertyValue('--scene-ink').trim();

      if (!bgTop || !bgBottom || !ink) return;
      try {
        const rgbTop = hexToRgb(bgTop);
        const rgbBottom = hexToRgb(bgBottom);
        const rgbInk = hexToRgb(ink);

        const contrastTop = getContrast(rgbTop, rgbInk);
        const contrastBottom = getContrast(rgbBottom, rgbInk);
        const lowestContrast = Math.min(contrastTop, contrastBottom);
        
        if (lowestContrast < 4.5) {
          console.error(`[Contrast Checker] ❌ FAIL in Morning Light: Ratio is ${lowestContrast.toFixed(2)}:1 (Required: 7:1 for display, 4.5:1 for body).`);
        } else if (lowestContrast < 7) {
          console.warn(`[Contrast Checker] ⚠️ WARN in Morning Light: Ratio is ${lowestContrast.toFixed(2)}:1 (Passes Body 4.5, Fails Display 7.0).`);
        } else {
          console.log(`[Contrast Checker] ✅ PASS in Morning Light: Ratio is ${lowestContrast.toFixed(2)}:1.`);
        }
      } catch (e) {
        // ignore non-hex parses
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);
}

function GoogleGIcon() {
  return (
    <svg aria-hidden="true" className="auth-google-g" viewBox="0 0 24 24" focusable="false" style={{ width: '20px', height: '20px' }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function useTypewriter(lines: string[]) {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: number;
    const currentLine = lines[index];

    if (isDeleting) {
      if (text === '') {
        timer = window.setTimeout(() => {
          setIsDeleting(false);
          setIndex((i) => (i + 1) % lines.length);
        }, 200);
      } else {
        timer = window.setTimeout(() => {
          setText(text.substring(0, text.length - 1));
        }, 30);
      }
    } else {
      if (text === currentLine) {
        timer = window.setTimeout(() => {
          setIsDeleting(true);
        }, 4000); // Hold 4s
      } else {
        timer = window.setTimeout(() => {
          setText(currentLine.substring(0, text.length + 1));
        }, 60); // 60ms/char
      }
    }
    return () => window.clearTimeout(timer);
  }, [text, isDeleting, index, lines]);

  return text;
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
  const [wordmarkState, setWordmarkState] = useState<WordmarkState>({ current: 0, tick: 0, isExiting: false });
  const [showLogin, setShowLogin] = useState(false);

  const copy = LOGIN_COPY[lang];
  const t = TRANSLATIONS[lang];
  const proofLines = t.proofLines;
  const typedProof = useTypewriter(proofLines);

  const wordmark = WORDMARKS[wordmarkState.current];

  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('otp');
  const [otpStage, setOtpStage] = useState<'phone' | 'verify'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [parallaxTarget, setParallaxTarget] = useState({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useContrastChecker();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 60; // Increased amplitude to notice planes
      const y = (e.clientY / window.innerHeight - 0.5) * 60;
      setParallaxTarget({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;
    
    const updateParallax = () => {
      setParallax((current) => ({
        x: lerp(current.x, parallaxTarget.x, 0.06),
        y: lerp(current.y, parallaxTarget.y, 0.06)
      }));
      animationFrameId = requestAnimationFrame(updateParallax);
    };
    animationFrameId = requestAnimationFrame(updateParallax);
    return () => cancelAnimationFrame(animationFrameId);
  }, [parallaxTarget]);

  const handleLangChange = (code: LanguageCode) => {
    setLang(code);
    window.localStorage.setItem(LANGUAGE_OVERRIDE_STORAGE_KEY, 'true');
  };

  useEffect(() => {
    const startupTimer = window.setTimeout(() => {
      setLang(readSavedLanguage());
      const forceLogin = new URLSearchParams(window.location.search).get('login') === '1';
      if (forceLogin) {
        clearAuthSession();
        setShowLogin(true);
        window.history.replaceState(null, '', '/');
        return;
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
        startupTimer = window.setTimeout(() => setWordmarkState({ current: 0, tick: 0, isExiting: false }), 0);
        return;
      }

      intervalId = window.setInterval(() => {
        setWordmarkState((current) => ({ ...current, isExiting: true }));
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

  const handleOtpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (otpStage === 'phone') {
      if (identifier.length < 10) {
        setMessage({ tone: 'error', text: copy.missingFields });
        return;
      }
      setSubmitting(true);
      window.setTimeout(() => {
        setOtpStage('verify');
        setSubmitting(false);
      }, 800);
    } else {
      if (otpCode.length < 4) {
        setMessage({ tone: 'error', text: copy.shortPassword });
        return;
      }
      setSubmitting(true);
      window.setTimeout(() => {
        if (identifier === '9999999999' && otpCode === '1234') {
          finishLogin({ mode: 'demo', identifier: 'demo@kisanmitra.local', name: 'Asha Pawar' });
        } else {
          finishLogin({ mode: 'user', identifier: identifier, name: 'Farmer' });
        }
      }, 800);
    }
  };

  if (!showLogin) {
    return (
      <AnvayaLanding
        lang={lang}
        onLanguageChange={handleLangChange}
        onDemo={continueAsDemo}
        onLogin={() => setShowLogin(true)}
      />
    );
  }

  return (
    <main 
      className={`auth-cinema-root`} 
      style={{ 
        '--px-l1': `${parallax.x * 0.02}px`, '--py-l1': `${parallax.y * 0.02}px`, 
        '--px-l2': `${parallax.x * 0.05}px`, '--py-l2': `${parallax.y * 0.05}px`, 
        '--px-l3': `${parallax.x * 0.09}px`, '--py-l3': `${parallax.y * 0.09}px`, 
        '--px-l4': `${parallax.x * 0.14}px`, '--py-l4': `${parallax.y * 0.14}px` 
      } as React.CSSProperties}
    >
      <div className="absolute top-6 right-8 z-50">
        <button 
          onClick={() => setShowLangMenu(!showLangMenu)} 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,255,255,0.72)] border border-[rgba(255,255,255,0.85)] shadow-sm backdrop-blur-md text-[#1F2A1F] hover:bg-[rgba(255,255,255,0.92)] transition-colors"
          aria-label="Change Language"
        >
          <Globe className="h-5 w-5" />
        </button>
        {showLangMenu && (
          <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.82)] border border-[rgba(255,255,255,0.85)] shadow-xl backdrop-blur-xl animate-fade-slide-up">
            {UI_LANGUAGES.map((item) => (
              <button
                key={item.code}
                onClick={() => { handleLangChange(item.code); setShowLangMenu(false); }}
                className={`flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[#1F2A1F] hover:bg-[#188038]/10 transition-colors ${lang === item.code ? 'bg-[#188038]/5 text-[#188038]' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="auth-plane-0" aria-hidden="true">
        <div className="morning-sun" />
      </div>

      <div className="auth-plane-1" aria-hidden="true">
        <div className="morning-cloud-shadow" />
        <svg viewBox="0 0 24 24" className="dawn-bird">
          <path d="M22.5,12.5 Q18,9 12,12 Q6,9 1.5,12 Q6,14 12,12 Q18,14 22.5,12.5 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="auth-plane-2" aria-hidden="true">
        <div className="morning-motes">
          <div className="morning-mote mote-1" />
          <div className="morning-mote mote-2" />
        </div>
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[18%] opacity-60 text-[rgba(24,128,56,0.10)] stroke-current fill-none" style={{ filter: 'blur(2px)' }}>
          <path d="M0,150 Q200,140 400,160 T800,150 T1200,170 T1440,140" strokeWidth="1.5" />
          <path d="M380,155 Q375,130 390,120 Q405,110 415,120 Q425,110 440,120 Q450,135 440,155 Z" strokeWidth="1.5" />
          <line x1="410" y1="155" x2="410" y2="165" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="auth-plane-3" aria-hidden="true">
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className={`absolute bottom-0 w-[110%] -left-[5%] h-[20%] fill-none stroke-[rgba(24,128,56,0.22)] drop-shadow-[0_-1px_0_rgba(255,190,100,0.35)]`}>
          <path d="M0,150 Q200,140 400,160 T800,150 T1200,170 T1440,140" strokeWidth="1.5" />
          <path d="M200,180 L180,200 M300,175 L290,200 M600,165 L580,200 M900,165 L890,200 M1200,185 L1190,200" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M380,155 Q375,130 390,120 Q405,110 415,120 Q425,110 440,120 Q450,135 440,155 Z" strokeWidth="1.5" />
          <line x1="410" y1="155" x2="410" y2="165" strokeWidth="1.5" />
          <rect x="950" y="145" width="20" height="15" rx="2" strokeWidth="1" />
          <circle cx="955" cy="160" r="4" strokeWidth="1" />
          <circle cx="965" cy="160" r="5" strokeWidth="1" />
          <path d="M960,145 L965,135 L975,135" strokeWidth="1" />
        </svg>
      </div>

      <div className="auth-plane-4" aria-hidden="true">
        <svg viewBox="0 0 100 200" className="absolute bottom-0 left-[5%] w-16 h-32 opacity-40 auth-sway-left stroke-[rgba(24,128,56,0.3)] fill-none">
          <path d="M50,200 Q40,100 60,0" strokeWidth="2" strokeLinecap="round" />
          <path d="M50,150 Q30,140 20,120" strokeWidth="1" />
          <path d="M52,100 Q70,90 80,70" strokeWidth="1" />
        </svg>
        <svg viewBox="0 0 100 200" className="absolute bottom-0 right-[8%] w-20 h-40 opacity-30 auth-sway-right stroke-[rgba(24,128,56,0.3)] fill-none">
          <path d="M50,200 Q60,100 40,0" strokeWidth="2" strokeLinecap="round" />
          <path d="M50,140 Q70,130 80,110" strokeWidth="1" />
          <path d="M48,80 Q30,70 20,50" strokeWidth="1" />
        </svg>
      </div>

      <div className="auth-film-grain" aria-hidden="true" style={{ opacity: 0.02 }} />

      <div className="auth-cinema-grid">
        <section className="auth-cinema-left auth-display-text" aria-label={copy.login}>
          <div className="auth-scrim" />
          <header className="auth-wordmark-block relative z-10">
            <div className="auth-wordmark-viewport" aria-live="polite">
              <h1
                key={`current-${wordmarkState.tick}`}
                className={`auth-cycle-word ${wordmarkState.isExiting ? 'auth-cycle-word-exit' : 'auth-cycle-word-enter'} ${wordmark.dir === 'rtl' ? 'auth-rtl' : ''}`}
                dir={wordmark.dir || 'ltr'}
                lang={wordmark.lang}
                onAnimationEnd={(e) => {
                  if (e.animationName.includes('cinematicExit') && wordmarkState.isExiting) {
                    setWordmarkState((current) => ({
                      current: (current.current + 1) % WORDMARKS.length,
                      tick: current.tick + 1,
                      isExiting: false
                    }));
                  }
                }}
              >
                {wordmark.label}
                <span className="auth-wordmark-caption">{wordmark.lang.toUpperCase()}</span>
              </h1>
            </div>
            <span key={`rule-${wordmarkState.tick}`} className="auth-tricolor-rule" aria-hidden="true" />
            <div className="mt-8 text-center md:text-left">
              <p className="auth-tagline font-bold text-[#1F2A1F]">{copy.tagline}</p>
              <p className="auth-proof-line font-mono text-sm font-semibold text-[#188038] dark:text-[#34A853] mt-2 h-6 flex items-center justify-center md:justify-start">
                <span className="typing-cursor border-r-2 border-current pr-1 whitespace-nowrap overflow-hidden">
                  {typedProof}
                </span>
              </p>
            </div>
          </header>
        </section>

        <section className="auth-cinema-right" aria-label={copy.login}>
          <div className="auth-login-card auth-card-entrance">
            <button type="button" onClick={continueWithGoogle} className="auth-google-button flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-[#dadce0] bg-white text-base font-bold text-[#202124] shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
              <GoogleGIcon />
              {copy.google}
            </button>

            <div className="auth-divider flex items-center gap-4 py-6 text-sm font-bold text-[#5f6368] opacity-60">
              <span className="h-px flex-1 bg-current" />
              <span>{copy.or}</span>
              <span className="h-px flex-1 bg-current" />
            </div>

          {authMethod === 'otp' ? (
            <form onSubmit={handleOtpSubmit} className="auth-login-form">
              {otpStage === 'phone' ? (
                <label className="auth-input-wrap">
                  <Phone aria-hidden="true" className="auth-input-icon" />
                  <input
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value.replace(/\D/g, ''))}
                    placeholder={copy.mobileNumber}
                    aria-label={copy.mobileNumber}
                    inputMode="numeric"
                    maxLength={10}
                    style={{ paddingLeft: '44px', height: '56px' }}
                  />
                </label>
              ) : (
                <label className="auth-input-wrap">
                  <Lock aria-hidden="true" className="auth-input-icon" />
                  <input
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ''))}
                    placeholder={copy.enterOtp}
                    aria-label={copy.enterOtp}
                    inputMode="numeric"
                    maxLength={6}
                    style={{ paddingLeft: '44px', height: '56px' }}
                  />
                </label>
              )}

              {message && <p className={`auth-message auth-message-${message.tone}`}>{message.text}</p>}

              <button type="submit" disabled={submitting} className="auth-primary-button">
                {otpStage === 'phone' ? copy.getOtp : copy.verifyOtp}
              </button>

              <button
                type="button"
                className="auth-demo-link"
                style={{ marginTop: '12px' }}
                onClick={() => { setAuthMethod('email'); setMessage(null); }}
              >
                {copy.continueWithEmail}
              </button>
            </form>
          ) : (
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
                  style={{ height: '56px' }}
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
                  style={{ height: '56px' }}
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

              <div className="auth-form-links">
                <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); }}>
                  {mode === 'login' ? copy.signup : copy.loginLink}
                </button>
                <span aria-hidden="true">·</span>
                <button type="button" onClick={() => setMessage({ tone: 'info', text: copy.forgotMessage })}>
                  {copy.forgot}
                </button>
              </div>

              <button
                type="button"
                className="auth-demo-link"
                style={{ marginTop: '12px' }}
                onClick={() => { setAuthMethod('otp'); setMessage(null); }}
              >
                {copy.mobileNumber}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-[11px] font-semibold text-[#1F2A1F] opacity-55">
            {copy.consentPrefix}{' '}
            <Link href="/privacy" className="underline hover:text-[#188038] transition-colors">{copy.consentLink}</Link>
          </p>

          <div className="mt-4 text-center">
            <button type="button" onClick={continueAsDemo} className="text-sm font-bold text-[#1F2A1F] hover:text-[#188038] underline transition-colors">
              {copy.demo}
            </button>
          </div>
        </div>
        </section>
      </div>
    </main>
  );
}
