import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_MANUAL_COOKIE_KEY,
  SUPPORTED_LANGUAGE_CODES,
} from '@/lib/language-preference';

const languagePreferenceSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGE_CODES),
});

export async function POST(request: Request) {
  const parsed = languagePreferenceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  const cookieOptions = {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
  response.cookies.set(LANGUAGE_COOKIE_KEY, parsed.data.language, cookieOptions);
  response.cookies.set(LANGUAGE_MANUAL_COOKIE_KEY, 'true', cookieOptions);
  return response;
}
