'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createSession, writeAuthSession } from '@/lib/auth-session';
import { TRANSLATIONS, type LanguageCode } from '@/lib/i18n';
import { SUPABASE_PROJECT_REF } from '@/lib/supabase-auth';

const LANGUAGE_STORAGE_KEY = 'km-lang';

function readSavedLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'hi';
  const savedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
  return savedLang && TRANSLATIONS[savedLang] ? savedLang : 'hi';
}

function getOAuthParams(): URLSearchParams {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  hashParams.forEach((value, key) => params.set(key, value));
  return params;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Google login complete kar rahe hain...');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = getOAuthParams();
      const error = params.get('error_description') || params.get('error');
      const hasSuccessSignal = Boolean(params.get('access_token') || params.get('refresh_token') || params.get('provider_token') || params.get('code'));

      if (error || !hasSuccessSignal) {
        setFailed(true);
        setMessage('Google login complete nahi hua. Dobara try karein.');
        return;
      }

      const session = createSession({
        mode: 'user',
        identifier: `google@${SUPABASE_PROJECT_REF}.supabase`,
        name: 'Google Farmer',
        language: readSavedLanguage(),
      });
      writeAuthSession(session);
      window.history.replaceState(null, '', '/auth/callback');
      router.replace('/dashboard');
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="auth-canvas flex min-h-screen items-center justify-center px-4 py-8 text-[#202124]">
      <section className="auth-card w-full max-w-md rounded-[28px] border border-white/90 bg-white/86 p-6 text-center shadow-[0_24px_80px_rgba(60,64,67,0.16)] backdrop-blur-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-[#E6F4EA] text-[#137333] shadow-sm">
          {failed ? <Leaf className="h-7 w-7" /> : <Loader2 className="h-7 w-7 animate-spin" />}
        </div>
        <h1 className="mt-4 text-2xl font-black text-[#123524]">KisanMitra Predict</h1>
        <p className="mt-3 text-base font-bold leading-6 text-[#4F5B54]">{message}</p>
        {failed && (
          <Link href="/" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#1E8E3E] px-5 text-base font-black text-white shadow-[0_12px_26px_rgba(30,142,62,0.24)]">
            Login par lautain
          </Link>
        )}
      </section>
    </main>
  );
}
