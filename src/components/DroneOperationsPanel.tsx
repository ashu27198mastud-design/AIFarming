'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  BatteryCharging,
  CheckCircle2,
  CloudRain,
  Cpu,
  Crosshair,
  Drone,
  FileKey2,
  Gauge,
  History,
  LockKeyhole,
  Map,
  Navigation,
  Play,
  RefreshCw,
  Route,
  Satellite,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  SprayCan,
  Wifi,
  Wind,
} from 'lucide-react';
import type { LanguageCode } from '@/lib/i18n';
import {
  evaluateDronePreflight,
  type DroneMissionType,
  type DronePreflightInput,
  type DroneReasonCode,
} from '@/lib/drone-ops';
import type { WeatherForecast } from '@/types';

const RECORD_STORAGE_KEY = 'anvaya-drone-records-v1';

type EvidenceRecord = {
  recordId: string;
  verifiedAt: string;
  evidenceHash: string;
  sequence: number;
  missionType: DroneMissionType;
  recordSealMode: 'server-hmac-sha256' | 'demo-digest-only';
  sourceAttestation: 'verified' | 'unverified' | 'demo';
  evaluation: ReturnType<typeof evaluateDronePreflight>;
};

type Copy = {
  eyebrow: string;
  demoBadge: string;
  title: Record<'ready' | 'inspect' | 'blocked', string>;
  summary: Record<'ready' | 'inspect' | 'blocked', string>;
  inspection: string;
  inspectionHint: string;
  mapping: string;
  mappingHint: string;
  spraying: string;
  sprayingHint: string;
  launchLockOn: string;
  launchLockOff: string;
  confidence: string;
  plannedRoute: string;
  routeHint: string;
  fieldBoundary: string;
  homePoint: string;
  returnPath: string;
  routeSealed: string;
  completed: string;
  liveDemo: string;
  telemetry: string;
  battery: string;
  gps: string;
  satellites: string;
  link: string;
  motor: string;
  decision: string;
  noBlockers: string;
  reasons: Record<DroneReasonCode, string>;
  createRecord: string;
  creating: string;
  startDemo: string;
  flying: string;
  missionComplete: string;
  recordFirst: string;
  viewWeather: string;
  refresh: string;
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
    eyebrow: 'Field drone control', demoBadge: 'Demonstration aircraft',
    title: { ready: 'Route ready for verification', inspect: 'Aircraft inspection required', blocked: 'Launch lock is engaged' },
    summary: {
      ready: 'The aircraft, route, geofence and weather checks agree. Seal a pre-flight record before take-off.',
      inspect: 'One or more aircraft checks need attention. Take-off remains locked.',
      blocked: 'The aircraft cannot safely complete the planned route and return. Take-off remains locked.',
    },
    inspection: 'Crop inspection', inspectionHint: 'Visual field pass', mapping: 'Field mapping', mappingHint: 'Boundary and crop map', spraying: 'Spray mission', sprayingHint: 'Verified operator required',
    launchLockOn: 'Launch locked', launchLockOff: 'Launch cleared', confidence: 'Decision confidence',
    plannedRoute: 'Planned field route', routeHint: 'Geofence-bound route with automatic return', fieldBoundary: 'Approved boundary', homePoint: 'Home point set', returnPath: 'Return path clear', routeSealed: 'Route checksum bound', completed: 'complete', liveDemo: 'Demo flight',
    telemetry: 'Aircraft health', battery: 'Battery reserve', gps: 'GPS accuracy', satellites: 'Satellites', link: 'Control link', motor: 'Motor health',
    decision: 'Pre-flight decision', noBlockers: 'All launch conditions passed.',
    reasons: {
      battery_reserve_low: 'Battery reserve is too low for the route and safe return.', gps_accuracy_low: 'GPS accuracy is outside the launch limit.', satellite_lock_weak: 'Satellite lock needs inspection.', link_quality_low: 'The control link is too weak.', motor_service_due: 'Motor health requires service.', storage_low: 'Mission storage is nearly full.', calibration_due: 'Aircraft calibration is overdue.', home_point_missing: 'The return home point is missing.', return_path_blocked: 'The automatic return path is not clear.', outside_geofence: 'The planned route leaves the approved field boundary.', wind_high: 'Wind exceeds the aircraft operating limit.', rain_risk: 'Rain risk is too high for this mission.', reading_stale: 'Aircraft telemetry is too old.', operator_required: 'A verified operator is required for a spray mission.',
    },
    createRecord: 'Seal pre-flight record', creating: 'Sealing record', startDemo: 'Start demo mission', flying: 'Mission in progress', missionComplete: 'Demo mission completed', recordFirst: 'Seal a ready pre-flight record to enable the demo mission.', viewWeather: 'View weather', refresh: 'Refresh aircraft reading',
    trust: 'Flight trust', sourceIdentity: 'Aircraft identity', recordIntegrity: 'Record integrity', replayControl: 'Replay control', firmware: 'Firmware', demoSource: 'Demo source; hardware key absent', verifiedSource: 'Aircraft signature verified', unverifiedSource: 'Aircraft signature not verified', digestOnly: 'Demo digest only', signedSeal: 'Server HMAC seal', sequenceBound: 'Sequence and time bound',
    evidence: 'Mission evidence', evidenceHint: 'Pre-flight decisions are retained on this device for the prototype.', emptyEvidence: 'Seal the first pre-flight decision to begin the audit trail.', blockedRecord: 'Blocked launch recorded', readyRecord: 'Ready pre-flight recorded', inspectRecord: 'Inspection requirement recorded', apiError: 'The pre-flight record could not be created. Refresh and try again.',
  },
  hi: {
    eyebrow: 'खेत ड्रोन नियंत्रण', demoBadge: 'प्रात्यक्षिक विमान',
    title: { ready: 'मार्ग सत्यापन के लिए तैयार है', inspect: 'ड्रोन जांच आवश्यक है', blocked: 'उड़ान लॉक सक्रिय है' },
    summary: {
      ready: 'ड्रोन, मार्ग, खेत सीमा और मौसम की जांच सही है। उड़ान से पहले रिकॉर्ड सुरक्षित करें।',
      inspect: 'ड्रोन की एक या अधिक जांच आवश्यक है। उड़ान बंद रहेगी।',
      blocked: 'ड्रोन नियोजित मार्ग पूरा करके सुरक्षित लौट नहीं सकता। उड़ान बंद रहेगी।',
    },
    inspection: 'फसल निरीक्षण', inspectionHint: 'खेत की दृश्य जांच', mapping: 'खेत का नक्शा', mappingHint: 'सीमा और फसल नक्शा', spraying: 'छिड़काव मिशन', sprayingHint: 'सत्यापित चालक आवश्यक',
    launchLockOn: 'उड़ान बंद', launchLockOff: 'उड़ान स्वीकृत', confidence: 'निर्णय विश्वसनीयता',
    plannedRoute: 'नियोजित खेत मार्ग', routeHint: 'खेत सीमा में स्वचालित वापसी वाला मार्ग', fieldBoundary: 'स्वीकृत सीमा', homePoint: 'घर बिंदु तय', returnPath: 'वापसी मार्ग साफ', routeSealed: 'मार्ग जांचांक सुरक्षित', completed: 'पूर्ण', liveDemo: 'प्रात्यक्षिक उड़ान',
    telemetry: 'ड्रोन की स्थिति', battery: 'बैटरी भंडार', gps: 'जीपीएस सटीकता', satellites: 'उपग्रह', link: 'नियंत्रण संपर्क', motor: 'मोटर स्थिति',
    decision: 'उड़ान-पूर्व निर्णय', noBlockers: 'उड़ान की सभी शर्तें पूरी हैं।',
    reasons: {
      battery_reserve_low: 'मार्ग और सुरक्षित वापसी के लिए बैटरी कम है।', gps_accuracy_low: 'जीपीएस सटीकता उड़ान सीमा से बाहर है।', satellite_lock_weak: 'उपग्रह संपर्क की जांच करें।', link_quality_low: 'नियंत्रण संपर्क कमजोर है।', motor_service_due: 'मोटर की देखभाल आवश्यक है।', storage_low: 'मिशन भंडारण लगभग भर गया है।', calibration_due: 'ड्रोन अंशांकन की अवधि पूरी है।', home_point_missing: 'वापसी का घर बिंदु तय नहीं है।', return_path_blocked: 'स्वचालित वापसी मार्ग साफ नहीं है।', outside_geofence: 'मार्ग स्वीकृत खेत सीमा के बाहर जाता है।', wind_high: 'हवा ड्रोन की सुरक्षित सीमा से अधिक है।', rain_risk: 'इस मिशन के लिए बारिश का खतरा अधिक है।', reading_stale: 'ड्रोन माप बहुत पुराना है।', operator_required: 'छिड़काव मिशन के लिए सत्यापित चालक आवश्यक है।',
    },
    createRecord: 'उड़ान-पूर्व रिकॉर्ड सुरक्षित करें', creating: 'रिकॉर्ड सुरक्षित हो रहा है', startDemo: 'प्रात्यक्षिक मिशन शुरू करें', flying: 'मिशन जारी है', missionComplete: 'प्रात्यक्षिक मिशन पूरा हुआ', recordFirst: 'प्रात्यक्षिक मिशन के लिए तैयार उड़ान-पूर्व रिकॉर्ड सुरक्षित करें।', viewWeather: 'मौसम देखें', refresh: 'ड्रोन माप रीफ्रेश करें',
    trust: 'उड़ान विश्वास', sourceIdentity: 'ड्रोन पहचान', recordIntegrity: 'रिकॉर्ड अखंडता', replayControl: 'दोहराव नियंत्रण', firmware: 'फर्मवेयर', demoSource: 'प्रात्यक्षिक स्रोत; हार्डवेयर कुंजी उपलब्ध नहीं', verifiedSource: 'ड्रोन हस्ताक्षर सत्यापित', unverifiedSource: 'ड्रोन हस्ताक्षर सत्यापित नहीं', digestOnly: 'केवल प्रात्यक्षिक डाइजेस्ट', signedSeal: 'सर्वर एचएमएसी सील', sequenceBound: 'क्रमांक और समय से जुड़ा',
    evidence: 'मिशन प्रमाण', evidenceHint: 'प्रोटोटाइप में उड़ान-पूर्व निर्णय इस उपकरण पर सुरक्षित रहते हैं।', emptyEvidence: 'ऑडिट क्रम के लिए पहला उड़ान-पूर्व निर्णय सुरक्षित करें।', blockedRecord: 'रुकी उड़ान दर्ज हुई', readyRecord: 'तैयार उड़ान-पूर्व जांच दर्ज हुई', inspectRecord: 'जांच की आवश्यकता दर्ज हुई', apiError: 'उड़ान-पूर्व रिकॉर्ड नहीं बन सका। रीफ्रेश करके फिर प्रयास करें।',
  },
  mr: {
    eyebrow: 'शेत ड्रोन नियंत्रण', demoBadge: 'प्रात्यक्षिक विमान',
    title: { ready: 'मार्ग पडताळणीसाठी तयार आहे', inspect: 'ड्रोन तपासणी आवश्यक आहे', blocked: 'उड्डाण लॉक सक्रिय आहे' },
    summary: {
      ready: 'ड्रोन, मार्ग, शेत सीमा आणि हवामान तपासणी योग्य आहे. उड्डाणापूर्वी नोंद सुरक्षित करा.',
      inspect: 'ड्रोनची एक किंवा अधिक तपासणी आवश्यक आहे. उड्डाण बंद राहील.',
      blocked: 'ड्रोन नियोजित मार्ग पूर्ण करून सुरक्षित परत येऊ शकत नाही. उड्डाण बंद राहील.',
    },
    inspection: 'पीक पाहणी', inspectionHint: 'शेताची दृश्य पाहणी', mapping: 'शेत नकाशा', mappingHint: 'सीमा आणि पीक नकाशा', spraying: 'फवारणी मोहीम', sprayingHint: 'सत्यापित चालक आवश्यक',
    launchLockOn: 'उड्डाण बंद', launchLockOff: 'उड्डाण मंजूर', confidence: 'निर्णय विश्वास',
    plannedRoute: 'नियोजित शेत मार्ग', routeHint: 'शेत सीमेत स्वयंचलित परतीचा मार्ग', fieldBoundary: 'मंजूर सीमा', homePoint: 'घर बिंदू निश्चित', returnPath: 'परतीचा मार्ग मोकळा', routeSealed: 'मार्ग पडताळणी सुरक्षित', completed: 'पूर्ण', liveDemo: 'प्रात्यक्षिक उड्डाण',
    telemetry: 'ड्रोन स्थिती', battery: 'बॅटरी राखीव', gps: 'जीपीएस अचूकता', satellites: 'उपग्रह', link: 'नियंत्रण संपर्क', motor: 'मोटर स्थिती',
    decision: 'उड्डाण-पूर्व निर्णय', noBlockers: 'उड्डाणाच्या सर्व अटी पूर्ण आहेत.',
    reasons: {
      battery_reserve_low: 'मार्ग आणि सुरक्षित परतीसाठी बॅटरी कमी आहे.', gps_accuracy_low: 'जीपीएस अचूकता उड्डाण मर्यादेबाहेर आहे.', satellite_lock_weak: 'उपग्रह संपर्क तपासा.', link_quality_low: 'नियंत्रण संपर्क कमकुवत आहे.', motor_service_due: 'मोटरची देखभाल आवश्यक आहे.', storage_low: 'मोहीम साठवण जवळपास भरली आहे.', calibration_due: 'ड्रोन कॅलिब्रेशनची मुदत संपली आहे.', home_point_missing: 'परतीचा घर बिंदू निश्चित नाही.', return_path_blocked: 'स्वयंचलित परतीचा मार्ग मोकळा नाही.', outside_geofence: 'मार्ग मंजूर शेत सीमाबाहेर जातो.', wind_high: 'वारा ड्रोनच्या सुरक्षित मर्यादेपेक्षा जास्त आहे.', rain_risk: 'या मोहिमेसाठी पावसाचा धोका जास्त आहे.', reading_stale: 'ड्रोन मोजमाप खूप जुने आहे.', operator_required: 'फवारणी मोहिमेसाठी सत्यापित चालक आवश्यक आहे.',
    },
    createRecord: 'उड्डाण-पूर्व नोंद सुरक्षित करा', creating: 'नोंद सुरक्षित होत आहे', startDemo: 'प्रात्यक्षिक मोहीम सुरू करा', flying: 'मोहीम सुरू आहे', missionComplete: 'प्रात्यक्षिक मोहीम पूर्ण झाली', recordFirst: 'प्रात्यक्षिक मोहिमेसाठी तयार उड्डाण-पूर्व नोंद सुरक्षित करा.', viewWeather: 'हवामान पहा', refresh: 'ड्रोन मोजमाप रीफ्रेश करा',
    trust: 'उड्डाण विश्वास', sourceIdentity: 'ड्रोन ओळख', recordIntegrity: 'नोंद अखंडता', replayControl: 'पुनर्वापर नियंत्रण', firmware: 'फर्मवेअर', demoSource: 'प्रात्यक्षिक स्रोत; हार्डवेअर कळ उपलब्ध नाही', verifiedSource: 'ड्रोन स्वाक्षरी सत्यापित', unverifiedSource: 'ड्रोन स्वाक्षरी सत्यापित नाही', digestOnly: 'फक्त प्रात्यक्षिक डाइजेस्ट', signedSeal: 'सर्व्हर एचएमएसी सील', sequenceBound: 'क्रमांक आणि वेळेशी जोडलेले',
    evidence: 'मोहीम पुरावा', evidenceHint: 'प्रोटोटाइपमध्ये उड्डाण-पूर्व निर्णय या उपकरणावर सुरक्षित राहतात.', emptyEvidence: 'ऑडिट क्रमासाठी पहिला उड्डाण-पूर्व निर्णय सुरक्षित करा.', blockedRecord: 'रोखलेले उड्डाण नोंदवले', readyRecord: 'तयार उड्डाण-पूर्व तपासणी नोंदवली', inspectRecord: 'तपासणीची गरज नोंदवली', apiError: 'उड्डाण-पूर्व नोंद तयार झाली नाही. रीफ्रेश करून पुन्हा प्रयत्न करा.',
  },
};

function readStoredRecords(): EvidenceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const records = JSON.parse(window.localStorage.getItem(RECORD_STORAGE_KEY) || '[]') as EvidenceRecord[];
    return Array.isArray(records) ? records.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function recordTitle(copy: Copy, decision: EvidenceRecord['evaluation']['decision']): string {
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

export default function DroneOperationsPanel({ lang, locality, forecast, farmId, fieldId, onViewWeather }: Props) {
  const copy = COPY[lang];
  const [missionType, setMissionType] = useState<DroneMissionType>('inspection');
  const [sampledAt, setSampledAt] = useState(() => new Date().toISOString());
  const [sequence, setSequence] = useState(102);
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [missionRunning, setMissionRunning] = useState(false);
  const [missionProgress, setMissionProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const storageTimer = window.setTimeout(() => setRecords(readStoredRecords()), 0);
    return () => window.clearTimeout(storageTimer);
  }, []);

  useEffect(() => {
    if (!missionRunning) return;
    const flightTimer = window.setInterval(() => {
      setMissionProgress((current) => {
        const next = Math.min(100, current + 2);
        if (next === 100) window.setTimeout(() => setMissionRunning(false), 0);
        return next;
      });
    }, 160);
    return () => window.clearInterval(flightTimer);
  }, [missionRunning]);

  const input = useMemo<DronePreflightInput>(() => {
    const weather = forecast?.hourly?.[0];
    return {
      farmId,
      fieldId,
      routeChecksum: '83d91cae247fb650',
      missionType,
      operatorVerified: false,
      telemetry: {
        deviceId: 'ANV-DR-0102', sequence, capturedAt: sampledAt, source: 'simulated',
        batteryPercent: 84, gpsAccuracyM: 1.8, satelliteCount: 14, linkQualityPercent: 88,
        motorHealthPercent: 96, storageAvailablePercent: 62, calibrationAgeDays: 8,
        homePointSet: true, returnPathClear: true, withinApprovedGeofence: true,
        firmwareVersion: '0.2.0', attestation: { keyId: 'demo-drone-key-0102' },
      },
      weather: {
        capturedAt: forecast?.fetchedAt ?? sampledAt,
        source: forecast?.dataSource ?? 'simulated',
        windSpeedKmh: weather?.windSpeedKmh ?? 12,
        precipitationProbability: weather?.precipProbability ?? 10,
      },
    };
  }, [farmId, fieldId, forecast, missionType, sampledAt, sequence]);

  const evaluation = useMemo(() => evaluateDronePreflight(input, new Date(sampledAt)), [input, sampledAt]);
  const latestRecord = records[0];
  const launchAuthorized = latestRecord?.sequence === sequence
    && latestRecord.missionType === missionType
    && latestRecord.evaluation.decision === 'ready';
  const DecisionIcon = evaluation.decision === 'ready' ? ShieldCheck : ShieldAlert;
  const routeLeft = `${12 + (missionProgress * 0.72)}%`;
  const routeStyle = { '--drone-route-left': routeLeft } as CSSProperties;

  const changeMission = (nextMission: DroneMissionType) => {
    setMissionType(nextMission);
    setMissionRunning(false);
    setMissionProgress(0);
    setError('');
  };

  const refreshReading = () => {
    setSampledAt(new Date().toISOString());
    setSequence((current) => current + 1);
    setMissionRunning(false);
    setMissionProgress(0);
    setError('');
  };

  const createRecord = async () => {
    setIsCreating(true);
    setError('');
    try {
      const response = await fetch('/api/devices/drone/preflight', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('preflight failed');
      const record = await response.json() as EvidenceRecord;
      const next = [record, ...records].slice(0, 5);
      setRecords(next);
      window.localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(next));
    } catch {
      setError(copy.apiError);
    } finally {
      setIsCreating(false);
    }
  };

  const startMission = () => {
    if (!launchAuthorized) return;
    setMissionProgress(4);
    setMissionRunning(true);
  };

  const sourceLabel = latestRecord?.sourceAttestation === 'verified'
    ? copy.verifiedSource
    : latestRecord?.sourceAttestation === 'unverified'
      ? copy.unverifiedSource
      : copy.demoSource;
  const weatherBlocked = evaluation.reasonCodes.includes('wind_high') || evaluation.reasonCodes.includes('rain_risk');

  return (
    <div className="drone-workspace">
      <section className={`drone-hero drone-state-${evaluation.decision}`}>
        <div className="drone-hero-copy">
          <div className="drone-eyebrow"><Drone className="h-4 w-4" /> {copy.eyebrow}<span>{copy.demoBadge}</span></div>
          <h2>{copy.title[evaluation.decision]}</h2>
          <p>{copy.summary[evaluation.decision]}</p>
          <div className="drone-status-row">
            <span><LockKeyhole className="h-4 w-4" /> {evaluation.launchLockEngaged ? copy.launchLockOn : copy.launchLockOff}</span>
            <span><Gauge className="h-4 w-4" /> {copy.confidence}: {evaluation.confidencePercent}%</span>
          </div>
        </div>
        <div className="drone-mission-selector" role="group" aria-label={copy.eyebrow}>
          <button type="button" className={missionType === 'inspection' ? 'is-active' : ''} onClick={() => changeMission('inspection')}><ScanLine className="h-5 w-5" /><span><strong>{copy.inspection}</strong><small>{copy.inspectionHint}</small></span></button>
          <button type="button" className={missionType === 'mapping' ? 'is-active' : ''} onClick={() => changeMission('mapping')}><Map className="h-5 w-5" /><span><strong>{copy.mapping}</strong><small>{copy.mappingHint}</small></span></button>
          <button type="button" className={missionType === 'spraying' ? 'is-active' : ''} onClick={() => changeMission('spraying')}><SprayCan className="h-5 w-5" /><span><strong>{copy.spraying}</strong><small>{copy.sprayingHint}</small></span></button>
        </div>
      </section>

      <div className="drone-main-grid">
        <section className="drone-panel drone-route-panel">
          <header>
            <div><Route className="h-5 w-5" /><span><strong>{copy.plannedRoute}</strong><small>{copy.routeHint}</small></span></div>
            <button type="button" onClick={refreshReading} aria-label={copy.refresh} title={copy.refresh}><RefreshCw className="h-4 w-4" /></button>
          </header>
          <div className="drone-route-stage" style={routeStyle}>
            <div className="drone-field-row row-one" />
            <div className="drone-field-row row-two" />
            <div className="drone-field-row row-three" />
            <div className="drone-field-row row-four" />
            <div className="drone-route-line" />
            <span className="drone-route-home"><Navigation className="h-4 w-4" /></span>
            <span className="drone-route-drone"><Drone className="h-7 w-7" /></span>
            <span className="drone-route-end"><Crosshair className="h-4 w-4" /></span>
            <div className="drone-route-overlay"><strong>{missionRunning ? copy.flying : missionProgress === 100 ? copy.missionComplete : copy.liveDemo}</strong><span>{missionProgress}% {copy.completed}</span></div>
          </div>
          <div className="drone-route-checks">
            <span><ShieldCheck className="h-4 w-4" />{copy.fieldBoundary}</span>
            <span><Navigation className="h-4 w-4" />{copy.homePoint}</span>
            <span><Route className="h-4 w-4" />{copy.returnPath}</span>
            <span><FileKey2 className="h-4 w-4" />{copy.routeSealed}</span>
          </div>
        </section>

        <section className="drone-panel drone-decision-panel">
          <header><DecisionIcon className="h-5 w-5" /><strong>{copy.decision}</strong></header>
          <div className={`drone-decision-mark drone-decision-${evaluation.decision}`}><DecisionIcon className="h-7 w-7" /></div>
          <div className="drone-reason-list">
            {evaluation.reasonCodes.length ? evaluation.reasonCodes.map((reason) => <p key={reason}><span />{copy.reasons[reason]}</p>) : <p><CheckCircle2 className="h-4 w-4" />{copy.noBlockers}</p>}
          </div>
          <button type="button" onClick={createRecord} disabled={isCreating || missionRunning} className="drone-primary-action">
            {isCreating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileKey2 className="h-4 w-4" />}
            {isCreating ? copy.creating : copy.createRecord}
          </button>
          <button type="button" onClick={startMission} disabled={!launchAuthorized || missionRunning || missionProgress === 100} className="drone-launch-action"><Play className="h-4 w-4" />{missionRunning ? copy.flying : missionProgress === 100 ? copy.missionComplete : copy.startDemo}</button>
          {!launchAuthorized && evaluation.decision === 'ready' && <small className="drone-record-first">{copy.recordFirst}</small>}
          {weatherBlocked && <button type="button" onClick={onViewWeather} className="drone-text-action">{copy.viewWeather}<CloudRain className="h-4 w-4" /></button>}
          {error && <p className="drone-error" role="alert">{error}</p>}
        </section>
      </div>

      <div className="drone-lower-grid">
        <section className="drone-panel drone-telemetry-panel">
          <header><Cpu className="h-5 w-5" /><strong>{copy.telemetry}</strong></header>
          <div className="drone-metric-grid">
            <article><BatteryCharging className="h-5 w-5" /><span><small>{copy.battery}</small><strong>{input.telemetry.batteryPercent}%</strong></span></article>
            <article><Crosshair className="h-5 w-5" /><span><small>{copy.gps}</small><strong data-latin-ok>{input.telemetry.gpsAccuracyM} m</strong></span></article>
            <article><Satellite className="h-5 w-5" /><span><small>{copy.satellites}</small><strong>{input.telemetry.satelliteCount}</strong></span></article>
            <article><Wifi className="h-5 w-5" /><span><small>{copy.link}</small><strong>{input.telemetry.linkQualityPercent}%</strong></span></article>
            <article><Gauge className="h-5 w-5" /><span><small>{copy.motor}</small><strong>{input.telemetry.motorHealthPercent}%</strong></span></article>
            <article><Wind className="h-5 w-5" /><span><small>{copy.viewWeather}</small><strong data-latin-ok>{input.weather.windSpeedKmh} km/h</strong></span></article>
          </div>
        </section>

        <aside className="drone-panel drone-trust-panel">
          <header><ShieldCheck className="h-5 w-5" /><strong>{copy.trust}</strong></header>
          <div className="drone-trust-list">
            <div><span>{copy.sourceIdentity}</span><strong>{sourceLabel}</strong></div>
            <div><span>{copy.recordIntegrity}</span><strong>{latestRecord?.recordSealMode === 'server-hmac-sha256' ? copy.signedSeal : copy.digestOnly}</strong></div>
            <div><span>{copy.replayControl}</span><strong>{copy.sequenceBound}</strong></div>
            <div><span>{copy.firmware}</span><strong data-latin-ok>{input.telemetry.firmwareVersion}</strong></div>
          </div>
          <small className="drone-device-id" data-latin-ok>ANV-DR-0102 · {locality}</small>
        </aside>
      </div>

      <section className="drone-panel drone-evidence-panel">
        <header><div><History className="h-5 w-5" /><span><strong>{copy.evidence}</strong><small>{copy.evidenceHint}</small></span></div><em>{records.length}</em></header>
        {records.length ? <div className="drone-evidence-list">{records.map((record) => (
          <article key={record.recordId}>
            <span className={`drone-record-icon drone-record-${record.evaluation.decision}`}><LockKeyhole className="h-4 w-4" /></span>
            <div><strong>{recordTitle(copy, record.evaluation.decision)}</strong><small>{new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.verifiedAt))}</small></div>
            <code data-latin-ok>{record.evidenceHash.slice(0, 14)}...</code><span>{record.evaluation.confidencePercent}%</span>
          </article>
        ))}</div> : <div className="drone-evidence-empty"><FileKey2 className="h-7 w-7" /><p>{copy.emptyEvidence}</p></div>}
      </section>
    </div>
  );
}
