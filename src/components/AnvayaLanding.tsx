'use client';

import Image from 'next/image';
import {
  ArrowRight,
  Bot,
  CloudSun,
  Droplets,
  Globe2,
  Leaf,
  LogIn,
  ShieldCheck,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { LanguageCode } from '@/lib/i18n';
import styles from './AnvayaLanding.module.css';

type LandingCopy = {
  brandDescriptor: string;
  eyebrow: string;
  headline: string;
  support: string;
  primaryAction: string;
  signIn: string;
  changeLanguage: string;
  navigationLabel: string;
  navPlatform: string;
  navIntelligence: string;
  navImpact: string;
  artworkAlt: string;
  intelligenceLabel: string;
  cropHealth: string;
  cropHealthValue: string;
  soilMoisture: string;
  soilMoistureValue: string;
  weather: string;
  weatherValue: string;
  marketSignal: string;
  marketSignalValue: string;
  farmerAccess: string;
  consentFirst: string;
  weatherAware: string;
  marketLinked: string;
};

const BRAND_NAME = 'ANVAYA';

const LANGUAGES: Array<{ code: LanguageCode; label: string }> = [
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'en', label: 'English' },
];

const LANDING_COPY: Record<LanguageCode, LandingCopy> = {
  hi: {
    brandDescriptor: 'Agriculture OS',
    eyebrow: 'भारत के खेतों के लिए कृषि बुद्धिमत्ता',
    headline: 'खेती का हर संकेत, एक साथ',
    support: 'मौसम, मिट्टी, फसल और मंडी के फैसले — एक भरोसेमंद कृषि प्रणाली में।',
    primaryAction: 'खेती का डेमो देखें',
    signIn: 'लॉगिन',
    changeLanguage: 'भाषा बदलें',
    navigationLabel: 'मुख्य नेविगेशन',
    navPlatform: 'प्लेटफ़ॉर्म',
    navIntelligence: 'किसानमित्र AI',
    navImpact: 'प्रभाव',
    artworkAlt: 'स्मार्ट सिंचाई, ग्रीनहाउस, ड्रोन और फसल निगरानी वाला भारतीय खेत',
    intelligenceLabel: 'खेत संकेत',
    cropHealth: 'फसल सेहत',
    cropHealthValue: 'संतुलित',
    soilMoisture: 'मिट्टी की नमी',
    soilMoistureValue: 'पर्याप्त',
    weather: 'मौसम',
    weatherValue: 'काम के लिए साफ़ समय',
    marketSignal: 'मंडी रुझान',
    marketSignalValue: 'मजबूत हो रहा है',
    farmerAccess: 'किसान उपयोग ₹0',
    consentFirst: 'सहमति पहले',
    weatherAware: 'मौसम-सचेत सलाह',
    marketLinked: 'मंडी से जुड़ी योजना',
  },
  mr: {
    brandDescriptor: 'Agriculture OS',
    eyebrow: 'भारताच्या शेतांसाठी कृषी बुद्धिमत्ता',
    headline: 'शेतीचा प्रत्येक संकेत, एकाच ठिकाणी',
    support: 'हवामान, माती, पीक आणि बाजाराचे निर्णय — एका विश्वासार्ह कृषी प्रणालीत.',
    primaryAction: 'शेतीचा डेमो पाहा',
    signIn: 'लॉगिन',
    changeLanguage: 'भाषा बदला',
    navigationLabel: 'मुख्य नेव्हिगेशन',
    navPlatform: 'प्लॅटफॉर्म',
    navIntelligence: 'किसानमित्र AI',
    navImpact: 'परिणाम',
    artworkAlt: 'स्मार्ट सिंचन, हरितगृह, ड्रोन आणि पीक निरीक्षण असलेले भारतीय शेत',
    intelligenceLabel: 'शेत संकेत',
    cropHealth: 'पिकाची स्थिती',
    cropHealthValue: 'संतुलित',
    soilMoisture: 'मातीतील ओलावा',
    soilMoistureValue: 'पुरेसा',
    weather: 'हवामान',
    weatherValue: 'कामासाठी अनुकूल वेळ',
    marketSignal: 'बाजार कल',
    marketSignalValue: 'मजबूत होत आहे',
    farmerAccess: 'शेतकरी वापर ₹0',
    consentFirst: 'संमती प्रथम',
    weatherAware: 'हवामान-जागरूक सल्ला',
    marketLinked: 'बाजाराशी जोडलेली योजना',
  },
  en: {
    brandDescriptor: 'Agriculture OS',
    eyebrow: 'Farm intelligence built for India',
    headline: 'Every signal your farm needs, together',
    support: 'Weather, soil, crop, and market decisions in one trusted agriculture system.',
    primaryAction: 'Explore the farm demo',
    signIn: 'Sign in',
    changeLanguage: 'Change language',
    navigationLabel: 'Primary navigation',
    navPlatform: 'Platform',
    navIntelligence: 'KisanMitra AI',
    navImpact: 'Impact',
    artworkAlt: 'Indian farm with smart irrigation, greenhouse, drone, and crop monitoring',
    intelligenceLabel: 'Field signals',
    cropHealth: 'Crop health',
    cropHealthValue: 'Balanced',
    soilMoisture: 'Soil moisture',
    soilMoistureValue: 'Adequate',
    weather: 'Weather',
    weatherValue: 'Clear work window',
    marketSignal: 'Market signal',
    marketSignalValue: 'Strengthening',
    farmerAccess: 'Farmer access ₹0',
    consentFirst: 'Consent first',
    weatherAware: 'Weather-aware advice',
    marketLinked: 'Market-linked planning',
  },
};

type AnvayaLandingProps = {
  lang: LanguageCode;
  onLanguageChange: (code: LanguageCode) => void;
  onDemo: () => void;
  onLogin: () => void;
};

export default function AnvayaLanding({ lang, onLanguageChange, onDemo, onLogin }: AnvayaLandingProps) {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const copy = LANDING_COPY[lang];

  useEffect(() => {
    if (!languageMenuOpen) return undefined;

    const closeMenu = (event: PointerEvent) => {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', closeMenu);
    return () => window.removeEventListener('pointerdown', closeMenu);
  }, [languageMenuOpen]);

  return (
    <main className={styles.page}>
      <section id="platform" className={styles.hero} aria-labelledby="anvaya-hero-title">
        <header className={styles.header}>
          <a className={styles.brand} href="#platform" aria-label={BRAND_NAME}>
            <span className={styles.brandMark} aria-hidden="true">
              <Sprout />
            </span>
            <span className={styles.brandText}>
              <strong>{BRAND_NAME}</strong>
              <span>{copy.brandDescriptor}</span>
            </span>
          </a>

          <nav className={styles.navigation} aria-label={copy.navigationLabel}>
            <a href="#platform">{copy.navPlatform}</a>
            <a href="#intelligence">{copy.navIntelligence}</a>
            <a href="#impact">{copy.navImpact}</a>
          </nav>

          <div className={styles.headerActions}>
            <div ref={languageMenuRef} className={styles.languageControl}>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={copy.changeLanguage}
                aria-expanded={languageMenuOpen}
                onClick={() => setLanguageMenuOpen((open) => !open)}
              >
                <Globe2 />
              </button>
              {languageMenuOpen ? (
                <div className={styles.languageMenu} role="menu">
                  {LANGUAGES.map((language) => (
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={language.code === lang}
                      className={language.code === lang ? styles.activeLanguage : undefined}
                      key={language.code}
                      onClick={() => {
                        onLanguageChange(language.code);
                        setLanguageMenuOpen(false);
                      }}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button type="button" className={styles.signInButton} onClick={onLogin}>
              <LogIn aria-hidden="true" />
              <span>{copy.signIn}</span>
            </button>
          </div>
        </header>

        <div className={styles.heroArtwork} aria-hidden="true">
          <Image
            className={styles.heroImage}
            src="/images/anvaya-hero-smart-farm.webp"
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <Bot aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1 id="anvaya-hero-title">
            <span>{BRAND_NAME}</span>
            {copy.headline}
          </h1>
          <p className={styles.support}>{copy.support}</p>
          <button type="button" className={styles.primaryAction} onClick={onDemo}>
            <span>{copy.primaryAction}</span>
            <ArrowRight aria-hidden="true" />
          </button>
        </div>

        <p className={styles.srOnly}>{copy.artworkAlt}</p>

        <aside id="intelligence" className={styles.intelligence} aria-label={copy.intelligenceLabel}>
          <article className={`${styles.signalCard} ${styles.cropCard}`}>
            <span className={`${styles.signalIcon} ${styles.greenIcon}`} aria-hidden="true"><Leaf /></span>
            <span><small>{copy.cropHealth}</small><strong>{copy.cropHealthValue}</strong></span>
            <i className={styles.healthyDot} aria-hidden="true" />
          </article>
          <article className={`${styles.signalCard} ${styles.soilCard}`}>
            <span className={`${styles.signalIcon} ${styles.cyanIcon}`} aria-hidden="true"><Droplets /></span>
            <span><small>{copy.soilMoisture}</small><strong>{copy.soilMoistureValue}</strong></span>
          </article>
          <article className={`${styles.signalCard} ${styles.weatherCard}`}>
            <span className={`${styles.signalIcon} ${styles.goldIcon}`} aria-hidden="true"><CloudSun /></span>
            <span><small>{copy.weather}</small><strong>{copy.weatherValue}</strong></span>
          </article>
          <article className={`${styles.signalCard} ${styles.marketCard}`}>
            <span className={`${styles.signalIcon} ${styles.indigoIcon}`} aria-hidden="true"><TrendingUp /></span>
            <span><small>{copy.marketSignal}</small><strong>{copy.marketSignalValue}</strong></span>
          </article>
        </aside>

        <div id="impact" className={styles.trustRail}>
          <span><Sprout aria-hidden="true" />{copy.farmerAccess}</span>
          <span><ShieldCheck aria-hidden="true" />{copy.consentFirst}</span>
          <span><CloudSun aria-hidden="true" />{copy.weatherAware}</span>
          <span><TrendingUp aria-hidden="true" />{copy.marketLinked}</span>
        </div>
      </section>

      <section className={styles.productPreview} aria-labelledby="anvaya-preview-title">
        <div className={styles.previewIntro}>
          <p className={styles.previewKicker}>{copy.navIntelligence}</p>
          <h2 id="anvaya-preview-title">{copy.primaryAction}</h2>
          <p>{copy.support}</p>
        </div>

        <div className={styles.previewGrid}>
          <article className={styles.askPreview}>
            <div className={styles.askHeader}>
              <span aria-hidden="true"><Bot /></span>
              <div>
                <small>{copy.navIntelligence}</small>
                <strong>{copy.weatherAware}</strong>
              </div>
            </div>
            <div className={styles.answerStack}>
              <p><strong>{copy.weather}</strong><span>{copy.weatherValue}</span></p>
              <p><strong>{copy.cropHealth}</strong><span>{copy.cropHealthValue}</span></p>
              <p><strong>{copy.marketSignal}</strong><span>{copy.marketSignalValue}</span></p>
            </div>
            <button type="button" className={styles.previewAction} onClick={onDemo}>
              <span>{copy.primaryAction}</span>
              <ArrowRight aria-hidden="true" />
            </button>
          </article>

          <div className={styles.missionGrid}>
            {[
              { icon: <Leaf />, label: copy.cropHealth, value: copy.cropHealthValue },
              { icon: <Droplets />, label: copy.soilMoisture, value: copy.soilMoistureValue },
              { icon: <CloudSun />, label: copy.weather, value: copy.weatherValue },
              { icon: <TrendingUp />, label: copy.marketSignal, value: copy.marketSignalValue },
            ].map((item) => (
              <article className={styles.missionCard} key={item.label}>
                <span aria-hidden="true">{item.icon}</span>
                <small>{item.label}</small>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
