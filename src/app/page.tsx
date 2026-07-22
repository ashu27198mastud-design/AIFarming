import { cookies } from 'next/headers';
import MorningLightLogin from '@/components/MorningLightLogin';
import {
  isLanguageCode,
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_MANUAL_COOKIE_KEY,
} from '@/lib/language-preference';

export default async function HomePage() {
  const cookieStore = await cookies();
  const savedLanguage = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;
  const initialLanguage = isLanguageCode(savedLanguage) ? savedLanguage : 'hi';
  const languagePreferenceLocked = cookieStore.get(LANGUAGE_MANUAL_COOKIE_KEY)?.value === 'true';

  return (
    <MorningLightLogin
      initialLanguage={initialLanguage}
      languagePreferenceLocked={languagePreferenceLocked}
    />
  );
}