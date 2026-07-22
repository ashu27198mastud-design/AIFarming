'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BatteryCharging,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CloudRain,
  Cpu,
  FileKey2,
  Gauge,
  History,
  LockKeyhole,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wind,
  Wrench,
} from 'lucide-react';
import type { LanguageCode } from '@/lib/i18n';
import { INTERFACE_COPY } from '@/lib/interface-copy';
import {
  evaluateSprayLockPreflight,
  type SprayLockPreflightInput,
  type SprayLockReasonCode,
} from '@/lib/spraylock';
import type { WeatherForecast } from '@/types';

const RECORD_STORAGE_KEY = 'anvaya-spraylock-records-v1';

type EvidenceRecord = {
  recordId: string;
  verifiedAt: string;
  evidenceHash: string;
  recordSealMode: 'server-hmac-sha256' | 'demo-digest-only';
  sourceAttestation: 'verified' | 'unverified' | 'demo';
  evaluation: ReturnType<typeof evaluateSprayLockPreflight>;
};

type Copy = {
  navLabel: string;
  eyebrow: string;
  demoBadge: string;
  title: Record<'ready' | 'inspect' | 'blocked', string>;
  summary: Record<'ready' | 'inspect' | 'blocked', string>;
  interlockOn: string;
  interlockOff: string;
  confidence: string;
  deviceIdentity: string;
  deviceModel: string;
  fieldUnit: string;
  telemetry: string;
  telemetryHint: string;
  fieldWind: string;
  humidity: string;
  pressure: string;
  nozzleHealth: string;
  battery: string;
  calibration: string;
  daysAgo: string;
  decision: string;
  noBlockers: string;
  reasons: Record<SprayLockReasonCode, string>;
  createRecord: string;
  creating: string;
  viewWeather: string;
  refreshReading: string;
  trust: string;
  sourceIdentity: string;
  recordIntegrity: string;
  replayControl: string;
  firmware: string;
  demoSource: string;
  verifiedSource: string;
  unverifiedSource: string;
  digestOnly: string;
  signedSeal: string;
  sequenceBound: string;
  evidence: string;
  evidenceHint: string;
  emptyEvidence: string;
  blockedRecord: string;
  readyRecord: string;
  inspectRecord: string;
  apiError: string;
};

const COPY: Record<LanguageCode, Copy> = {
  en: {
    navLabel: 'Smart devices',
    eyebrow: 'SprayLock pre-flight',
    demoBadge: 'Demonstration device',
    title: { ready: 'Field conditions passed', inspect: 'Device inspection required', blocked: 'Safety interlock engaged' },
    summary: {
      ready: 'Independent field and weather checks agree. Create a pre-flight record before operation.',
      inspect: 'One or more device checks need attention. The unit remains locked.',
      blocked: 'Current conditions could cause ineffective or off-target spraying. The unit remains locked.',
    },
    interlockOn: 'Interlock locked',
    interlockOff: 'Interlock released',
    confidence: 'Decision confidence',
    deviceIdentity: 'Device identity',
    deviceModel: 'Retrofit controller',
    fieldUnit: 'North field',
    telemetry: 'Independent field reading',
    telemetryHint: 'Local sensors are compared with the weather feed before release.',
    fieldWind: 'Local wind',
    humidity: 'Humidity',
    pressure: 'Pressure signal',
    nozzleHealth: 'Nozzle health',
    battery: 'Battery',
    calibration: 'Calibration',
    daysAgo: 'days ago',
    decision: 'Safety decision',
    noBlockers: 'No blocking condition detected.',
    reasons: {
      wind_high: 'Local wind exceeds the safe operating envelope.',
      rain_risk: 'Rain probability can reduce application effectiveness.',
      sensor_disagreement: 'Local wind and weather feed do not agree.',
      reading_stale: 'The field reading is too old to trust.',
      calibration_due: 'Sensor calibration is overdue.',
      flow_unstable: 'The flow sensor reports an unstable line.',
      nozzle_service_due: 'Nozzle condition requires service.',
      battery_low: 'Battery reserve is too low for a trusted session.',
    },
    createRecord: 'Create safety record',
    creating: 'Sealing record',
    viewWeather: 'View safe weather window',
    refreshReading: 'Refresh field reading',
    trust: 'Trust and device health',
    sourceIdentity: 'Source identity',
    recordIntegrity: 'Record integrity',
    replayControl: 'Replay control',
    firmware: 'Firmware',
    demoSource: 'Demo source; hardware key absent',
    verifiedSource: 'Hardware signature verified',
    unverifiedSource: 'Hardware signature not verified',
    digestOnly: 'Demo digest only',
    signedSeal: 'Server HMAC seal',
    sequenceBound: 'Sequence and timestamp bound',
    evidence: 'Pre-flight evidence',
    evidenceHint: 'Recent checks are stored on this device for the prototype.',
    emptyEvidence: 'Create the first safety record to begin the audit trail.',
    blockedRecord: 'Blocked operation recorded',
    readyRecord: 'Safe pre-flight recorded',
    inspectRecord: 'Inspection requirement recorded',
    apiError: 'The record could not be created. Refresh the reading and try again.',
  },
  hi: {
    navLabel: 'स्मार्ट उपकरण',
    eyebrow: 'स्प्रेलॉक पूर्व-जांच',
    demoBadge: 'प्रदर्शन उपकरण',
    title: { ready: 'खेत की स्थितियां सुरक्षित हैं', inspect: 'उपकरण जांच आवश्यक', blocked: 'सुरक्षा इंटरलॉक सक्रिय है' },
    summary: {
      ready: 'खेत के सेंसर और मौसम की स्वतंत्र जांच मेल खाती है। संचालन से पहले रिकॉर्ड बनाएं।',
      inspect: 'उपकरण की एक या अधिक जांच आवश्यक है। इकाई लॉक रहेगी।',
      blocked: 'वर्तमान स्थिति में छिड़काव अप्रभावी या गलत दिशा में जा सकता है। इकाई लॉक रहेगी।',
    },
    interlockOn: 'इंटरलॉक बंद',
    interlockOff: 'इंटरलॉक खुला',
    confidence: 'निर्णय विश्वसनीयता',
    deviceIdentity: 'उपकरण पहचान',
    deviceModel: 'रेट्रोफिट नियंत्रक',
    fieldUnit: 'उत्तर खेत',
    telemetry: 'स्वतंत्र खेत रीडिंग',
    telemetryHint: 'इकाई खोलने से पहले स्थानीय सेंसर की मौसम स्रोत से तुलना होती है।',
    fieldWind: 'स्थानीय हवा',
    humidity: 'नमी',
    pressure: 'दबाव संकेत',
    nozzleHealth: 'नोजल स्थिति',
    battery: 'बैटरी',
    calibration: 'कैलिब्रेशन',
    daysAgo: 'दिन पहले',
    decision: 'सुरक्षा निर्णय',
    noBlockers: 'कोई रोकने वाली स्थिति नहीं मिली।',
    reasons: {
      wind_high: 'स्थानीय हवा सुरक्षित संचालन सीमा से अधिक है।',
      rain_risk: 'बारिश की संभावना छिड़काव का प्रभाव घटा सकती है।',
      sensor_disagreement: 'स्थानीय हवा और मौसम स्रोत मेल नहीं खाते।',
      reading_stale: 'खेत की रीडिंग भरोसे के लिए पुरानी है।',
      calibration_due: 'सेंसर कैलिब्रेशन की अवधि पूरी हो गई है।',
      flow_unstable: 'प्रवाह सेंसर अस्थिर लाइन बता रहा है।',
      nozzle_service_due: 'नोजल की सर्विस आवश्यक है।',
      battery_low: 'विश्वसनीय सत्र के लिए बैटरी कम है।',
    },
    createRecord: 'सुरक्षा रिकॉर्ड बनाएं',
    creating: 'रिकॉर्ड सुरक्षित हो रहा है',
    viewWeather: 'सुरक्षित मौसम समय देखें',
    refreshReading: 'खेत रीडिंग रीफ्रेश करें',
    trust: 'विश्वास और उपकरण स्वास्थ्य',
    sourceIdentity: 'स्रोत पहचान',
    recordIntegrity: 'रिकॉर्ड अखंडता',
    replayControl: 'दोहराव नियंत्रण',
    firmware: 'फर्मवेयर',
    demoSource: 'प्रदर्शन स्रोत; हार्डवेयर कुंजी अनुपस्थित',
    verifiedSource: 'हार्डवेयर हस्ताक्षर सत्यापित',
    unverifiedSource: 'हार्डवेयर हस्ताक्षर सत्यापित नहीं',
    digestOnly: 'केवल प्रदर्शन डाइजेस्ट',
    signedSeal: 'सर्वर एचएमएसी सील',
    sequenceBound: 'क्रमांक और समयबद्ध',
    evidence: 'पूर्व-जांच प्रमाण',
    evidenceHint: 'प्रोटोटाइप में हाल की जांच इसी उपकरण पर सुरक्षित रहती है।',
    emptyEvidence: 'ऑडिट क्रम शुरू करने के लिए पहला सुरक्षा रिकॉर्ड बनाएं।',
    blockedRecord: 'रोका गया संचालन दर्ज हुआ',
    readyRecord: 'सुरक्षित पूर्व-जांच दर्ज हुई',
    inspectRecord: 'जांच आवश्यकता दर्ज हुई',
    apiError: 'रिकॉर्ड नहीं बन सका। रीडिंग रीफ्रेश करके फिर प्रयास करें।',
  },
  mr: {
    navLabel: 'स्मार्ट उपकरणे',
    eyebrow: 'स्प्रेलॉक पूर्व-तपासणी',
    demoBadge: 'प्रात्यक्षिक उपकरण',
    title: { ready: 'शेतातील परिस्थिती सुरक्षित आहे', inspect: 'उपकरण तपासणी आवश्यक', blocked: 'सुरक्षा इंटरलॉक सक्रिय आहे' },
    summary: {
      ready: 'शेतातील सेन्सर आणि हवामानाची स्वतंत्र तपासणी जुळली आहे. वापरापूर्वी नोंद तयार करा.',
      inspect: 'उपकरणाची एक किंवा अधिक तपासणी आवश्यक आहे. यंत्र बंद राहील.',
      blocked: 'सध्याच्या परिस्थितीत फवारणी निष्फळ किंवा चुकीच्या दिशेने जाऊ शकते. यंत्र बंद राहील.',
    },
    interlockOn: 'इंटरलॉक बंद',
    interlockOff: 'इंटरलॉक खुला',
    confidence: 'निर्णय विश्वास',
    deviceIdentity: 'उपकरण ओळख',
    deviceModel: 'रेट्रोफिट नियंत्रक',
    fieldUnit: 'उत्तर शेत',
    telemetry: 'स्वतंत्र शेत मोजमाप',
    telemetryHint: 'यंत्र सुरू होण्यापूर्वी स्थानिक सेन्सरची हवामान स्रोताशी तुलना होते.',
    fieldWind: 'स्थानिक वारा',
    humidity: 'आर्द्रता',
    pressure: 'दाब संकेत',
    nozzleHealth: 'नोझल स्थिती',
    battery: 'बॅटरी',
    calibration: 'कॅलिब्रेशन',
    daysAgo: 'दिवसांपूर्वी',
    decision: 'सुरक्षा निर्णय',
    noBlockers: 'कोणतीही अडथळा स्थिती आढळली नाही.',
    reasons: {
      wind_high: 'स्थानिक वारा सुरक्षित कार्यमर्यादेपेक्षा जास्त आहे.',
      rain_risk: 'पावसाची शक्यता फवारणीचा परिणाम कमी करू शकते.',
      sensor_disagreement: 'स्थानिक वारा आणि हवामान स्रोत जुळत नाहीत.',
      reading_stale: 'शेतातील मोजमाप विश्वास ठेवण्यासाठी जुने आहे.',
      calibration_due: 'सेन्सर कॅलिब्रेशनची मुदत संपली आहे.',
      flow_unstable: 'प्रवाह सेन्सर अस्थिर नळी दाखवत आहे.',
      nozzle_service_due: 'नोझलची देखभाल आवश्यक आहे.',
      battery_low: 'विश्वसनीय सत्रासाठी बॅटरी कमी आहे.',
    },
    createRecord: 'सुरक्षा नोंद तयार करा',
    creating: 'नोंद सुरक्षित होत आहे',
    viewWeather: 'सुरक्षित हवामान वेळ पहा',
    refreshReading: 'शेत मोजमाप रीफ्रेश करा',
    trust: 'विश्वास आणि उपकरण स्थिती',
    sourceIdentity: 'स्रोत ओळख',
    recordIntegrity: 'नोंद अखंडता',
    replayControl: 'पुनर्वापर नियंत्रण',
    firmware: 'फर्मवेअर',
    demoSource: 'प्रात्यक्षिक स्रोत; हार्डवेअर कळ उपलब्ध नाही',
    verifiedSource: 'हार्डवेअर स्वाक्षरी सत्यापित',
    unverifiedSource: 'हार्डवेअर स्वाक्षरी सत्यापित नाही',
    digestOnly: 'फक्त प्रात्यक्षिक डाइजेस्ट',
    signedSeal: 'सर्व्हर एचएमएसी सील',
    sequenceBound: 'क्रमांक आणि वेळेशी जोडलेले',
    evidence: 'पूर्व-तपासणी पुरावा',
    evidenceHint: 'प्रोटोटाइपमध्ये अलीकडील तपासण्या या उपकरणावर सुरक्षित राहतात.',
    emptyEvidence: 'ऑडिट क्रम सुरू करण्यासाठी पहिली सुरक्षा नोंद तयार करा.',
    blockedRecord: 'रोखलेले कार्य नोंदवले',
    readyRecord: 'सुरक्षित पूर्व-तपासणी नोंदवली',
    inspectRecord: 'तपासणीची गरज नोंदवली',
    apiError: 'नोंद तयार झाली नाही. मोजमाप रीफ्रेश करून पुन्हा प्रयत्न करा.',
  },
};

function readStoredRecords(): EvidenceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const records = JSON.parse(window.localStorage.getItem(RECORD_STORAGE_KEY) || '[]') as EvidenceRecord[];
    return Array.isArray(records) ? records.slice(0, 6) : [];
  } catch {
    return [];
  }
}

function evidenceTitle(copy: Copy, decision: EvidenceRecord['evaluation']['decision']): string {
  if (decision === 'blocked') return copy.blockedRecord;
  if (decision === 'inspect') return copy.inspectRecord;
  return copy.readyRecord;
}

type Props = {
  lang: LanguageCode;
  locality: string;
  forecast: WeatherForecast | null;
  farmId: string;
  fieldId: string;
  onViewWeather: () => void;
};

export default function SprayLockPanel({ lang, locality, forecast, farmId, fieldId, onViewWeather }: Props) {
  const copy = COPY[lang];
  const uiCopy = INTERFACE_COPY[lang];
  const [sampledAt, setSampledAt] = useState(() => new Date().toISOString());
  const [sequence, setSequence] = useState(248);
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storageTimer = window.setTimeout(() => setRecords(readStoredRecords()), 0);
    return () => window.clearTimeout(storageTimer);
  }, []);

  const input = useMemo<SprayLockPreflightInput>(() => {
    const weather = forecast?.hourly?.[0];
    const weatherWind = weather?.windSpeedKmh ?? 13;
    return {
      farmId,
      fieldId,
      telemetry: {
        deviceId: 'ANV-SL-0248',
        sequence,
        capturedAt: sampledAt,
        source: 'simulated',
        windSpeedKmh: Number((weatherWind + 1.2).toFixed(1)),
        humidityPercent: Math.round(weather?.humidity ?? 76),
        pressureBar: 2.8,
        flowStable: true,
        nozzleHealthPercent: 93,
        batteryPercent: 78,
        calibrationAgeDays: 12,
        firmwareVersion: '0.3.0',
        attestation: { keyId: 'demo-field-key-0248' },
      },
      weather: {
        capturedAt: forecast?.fetchedAt ?? sampledAt,
        source: forecast?.dataSource ?? 'simulated',
        windSpeedKmh: weatherWind,
        precipitationProbability: weather?.precipProbability ?? 42,
      },
    };
  }, [farmId, fieldId, forecast, sampledAt, sequence]);

  const evaluation = useMemo(() => evaluateSprayLockPreflight(input, new Date(sampledAt)), [input, sampledAt]);
  const DecisionIcon = evaluation.decision === 'ready' ? ShieldCheck : ShieldAlert;

  const refreshReading = () => {
    setSampledAt(new Date().toISOString());
    setSequence((current) => current + 1);
    setError('');
  };

  const createRecord = async () => {
    setIsCreating(true);
    setError('');
    try {
      const response = await fetch('/api/devices/spraylock/preflight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('preflight failed');
      const record = await response.json() as EvidenceRecord;
      const next = [record, ...records].slice(0, 6);
      setRecords(next);
      window.localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(next));
      setSequence((current) => current + 1);
      setSampledAt(new Date().toISOString());
    } catch {
      setError(copy.apiError);
    } finally {
      setIsCreating(false);
    }
  };

  const sourceLabel = records[0]?.sourceAttestation === 'verified'
    ? copy.verifiedSource
    : records[0]?.sourceAttestation === 'unverified'
      ? copy.unverifiedSource
      : copy.demoSource;

  return (
    <div className="spraylock-workspace">
      <section className={`spraylock-hero spraylock-state-${evaluation.decision}`}>
        <div className="spraylock-hero-copy">
          <div className="spraylock-eyebrow"><Radio className="h-4 w-4" /> {copy.eyebrow}<span>{copy.demoBadge}</span></div>
          <h2>{copy.title[evaluation.decision]}</h2>
          <p>{copy.summary[evaluation.decision]}</p>
          <div className="spraylock-status-row">
            <span><LockKeyhole className="h-4 w-4" /> {evaluation.interlockEngaged ? copy.interlockOn : copy.interlockOff}</span>
            <span><Activity className="h-4 w-4" /> {copy.confidence}: {evaluation.confidencePercent}%</span>
          </div>
        </div>
        <aside className="spraylock-device-card">
          <span><Cpu className="h-4 w-4" /> {copy.deviceIdentity}</span>
          <strong data-latin-ok>ANV-SL-0248</strong>
          <p>{copy.deviceModel} · {copy.fieldUnit}</p>
          <small>{locality}</small>
        </aside>
      </section>

      <div className="spraylock-grid">
        <section className="spraylock-panel spraylock-telemetry-panel">
          <header>
            <div><Radio className="h-4 w-4" /><span><strong>{copy.telemetry}</strong><small>{copy.telemetryHint}</small></span></div>
            <button type="button" onClick={refreshReading} aria-label={copy.refreshReading} title={copy.refreshReading}><RefreshCw className="h-4 w-4" /></button>
          </header>
          <div className="spraylock-metric-grid">
            <article><Wind className="h-5 w-5" /><span><small>{copy.fieldWind}</small><strong data-latin-ok>{input.telemetry.windSpeedKmh} km/h</strong></span></article>
            <article><CloudRain className="h-5 w-5" /><span><small>{copy.humidity}</small><strong>{input.telemetry.humidityPercent}%</strong></span></article>
            <article><Gauge className="h-5 w-5" /><span><small>{copy.pressure}</small><strong data-latin-ok>{input.telemetry.pressureBar} bar</strong></span></article>
            <article><Wrench className="h-5 w-5" /><span><small>{copy.nozzleHealth}</small><strong>{input.telemetry.nozzleHealthPercent}%</strong></span></article>
          </div>
          <div className="spraylock-device-vitals">
            <span><BatteryCharging className="h-4 w-4" /> {copy.battery}<strong>{input.telemetry.batteryPercent}%</strong></span>
            <span><CheckCircle2 className="h-4 w-4" /> {copy.calibration}<strong>{input.telemetry.calibrationAgeDays} {copy.daysAgo}</strong></span>
          </div>
        </section>

        <section className="spraylock-panel spraylock-decision-panel">
          <header><DecisionIcon className="h-5 w-5" /><strong>{copy.decision}</strong></header>
          <div className={`spraylock-decision-mark spraylock-decision-${evaluation.decision}`}><DecisionIcon className="h-7 w-7" /></div>
          <div className="spraylock-reason-list">
            {evaluation.reasonCodes.length ? evaluation.reasonCodes.map((reason) => (
              <p key={reason}><span />{copy.reasons[reason]}</p>
            )) : <p><CheckCircle2 className="h-4 w-4" />{copy.noBlockers}</p>}
          </div>
          <button type="button" onClick={createRecord} disabled={isCreating} className="spraylock-primary-action">
            {isCreating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileKey2 className="h-4 w-4" />}
            {isCreating ? copy.creating : copy.createRecord}
          </button>
          {evaluation.decision === 'blocked' && <button type="button" onClick={onViewWeather} className="spraylock-text-action">{copy.viewWeather}<ChevronRight className="h-4 w-4" /></button>}
          {error && <p className="spraylock-error" role="alert">{error}</p>}
        </section>

        <details className="device-disclosure spraylock-trust-disclosure">
          <summary><span><ShieldCheck className="h-5 w-5" />{uiCopy.advancedDetails}</span><ChevronDown className="h-4 w-4" /></summary>
          <aside className="spraylock-panel spraylock-trust-panel">
          <header><ShieldCheck className="h-5 w-5" /><strong>{copy.trust}</strong></header>
          <div className="spraylock-trust-list">
            <div><span>{copy.sourceIdentity}</span><strong>{sourceLabel}</strong></div>
            <div><span>{copy.recordIntegrity}</span><strong>{records[0]?.recordSealMode === 'server-hmac-sha256' ? copy.signedSeal : copy.digestOnly}</strong></div>
            <div><span>{copy.replayControl}</span><strong>{copy.sequenceBound}</strong></div>
            <div><span>{copy.firmware}</span><strong data-latin-ok>{input.telemetry.firmwareVersion}</strong></div>
          </div>
          </aside>
        </details>
      </div>

      <details className="device-disclosure device-disclosure-evidence">
        <summary><span><History className="h-5 w-5" />{uiCopy.evidenceDetails}</span><em>{records.length}</em><ChevronDown className="h-4 w-4" /></summary>
        <section className="spraylock-panel spraylock-evidence-panel">
        {records.length ? (
          <div className="spraylock-evidence-list">
            {records.map((record) => (
              <article key={record.recordId}>
                <span className={`spraylock-record-icon spraylock-record-${record.evaluation.decision}`}><LockKeyhole className="h-4 w-4" /></span>
                <div><strong>{evidenceTitle(copy, record.evaluation.decision)}</strong><small>{new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.verifiedAt))}</small></div>
                <code data-latin-ok>{record.evidenceHash.slice(0, 14)}…</code>
                <span className="spraylock-record-confidence">{record.evaluation.confidencePercent}%</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="spraylock-evidence-empty"><FileKey2 className="h-7 w-7" /><p>{copy.emptyEvidence}</p></div>
        )}
        </section>
      </details>
    </div>
  );
}

export function sprayLockNavigationLabel(lang: LanguageCode): string {
  return COPY[lang].navLabel;
}
