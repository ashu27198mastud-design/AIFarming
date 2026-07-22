'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import CameraCapture, {
  type CameraCaptureHandle,
  type PreparedMedia,
} from '@/components/CameraCapture';
import DiagnosisCard, { type DiagnosisView } from '@/components/DiagnosisCard';
import type { LanguageCode, TranslationSet } from '@/lib/i18n';
import type { WeatherForecast } from '@/types';

export type ScanHistoryItem = {
  id: string;
  date: string;
  disease: string;
  severity: string;
  status: string;
  thumbnail: string;
  dataSource: string;
};

export type HomeTabHandle = {
  openCamera: () => void;
};

type Props = {
  t: TranslationSet;
  lang: LanguageCode;
  coords: { lat: number; lng: number };
  onAddScan: (scan: ScanHistoryItem) => void;
};

function unavailableDiagnosis(lang: LanguageCode): DiagnosisView {
  const copy = {
    en: {
      issue: 'Analysis unavailable',
      question: 'Upload a clear close-up photo of the affected leaf or plant.',
      action: 'Do not apply treatment from this scan. Take another clear photo.',
      fertilizer: 'Choose fertilizer dosage only after a soil test.',
      prevention: 'Avoid chemical use until the crop issue is clearly identified.',
    },
    hi: {
      issue: 'विश्लेषण उपलब्ध नहीं है',
      question: 'प्रभावित पत्ती या पौधे की साफ और पास से ली गई फोटो अपलोड करें।',
      action: 'इस स्कैन के आधार पर उपचार न करें। एक और साफ फोटो लें।',
      fertilizer: 'मिट्टी की जांच के बाद ही उर्वरक की मात्रा चुनें।',
      prevention: 'समस्या की स्पष्ट पहचान तक रसायन का उपयोग न करें।',
    },
    mr: {
      issue: 'विश्लेषण उपलब्ध नाही',
      question: 'बाधित पान किंवा रोपाचा स्वच्छ आणि जवळून घेतलेला फोटो अपलोड करा.',
      action: 'या तपासणीवरून उपचार करू नका. आणखी एक स्वच्छ फोटो घ्या.',
      fertilizer: 'माती तपासणीनंतरच खताचे प्रमाण निवडा.',
      prevention: 'समस्येची स्पष्ट ओळख होईपर्यंत रसायन वापरू नका.',
    },
  }[lang];

  return {
    mostLikelyIssue: copy.issue,
    alternativePossibilities: [],
    confidence: 0,
    visibleIndicators: [],
    severity: 'unknown',
    urgency: 'review',
    questionsForAccuracy: [copy.question],
    immediateAction: copy.action,
    organicOptions: [],
    chemicalCategory: '',
    fertilizerAdvice: copy.fertilizer,
    preventionAdvice: copy.prevention,
    followUpDays: 0,
    requiresExpert: false,
    imageQuality: 'poor',
    imageCategory: 'unclear',
    dataSource: 'unavailable',
  };
}
const HomeTab = forwardRef<HomeTabHandle, Props>(function HomeTab(
  { t, lang, coords, onAddScan },
  ref,
) {
  const cameraRef = useRef<CameraCaptureHandle>(null);
  const [media, setMedia] = useState<PreparedMedia | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisView | null>(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);

  useImperativeHandle(ref, () => ({
    openCamera: () => {
      setMedia(null);
      setDiagnosis(null);
      cameraRef.current?.openDeviceCamera();
    },
  }), []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/weather?lat=${coords.lat}&lng=${coords.lng}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: WeatherForecast) => setWeather(payload))
      .catch(() => setWeather(null));
    return () => controller.abort();
  }, [coords.lat, coords.lng]);

  const analyze = async () => {
    if (!media) return;
    setLoading(true);
    setDiagnosis(null);
    let result: DiagnosisView;

    try {
      const body = new FormData();
      body.append('image', media.file);
      body.append('farmContext', 'Farmer: Asha Pawar, Maharashtra; use the visible crop as the primary evidence.');
      const response = await fetch('/api/ai/diagnose', { method: 'POST', body });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error || 'Analysis failed');
      result = payload as DiagnosisView;
    } catch (error) {
      console.error('Diagnosis request failed:', error);
      result = unavailableDiagnosis(lang);
    }

    setDiagnosis(result);
    const status = result.severity === 'critical' || result.severity === 'high'
      ? '🔴'
      : result.severity === 'medium'
        ? '🟡'
        : result.severity === 'unknown'
          ? '⚪'
          : '🟢';

    onAddScan({
      id: `scan-${Date.now()}`,
      date: new Date().toLocaleDateString(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN'),
      disease: result.mostLikelyIssue,
      severity: result.severity,
      status,
      thumbnail: media.previewDataUrl,
      dataSource: result.dataSource || 'unavailable',
    });
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <CameraCapture
        ref={cameraRef}
        lang={lang}
        t={t}
        value={media}
        onChange={(next) => {
          setMedia(next);
          setDiagnosis(null);
        }}
        disabled={loading}
      />
      {media && (
        <div className="m3-card space-y-4">
          {!diagnosis && (
            <button type="button" onClick={() => void analyze()} disabled={loading} className="btn-m3-primary w-full">
              <ShieldCheck className="h-5 w-5" /> {loading ? t.analyzing : t.analyze}
            </button>
          )}
          {loading && <p className="animate-pulse text-center text-sm font-semibold text-[#4E5953]">{t.analyzing}</p>}
          {diagnosis && <DiagnosisCard diagnosis={diagnosis} t={t} lang={lang} hourlyWeather={weather?.hourly ?? []} />}
        </div>
      )}
    </div>
  );
});

export default HomeTab;
