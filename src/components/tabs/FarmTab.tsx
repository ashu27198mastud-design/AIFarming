'use client';

import { useMemo, useState } from 'react';
import { Camera, Edit3, FileText, FlaskConical, IndianRupee, Leaf, MapPin, PackageCheck, PawPrint, Save, Tractor, UploadCloud, User } from 'lucide-react';
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
  health: string;
  irrigation: string;
  documents: string;
  noUpload: string;
  inventoryTitle: string;
  fertilizerStock: string;
  equipmentInventory: string;
  animalDetails: string;
  addItem: string;
  assetValuation: string;
  marketValue: string;
  totalAssets: string;
  valuationNote: string;
};

type InventoryItem = { name: string; meta: string; value: number; price: string };
type AssetItem = { label: string; detail: string; value: number };

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
    health: 'Crop health',
    irrigation: 'Irrigation',
    documents: 'Documents',
    noUpload: 'Not uploaded yet',
    inventoryTitle: 'Farm inventory',
    fertilizerStock: 'Fertilizer in stock',
    equipmentInventory: 'Equipment inventory',
    animalDetails: 'Animal details',
    addItem: 'Add / edit item',
    assetValuation: 'Asset valuation',
    marketValue: 'Market estimate',
    totalAssets: 'Total farm assets',
    valuationNote: 'Based on local market-style reference prices. Final value changes by quality, location and buyer demand.',
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
    health: 'फसल स्वास्थ्य',
    irrigation: 'सिंचाई',
    documents: 'दस्तावेज',
    noUpload: 'अभी अपलोड नहीं',
    inventoryTitle: 'खेत इन्वेंटरी',
    fertilizerStock: 'स्टॉक में खाद',
    equipmentInventory: 'उपकरण इन्वेंटरी',
    animalDetails: 'पशु विवरण',
    addItem: 'जोड़ें / बदलें',
    assetValuation: 'संपत्ति मूल्यांकन',
    marketValue: 'बाजार अनुमान',
    totalAssets: 'कुल खेत संपत्ति',
    valuationNote: 'स्थानीय बाजार जैसे संदर्भ भाव पर आधारित. असली मूल्य गुणवत्ता, स्थान और खरीदार मांग से बदलता है.',
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
    health: 'पीक आरोग्य',
    irrigation: 'सिंचन',
    documents: 'दस्तऐवज',
    noUpload: 'अजून अपलोड नाही',
    inventoryTitle: 'शेत इन्व्हेंटरी',
    fertilizerStock: 'स्टॉकमधील खत',
    equipmentInventory: 'उपकरणे इन्व्हेंटरी',
    animalDetails: 'जनावर तपशील',
    addItem: 'जोडा / बदला',
    assetValuation: 'मालमत्ता मूल्यांकन',
    marketValue: 'बाजार अंदाज',
    totalAssets: 'एकूण शेत मालमत्ता',
    valuationNote: 'स्थानिक बाजारासारख्या संदर्भ भावांवर आधारित. अंतिम मूल्य गुणवत्ता, स्थान आणि खरेदीदार मागणीनुसार बदलते.',
  },
};

function statusClass(severity: string) {
  if (severity === 'critical' || severity === 'high') return 'status-danger';
  if (severity === 'medium') return 'status-warning';
  if (severity === 'unknown') return 'status-unknown';
  return 'status-live';
}

function money(value: number) {
  return '₹' + new Intl.NumberFormat('en-IN').format(value);
}

function getInventory(lang: string) {
  if (lang === 'mr') {
    return {
      fertilizer: [
        { name: 'नीम कोटेड युरिया', meta: '18 बॅग | सील स्टॉक', value: 5400, price: '₹300/बॅग' },
        { name: 'जैव NPK लिक्विड', meta: '24 बाटल्या | 1 L', value: 5280, price: '₹220/L' },
        { name: 'सेंद्रिय कंपोस्ट', meta: '2 टन | चाळलेले', value: 10000, price: '₹5/kg' },
      ],
      equipment: [
        { name: 'बॅटरी स्प्रेयर', meta: '2 युनिट | कार्यरत', value: 8600, price: '₹4,300/युनिट' },
        { name: 'वॉटर पंप', meta: '5 HP | टेस्ट केले', value: 18000, price: '₹18,000' },
        { name: 'रोटावेटर अटॅच', meta: '6 ft | सेवा तयार', value: 65000, price: '₹65,000' },
      ],
      animals: [
        { name: 'उस्मानाबादी शेळी', meta: '4 शेळ्या | 18-24 kg', value: 34000, price: '₹8,500+' },
        { name: 'गिर गाय', meta: 'A2 दूध लाइन | वासरू सोबत', value: 78000, price: '₹78,000' },
        { name: 'कोंबडी', meta: '12 पक्षी | लसीकरण', value: 5520, price: '₹460/पक्षी' },
      ],
    };
  }
  if (lang === 'hi') {
    return {
      fertilizer: [
        { name: 'नीम कोटेड यूरिया', meta: '18 बैग | सील स्टॉक', value: 5400, price: '₹300/बैग' },
        { name: 'जैव NPK लिक्विड', meta: '24 बोतल | 1 L', value: 5280, price: '₹220/L' },
        { name: 'ऑर्गेनिक कम्पोस्ट', meta: '2 टन | छना हुआ', value: 10000, price: '₹5/kg' },
      ],
      equipment: [
        { name: 'बैटरी स्प्रेयर', meta: '2 यूनिट | कार्यरत', value: 8600, price: '₹4,300/यूनिट' },
        { name: 'वॉटर पंप', meta: '5 HP | टेस्ट किया', value: 18000, price: '₹18,000' },
        { name: 'रोटावेटर अटैच', meta: '6 ft | सेवा तैयार', value: 65000, price: '₹65,000' },
      ],
      animals: [
        { name: 'उस्मानाबादी बकरी', meta: '4 बकरी | 18-24 kg', value: 34000, price: '₹8,500+' },
        { name: 'गिर गाय', meta: 'A2 दूध लाइन | बछड़ा साथ', value: 78000, price: '₹78,000' },
        { name: 'मुर्गी', meta: '12 पक्षी | टीकाकरण', value: 5520, price: '₹460/पक्षी' },
      ],
    };
  }
  return {
    fertilizer: [
      { name: 'Neem-coated urea', meta: '18 bags | sealed stock', value: 5400, price: '₹300/bag' },
      { name: 'Bio NPK liquid', meta: '24 bottles | 1 L', value: 5280, price: '₹220/L' },
      { name: 'Organic compost', meta: '2 tons | sieved', value: 10000, price: '₹5/kg' },
    ],
    equipment: [
      { name: 'Battery sprayer', meta: '2 units | working', value: 8600, price: '₹4,300/unit' },
      { name: 'Water pump', meta: '5 HP | tested', value: 18000, price: '₹18,000' },
      { name: 'Rotavator attachment', meta: '6 ft | service-ready', value: 65000, price: '₹65,000' },
    ],
    animals: [
      { name: 'Osmanabadi goats', meta: '4 goats | 18-24 kg', value: 34000, price: '₹8,500+' },
      { name: 'Gir cow', meta: 'A2 milk line | calf with cow', value: 78000, price: '₹78,000' },
      { name: 'Hens', meta: '12 birds | vaccinated', value: 5520, price: '₹460/bird' },
    ],
  };
}

export default function FarmTab({ t, lang, scans, farm }: Props) {
  const copy = FARM_COPY[lang] || FARM_COPY.hi;
  const inventory = useMemo(() => getInventory(lang), [lang]);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    farmer: t.farmerName.replace(/^.*?:\s*/, '') || 'Asha Pawar',
    crop: lang === 'en' ? 'Tomato' : lang === 'mr' ? 'टोमॅटो' : 'टमाटर',
    stage: t.flowering,
    area: String(farm.farmSizeHectares),
    location: farm.region,
  });
  const [uploads, setUploads] = useState({ fieldPhoto: '', soilReport: '', landProof: '' });

  const inventoryTotal = [...inventory.fertilizer, ...inventory.equipment, ...inventory.animals].reduce((sum, item) => sum + item.value, 0);
  const cropValue = Math.round(Number(profile.area || farm.farmSizeHectares) * 210000);
  const landValue = Math.round(Number(profile.area || farm.farmSizeHectares) * 950000);
  const assetCards: AssetItem[] = [
    { label: copy.crop, detail: profile.crop + ' | ' + profile.stage, value: cropValue },
    { label: copy.fertilizerStock, detail: inventory.fertilizer.length + ' items', value: inventory.fertilizer.reduce((sum, item) => sum + item.value, 0) },
    { label: copy.equipmentInventory, detail: inventory.equipment.length + ' items', value: inventory.equipment.reduce((sum, item) => sum + item.value, 0) },
    { label: copy.animalDetails, detail: inventory.animals.length + ' groups', value: inventory.animals.reduce((sum, item) => sum + item.value, 0) },
    { label: copy.area, detail: profile.area + ' ' + t.hectareShort, value: landValue },
  ];
  const totalAssets = assetCards.reduce((sum, item) => sum + item.value, 0);

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
        <div className="farm-edit-copy"><h3>{copy.subtitle}</h3></div>
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

      <section className="farm-inventory-panel premium-glass-card">
        <div className="farm-section-head"><span><PackageCheck className="h-4 w-4" /> {copy.inventoryTitle}</span><button type="button"><Edit3 className="h-4 w-4" /> {copy.addItem}</button></div>
        <div className="farm-inventory-grid">
          <InventoryColumn icon={FlaskConical} title={copy.fertilizerStock} items={inventory.fertilizer} />
          <InventoryColumn icon={Tractor} title={copy.equipmentInventory} items={inventory.equipment} />
          <InventoryColumn icon={PawPrint} title={copy.animalDetails} items={inventory.animals} />
        </div>
      </section>

      <section className="farm-valuation-panel premium-glass-card premium-glass-card-raised">
        <div className="farm-valuation-head">
          <span><IndianRupee className="h-4 w-4" /> {copy.assetValuation}</span>
          <strong>{money(totalAssets)}</strong>
        </div>
        <div className="farm-valuation-grid">
          {assetCards.map((asset) => <article key={asset.label}><span>{asset.label}</span><strong>{money(asset.value)}</strong><small>{asset.detail}</small></article>)}
        </div>
        <p>{copy.valuationNote} {copy.marketValue}: {money(inventoryTotal)}.</p>
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
      <div><input value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} />{suffix && <em>{suffix}</em>}</div>
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

function InventoryColumn({ icon: Icon, title, items }: { icon: typeof FlaskConical; title: string; items: InventoryItem[] }) {
  return (
    <article className="farm-inventory-column">
      <div className="farm-inventory-title"><Icon className="h-4 w-4" /><span>{title}</span></div>
      <div className="farm-inventory-list">
        {items.map((item) => <div key={item.name}><span><strong>{item.name}</strong><small>{item.meta}</small></span><em>{item.price}</em></div>)}
      </div>
    </article>
  );
}
