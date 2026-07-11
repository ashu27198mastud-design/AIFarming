'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import CameraCapture, {
  type CameraCaptureHandle,
  type PreparedMedia,
} from '@/components/CameraCapture';
import DiagnosisCard, { type DiagnosisView } from '@/components/DiagnosisCard';
import type { TranslationSet } from '@/lib/i18n';
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
  lang: string;
  coords: { lat: number; lng: number };
  onAddScan: (scan: ScanHistoryItem) => void;
};

function unavailableDiagnosis(): DiagnosisView {
  return {
    mostLikelyIssue: 'विश्लेषण उपलब्ध नहीं / Analysis unavailable',
    alternativePossibilities: [],
    confidence: 0,
    visibleIndicators: [],
    severity: 'unknown',
    urgency: 'review',
    questionsForAccuracy: ['कृपया साफ़ क्लोज़-अप फोटो अपलोड करें। / Please upload a clear close-up image.'],
    immediateAction: 'इस स्कैन के आधार पर कोई उपचार न करें। कृपया दोबारा प्रयास करें। / Do not apply treatment based on this scan. Please retry.',
    organicOptions: [],
    chemicalCategory: '',
    preventionAdvice: 'स्पष्ट पहचान के बिना रसायन का उपयोग न करें। / Avoid chemical use without a clear diagnosis.',
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
      cameraRef.current?.openCamera();
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
      result = unavailableDiagnosis();
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
      date: new Date().toLocaleDateString('en-IN'),
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
              <ShieldCheck className="h-5 w-5" /> {loading ? t.analyzing : lang === 'mr' ? 'तपासा / Analyze' : lang === 'hi' ? 'जांच करें / Analyze' : 'Analyze'}
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
