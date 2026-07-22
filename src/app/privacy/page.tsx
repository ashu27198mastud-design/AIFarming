import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowLeft, Database, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { PRIVACY_COPY } from '@/lib/i18n/privacy';
import {
  isLanguageCode,
  LANGUAGE_COOKIE_KEY,
} from '@/lib/language-preference';
import styles from './PrivacyPage.module.css';

export default async function PrivacyPage() {
  const cookieStore = await cookies();
  const savedLanguage = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;
  const language = isLanguageCode(savedLanguage) ? savedLanguage : 'hi';
  const copy = PRIVACY_COPY[language];

  return (
    <main className={styles.root} lang={language}>
      <article className={styles.panel}>
        <header className={styles.header}>
          <span className={styles.icon} aria-hidden="true">
            <ShieldCheck size={27} strokeWidth={1.8} />
          </span>
          <div>
            <p className={styles.kicker}>{copy.kicker}</p>
            <h1 className={styles.title}>{copy.title}</h1>
          </div>
        </header>

        <p className={styles.summary}>{copy.summary}</p>

        <div className={styles.details}>
          <section className={styles.detail}>
            <h2 className={styles.detailTitle}>
              <Database size={20} aria-hidden="true" />
              {copy.dataTitle}
            </h2>
            <p className={styles.detailBody}>{copy.dataBody}</p>
          </section>
          <section className={styles.detail}>
            <h2 className={styles.detailTitle}>
              <SlidersHorizontal size={20} aria-hidden="true" />
              {copy.controlTitle}
            </h2>
            <p className={styles.detailBody}>{copy.controlBody}</p>
          </section>
        </div>

        <p className={styles.promise}>{copy.promise}</p>

        <Link href="/" className={styles.back}>
          <ArrowLeft size={20} aria-hidden="true" />
          {copy.back}
        </Link>
      </article>
    </main>
  );
}