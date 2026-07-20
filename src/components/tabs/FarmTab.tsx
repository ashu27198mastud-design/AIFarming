'use client';

import { useMemo, useState } from 'react';
import { Camera, Edit3, FileText, Leaf, MapPin, Save, UploadCloud, User } from 'lucide-react';
import type { TranslationSet } from '@/lib/i18n';
import type { ScanHistoryItem } from '@/components/tabs/HomeTab';

type Props = {
  t: TranslationSet;
  lang: string;
  scans: ScanHistoryItem[];
  farm: { region: string; farmSizeHectares: number };
};

type FarmCopy = {
  title: string;
  subtitle: string;
  edit: string;
  save: string;
  farmer: string;
  crop: string;
  stage: string;
  area: string;
  location: string;
  uploadTitle: string;
  fieldPhoto: string;
  soilReport: string;
  landProof: string;
  records: string;
  health: string;
  irrigation: string;
  documents: string;
  noUpload: string;
};

const FARM_COPY: Record<string, FarmCopy> = {
  en: {
    title: 'Farm record',
    subtitle: 'Edit your farm details and upload proof so advice, selling and crop planning stay accurate.',
    edit: 'Edit information',
    save: 'Save details',
    farmer: 'Farmer name',
    crop: 'Active crop',
    stage: 'Crop stage',
    area: 'Farm area',
    location: 'Location',
    uploadTitle: 'Upload farm information',
    fieldPhoto: 'Field photo',
    soilReport: 'Soil report',
    landProof: 'Land proof',
    records: 'Farm records',
    health: 'Crop health',
    irrigation: 'Irrigation',
    documents: 'Documents',
    noUpload: 'Not uploaded yet',
  },
  hi: {
    title: 'खेत रिकॉर्ड',
    subtitle: 'खेत की जानकारी बदलें और प्रमाण अपलोड करें ताकि सलाह, बिक्री और फसल योजना सही रहे.',
    edit: 'जानकारी बदलें',
    save: 'विवरण सेव करें',
    farmer: 'किसान नाम',
    crop: 'सक्रिय फसल',
    stage: 'फसल अवस्था',
    area: 'खेत क्षेत्र',
    location: 'स्थान',
    uploadTitle: 'खेत जानकारी अपलोड करें',
    fieldPhoto: 'खेत फोटो',
    soilReport: 'मिट्टी रिपोर्ट',
    landProof: 'जमीन प्रमाण',
    records: 'खेत रिकॉर्ड',
    health: 'फसल स्वास्थ्य',
    irrigation: 'सिंचाई',
    documents: 'दस्तावेज',
    noUpload: 'अभी अपलोड नहीं',
  },
  mr: {
    title: 'शेत नोंद',
    subtitle: 'शेताची माहिती बदला आणि पुरावे अपलोड करा, म्हणजे सल्ला, विक्री आणि पीक योजना अचूक राहील.',
    edit: 'माहिती बदला',
    save: 'तपशील सेव्ह करा',
    farmer: 'शेतकरी नाव',
    crop: 'सक्रिय पीक',
    stage: 'पीक अवस्था',
    area: 'शेत क्षेत्र',
    location: 'स्थान',
    uploadTitle: 'शेत माहिती अपलोड करा',
    fieldPhoto: 'शेत फोटो',
    soilReport: 'माती रिपोर्ट',
    landProof: 'जमीन पुरावा',
    records: 'शेत नोंदी',
    health: 'पीक आरोग्य',
    irrigation: 'सिंचन',
    documents: 'दस्तऐवज',
    noUpload: 'अजून अपलोड नाही',
  },
};

function statusClass(severity: string) {
  if (severity === 'critical' || severity === 'high') return 'status-danger';
  if (severity === 'medium') return 'status-warning';
  if (severity === 'unknown') return 'status-unknown';
  return 'status-live';
}

export default function FarmTab({ t, lang, scans, farm }: Props) {
  const copy = FARM_COPY[lang] || FARM_COPY.hi;
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    farmer: t.farmerName.replace(/^.*?:\s*/, '') || 'Asha Pawar',
    crop: lang === 'en' ? 'Tomato' : lang === 'mr' ? 'टोमॅटो' : 'टमाटर',
    stage: t.flowering,
    area: String(farm.farmSizeHectares),
    location: farm.region,
  });
  const [uploads, setUploads] = useState({ fieldPhoto: '', soilReport: '', landProof: '' });

  const recordCards = useMemo(() => [
    { label: copy.health, value: scans.length ? scans[0].disease : copy.noUpload, tone: scans.length ? 'good' : 'muted' },
    { label: copy.irrigation, value: lang === 'en' ? 'Drip ready' : lang === 'mr' ? 'ठिबक तयार' : 'ड्रिप तैयार', tone: 'good' },
    { label: copy.documents, value: Object.values(uploads).filter(Boolean).length + '/3', tone: Object.values(uploads).filter(Boolean).length ? 'good' : 'muted' },
  ], [copy.documents, copy.health, copy.irrigation, copy.noUpload, lang, scans, uploads]);

  const onFile = (key: keyof typeof uploads, fileName: string) => setUploads((current) => ({ ...current, [key]: fileName }));

  return (
    <div className="farm-profile-dashboard">
      <section className="farm-profile-hero premium-glass-card premium-glass-card-raised">
        <div className="farm-profile-title">
          <span className="section-kicker"><User className="h-3.5 w-3.5" /> {copy.title}</span>
          <h2>{profile.farmer}</h2>
          <p><MapPin className="h-4 w-4" /> {profile.location}</p>
        </div>
        <button type="button" onClick={() => setEditing((value) => !value)}>
          {editing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          {editing ? copy.save : copy.edit}
        </button>
      </section>

      <section className="farm-edit-panel premium-glass-card">
        <div className="farm-edit-copy">
          <h3>{copy.subtitle}</h3>
        </div>
        <div className="farm-edit-grid">
          <FarmField label={copy.farmer} value={profile.farmer} readOnly={!editing} onChange={(value) => setProfile((current) => ({ ...current, farmer: value }))} />
          <FarmField label={copy.crop} value={profile.crop} readOnly={!editing} onChange={(value) => setProfile((current) => ({ ...current, crop: value }))} />
          <FarmField label={copy.stage} value={profile.stage} readOnly={!editing} onChange={(value) => setProfile((current) => ({ ...current, stage: value }))} />
          <FarmField label={copy.area} value={profile.area} readOnly={!editing} suffix={t.hectareShort} onChange={(value) => setProfile((current) => ({ ...current, area: value }))} />
        </div>
      </section>

      <section className="farm-upload-panel premium-glass-card">
        <div className="farm-section-head"><span><UploadCloud className="h-4 w-4" /> {copy.uploadTitle}</span></div>
        <div className="farm-upload-grid">
          <UploadBox icon={Camera} label={copy.fieldPhoto} value={uploads.fieldPhoto} empty={copy.noUpload} accept="image/*" onChange={(name) => onFile('fieldPhoto', name)} />
          <UploadBox icon={FileText} label={copy.soilReport} value={uploads.soilReport} empty={copy.noUpload} accept="image/*,.pdf,application/pdf" onChange={(name) => onFile('soilReport', name)} />
          <UploadBox icon={FileText} label={copy.landProof} value={uploads.landProof} empty={copy.noUpload} accept="image/*,.pdf,application/pdf" onChange={(name) => onFile('landProof', name)} />
        </div>
      </section>

      <section className="farm-record-grid">
        {recordCards.map((card) => <article key={card.label} className={'premium-glass-card farm-record-card farm-record-' + card.tone}><span>{card.label}</span><strong>{card.value}</strong></article>)}
      </section>

      <section className="farm-scans-panel premium-glass-card">
        <div className="farm-section-head"><span><Leaf className="h-4 w-4" /> {t.savedScans}</span><em>{scans.length}</em></div>
        {scans.length === 0 ? (
          <p className="farm-empty-state">{t.noScans}</p>
        ) : (
          <div className="farm-scan-list">
            {scans.map((scan) => (
              <div key={scan.id} className="farm-scan-row">
                <div className="farm-scan-thumbnail"><img src={scan.thumbnail} alt="Scan preview" /></div>
                <div><strong>{scan.disease}</strong><small>{scan.date}</small></div>
                <span className={`status-orb ${statusClass(scan.severity)}`} aria-label={`Severity ${scan.severity}`} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FarmField({ label, value, readOnly, suffix, onChange }: { label: string; value: string; readOnly: boolean; suffix?: string; onChange: (value: string) => void }) {
  return (
    <label className="farm-edit-field">
      <span>{label}</span>
      <div>
        <input value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} />
        {suffix && <em>{suffix}</em>}
      </div>
    </label>
  );
}

function UploadBox({ icon: Icon, label, value, empty, accept, onChange }: { icon: typeof Camera; label: string; value: string; empty: string; accept: string; onChange: (name: string) => void }) {
  return (
    <label className="farm-upload-box">
      <Icon className="h-5 w-5" />
      <span>{label}</span>
      <strong>{value || empty}</strong>
      <input type="file" accept={accept} onChange={(event) => onChange(event.currentTarget.files?.[0]?.name || '')} />
    </label>
  );
}
