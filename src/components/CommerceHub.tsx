'use client';

import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Camera,
  ChevronRight,
  Egg,
  FileCheck2,
  IndianRupee,
  Milk,
  PackageCheck,
  PawPrint,
  Plus,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react';
import type { LanguageCode } from '@/lib/i18n';

type Props = { lang: LanguageCode; placeLabel: string };
type UploadKey = 'certificate' | 'milkReport' | 'birdBatch' | 'animalPhoto';

type MarketItem = { title: string; meta: string; proof: string; price: string; status: string };
type OrderItem = { buyer: string; item: string; value: string; action: string };
type ColumnItem = { title: string; meta: string; value: string; proof: string; price: string; status: string };

type CommerceCopy = {
  title: string;
  subtitle: string;
  locality: string;
  primary: string;
  earnings: string;
  orders: string;
  trust: string;
  live: string;
  draft: string;
  verified: string;
  pending: string;
  grade: string;
  fat: string;
  protein: string;
  a2: string;
  animal: string;
  addCertificate: string;
  addMilkReport: string;
  addBirdBatch: string;
  addAnimalPhoto: string;
  smallNote: string;
  columns: {
    crop: string;
    milk: string;
    poultry: string;
    animals: string;
    proof: string;
  };
  columnHints: {
    crop: string;
    milk: string;
    poultry: string;
    animals: string;
    proof: string;
  };
  products: MarketItem[];
  milkItems: ColumnItem[];
  poultryItems: ColumnItem[];
  animalItems: ColumnItem[];
  ordersList: OrderItem[];
  pipeline: string[];
  certificate: string;
  upload: string;
  quickAction: string;
  locationTrust: string;
  quality: string;
};

const COPY: Record<LanguageCode, CommerceCopy> = {
  en: {
    title: 'Seller Hub',
    subtitle: 'One clean board for crop, milk, eggs, poultry, animals and proof. Less hunting, faster selling.',
    locality: 'Selling from',
    primary: 'Create listing',
    earnings: 'Season earnings',
    orders: 'Orders today',
    trust: 'Buyer trust',
    live: 'Live',
    draft: 'Draft',
    verified: 'Verified',
    pending: 'Pending',
    grade: 'Grade',
    fat: 'Fat',
    protein: 'Protein',
    a2: 'A2 claim',
    animal: 'Animal',
    addCertificate: 'Add certificate',
    addMilkReport: 'Add milk test',
    addBirdBatch: 'Add batch photo',
    addAnimalPhoto: 'Add animal photo',
    smallNote: 'Proof builds trust: grade, certificate, scan history, milk test, animal type and delivery promise.',
    columns: { crop: 'Crop sale', milk: 'Milk products', poultry: 'Eggs & poultry', animals: 'Live animals', proof: 'Certificates' },
    columnHints: {
      crop: 'Organic, fresh produce and mandi-linked pricing.',
      milk: 'Milk, ghee, paneer and curd with fat, protein and A2 proof.',
      poultry: 'Eggs, hens, chicks and poultry lots.',
      animals: 'Goats, cows, buffalo, pigs and verified farm animals.',
      proof: 'Organic, dairy, vaccination and farm trust vault.',
    },
    products: [
      { title: 'Organic tomatoes', meta: '120 kg | Grade A', proof: 'Organic certificate attached', price: '₹42/kg', status: 'Live' },
      { title: 'Green chilli', meta: '40 kg | morning harvest', proof: 'Photo and farm scan ready', price: '₹68/kg', status: 'Live' },
    ],
    milkItems: [
      { title: 'A2 cow milk', meta: '35 L today | Gir cow', proof: 'Fat 4.8% | Protein 3.4%', price: '₹78/L', value: 'A2', status: 'Live' },
      { title: 'Fresh ghee', meta: '6 kg | small batch', proof: 'Milk source verified', price: '₹920/kg', value: 'Pure', status: 'Draft' },
    ],
    poultryItems: [
      { title: 'Desi eggs', meta: '90 eggs | free range', proof: 'Batch photo pending', price: '₹11/egg', value: '90', status: 'Draft' },
      { title: 'Healthy hens', meta: '12 birds | vaccinated', proof: 'Health note attached', price: '₹460/bird', value: '12', status: 'Live' },
    ],
    animalItems: [
      { title: 'Osmanabadi goats', meta: '4 goats | 18-24 kg', proof: 'Photo and age proof ready', price: '₹8,500+', value: '4', status: 'Live' },
      { title: 'Gir cow listing', meta: 'A2 milk line | calf with cow', proof: 'Milk report required', price: 'Quote', value: '1', status: 'Draft' },
    ],
    ordersList: [
      { buyer: 'Green Basket', item: 'Tomato | 60 kg', value: '₹2,520', action: 'Pack' },
      { buyer: 'A2 Fresh Co-op', item: 'Milk | 20 L', value: '₹1,560', action: 'Confirm fat' },
      { buyer: 'Hotel Suruchi', item: 'Eggs | 60', value: '₹660', action: 'Dispatch' },
    ],
    pipeline: ['New', 'Accepted', 'Ready', 'On road', 'Done'],
    certificate: 'Proof wallet',
    upload: 'Upload proof',
    quickAction: 'Add',
    locationTrust: 'Local verified',
    quality: 'Quality',
  },
  hi: {
    title: 'बिक्री केंद्र',
    subtitle: 'फसल, दूध, अंडे, पोल्ट्री, पशु और प्रमाण एक ही साफ बोर्ड पर. कम खोज, तेज बिक्री.',
    locality: 'बिक्री स्थान',
    primary: 'नई बिक्री जोड़ें',
    earnings: 'सीजन कमाई',
    orders: 'आज के ऑर्डर',
    trust: 'खरीदार भरोसा',
    live: 'लाइव',
    draft: 'ड्राफ्ट',
    verified: 'सत्यापित',
    pending: 'बाकी',
    grade: 'ग्रेड',
    fat: 'फैट',
    protein: 'प्रोटीन',
    a2: 'A2 दावा',
    animal: 'पशु',
    addCertificate: 'प्रमाणपत्र जोड़ें',
    addMilkReport: 'दूध जांच जोड़ें',
    addBirdBatch: 'बैच फोटो जोड़ें',
    addAnimalPhoto: 'पशु फोटो जोड़ें',
    smallNote: 'भरोसा बनाने के लिए ग्रेड, प्रमाणपत्र, स्कैन इतिहास, दूध जांच, पशु प्रकार और डिलीवरी वादा जोड़ें.',
    columns: { crop: 'फसल बिक्री', milk: 'दूध उत्पाद', poultry: 'अंडे व पोल्ट्री', animals: 'जीवित पशु', proof: 'प्रमाणपत्र' },
    columnHints: {
      crop: 'ऑर्गेनिक, ताजी उपज और मंडी से जुड़ी कीमत.',
      milk: 'दूध, घी, पनीर, दही: फैट, प्रोटीन और A2 प्रमाण के साथ.',
      poultry: 'अंडे, मुर्गी, चूजे और पोल्ट्री लॉट.',
      animals: 'बकरी, गाय, भैंस, सूअर और सत्यापित खेत पशु.',
      proof: 'ऑर्गेनिक, डेयरी, टीकाकरण और खेत भरोसा वॉलेट.',
    },
    products: [
      { title: 'ऑर्गेनिक टमाटर', meta: '120 kg | ग्रेड A', proof: 'ऑर्गेनिक प्रमाणपत्र जुड़ा', price: '₹42/kg', status: 'लाइव' },
      { title: 'हरी मिर्च', meta: '40 kg | सुबह की तुड़ाई', proof: 'फोटो और खेत स्कैन तैयार', price: '₹68/kg', status: 'लाइव' },
    ],
    milkItems: [
      { title: 'A2 गाय दूध', meta: '35 L आज | गिर गाय', proof: 'फैट 4.8% | प्रोटीन 3.4%', price: '₹78/L', value: 'A2', status: 'लाइव' },
      { title: 'ताजा घी', meta: '6 kg | छोटा बैच', proof: 'दूध स्रोत सत्यापित', price: '₹920/kg', value: 'शुद्ध', status: 'ड्राफ्ट' },
    ],
    poultryItems: [
      { title: 'देसी अंडे', meta: '90 अंडे | मुक्त पालन', proof: 'बैच फोटो बाकी', price: '₹11/अंडा', value: '90', status: 'ड्राफ्ट' },
      { title: 'स्वस्थ मुर्गी', meta: '12 पक्षी | टीकाकरण', proof: 'स्वास्थ्य नोट जुड़ा', price: '₹460/पक्षी', value: '12', status: 'लाइव' },
    ],
    animalItems: [
      { title: 'उस्मानाबादी बकरी', meta: '4 बकरी | 18-24 kg', proof: 'फोटो और उम्र प्रमाण तैयार', price: '₹8,500+', value: '4', status: 'लाइव' },
      { title: 'गिर गाय लिस्टिंग', meta: 'A2 दूध लाइन | बछड़ा साथ', proof: 'दूध रिपोर्ट चाहिए', price: 'भाव पूछें', value: '1', status: 'ड्राफ्ट' },
    ],
    ordersList: [
      { buyer: 'ग्रीन बास्केट', item: 'टमाटर | 60 kg', value: '₹2,520', action: 'पैक करें' },
      { buyer: 'A2 फ्रेश सहकारी', item: 'दूध | 20 L', value: '₹1,560', action: 'फैट पुष्टि' },
      { buyer: 'होटल सुरुचि', item: 'अंडे | 60', value: '₹660', action: 'भेजें' },
    ],
    pipeline: ['नया', 'स्वीकार', 'तैयार', 'रास्ते में', 'पूर्ण'],
    certificate: 'प्रमाण वॉलेट',
    upload: 'प्रमाण अपलोड',
    quickAction: 'जोड़ें',
    locationTrust: 'स्थानीय सत्यापित',
    quality: 'गुणवत्ता',
  },
  mr: {
    title: 'विक्री केंद्र',
    subtitle: 'पीक, दूध, अंडी, कोंबडी, जनावरे आणि प्रमाणपत्रे एका स्वच्छ बोर्डवर. कमी शोध, जलद विक्री.',
    locality: 'विक्री स्थान',
    primary: 'नवीन विक्री जोडा',
    earnings: 'हंगाम कमाई',
    orders: 'आजचे ऑर्डर',
    trust: 'खरेदीदार विश्वास',
    live: 'लाइव्ह',
    draft: 'ड्राफ्ट',
    verified: 'सत्यापित',
    pending: 'बाकी',
    grade: 'ग्रेड',
    fat: 'फॅट',
    protein: 'प्रोटीन',
    a2: 'A2 दावा',
    animal: 'जनावर',
    addCertificate: 'प्रमाणपत्र जोडा',
    addMilkReport: 'दूध चाचणी जोडा',
    addBirdBatch: 'बॅच फोटो जोडा',
    addAnimalPhoto: 'जनावराचा फोटो जोडा',
    smallNote: 'विश्वासासाठी ग्रेड, प्रमाणपत्र, स्कॅन इतिहास, दूध चाचणी, जनावर प्रकार आणि डिलिव्हरी वचन जोडा.',
    columns: { crop: 'पीक विक्री', milk: 'दूध उत्पादने', poultry: 'अंडी व कोंबडी', animals: 'जिवंत जनावरे', proof: 'प्रमाणपत्र' },
    columnHints: {
      crop: 'सेंद्रिय, ताजे उत्पादन आणि मंडीशी जोडलेला भाव.',
      milk: 'दूध, तूप, पनीर, दही: फॅट, प्रोटीन आणि A2 पुराव्यासह.',
      poultry: 'अंडी, कोंबडी, पिल्ले आणि पोल्ट्री लॉट.',
      animals: 'शेळी, गाय, म्हैस, डुक्कर आणि सत्यापित शेत जनावरे.',
      proof: 'सेंद्रिय, डेअरी, लसीकरण आणि शेत भरोसा वॉलेट.',
    },
    products: [
      { title: 'सेंद्रिय टोमॅटो', meta: '120 kg | ग्रेड A', proof: 'सेंद्रिय प्रमाणपत्र जोडले', price: '₹42/kg', status: 'लाइव्ह' },
      { title: 'हिरवी मिरची', meta: '40 kg | सकाळची तोडणी', proof: 'फोटो आणि शेत स्कॅन तयार', price: '₹68/kg', status: 'लाइव्ह' },
    ],
    milkItems: [
      { title: 'A2 गाय दूध', meta: '35 L आज | गिर गाय', proof: 'फॅट 4.8% | प्रोटीन 3.4%', price: '₹78/L', value: 'A2', status: 'लाइव्ह' },
      { title: 'ताजे तूप', meta: '6 kg | छोटा बॅच', proof: 'दूध स्रोत सत्यापित', price: '₹920/kg', value: 'शुद्ध', status: 'ड्राफ्ट' },
    ],
    poultryItems: [
      { title: 'देशी अंडी', meta: '90 अंडी | मुक्त पालन', proof: 'बॅच फोटो बाकी', price: '₹11/अंडे', value: '90', status: 'ड्राफ्ट' },
      { title: 'निरोगी कोंबडी', meta: '12 पक्षी | लसीकरण', proof: 'आरोग्य नोंद जोडली', price: '₹460/पक्षी', value: '12', status: 'लाइव्ह' },
    ],
    animalItems: [
      { title: 'उस्मानाबादी शेळी', meta: '4 शेळ्या | 18-24 kg', proof: 'फोटो आणि वय पुरावा तयार', price: '₹8,500+', value: '4', status: 'लाइव्ह' },
      { title: 'गिर गाय लिस्टिंग', meta: 'A2 दूध लाइन | वासरू सोबत', proof: 'दूध रिपोर्ट हवा', price: 'भाव विचारा', value: '1', status: 'ड्राफ्ट' },
    ],
    ordersList: [
      { buyer: 'ग्रीन बास्केट', item: 'टोमॅटो | 60 kg', value: '₹2,520', action: 'पॅक करा' },
      { buyer: 'A2 फ्रेश सहकारी', item: 'दूध | 20 L', value: '₹1,560', action: 'फॅट खात्री' },
      { buyer: 'हॉटेल सुरुची', item: 'अंडी | 60', value: '₹660', action: 'पाठवा' },
    ],
    pipeline: ['नवीन', 'स्वीकारले', 'तयार', 'रस्त्यात', 'पूर्ण'],
    certificate: 'प्रमाण वॉलेट',
    upload: 'प्रमाण अपलोड',
    quickAction: 'जोडा',
    locationTrust: 'स्थानिक सत्यापित',
    quality: 'गुणवत्ता',
  },
};

const columnConfig = [
  { key: 'crop', icon: Store, upload: null },
  { key: 'milk', icon: Milk, upload: 'milkReport' },
  { key: 'poultry', icon: Egg, upload: 'birdBatch' },
  { key: 'animals', icon: PawPrint, upload: 'animalPhoto' },
  { key: 'proof', icon: FileCheck2, upload: 'certificate' },
] as const;

export default function CommerceHub({ lang, placeLabel }: Props) {
  const copy = COPY[lang];
  const [uploads, setUploads] = useState<Record<UploadKey, string>>({ certificate: '', milkReport: '', birdBatch: '', animalPhoto: '' });
  const trustScore = useMemo(() => uploads.certificate ? 92 : 78, [uploads.certificate]);

  const updateUpload = (key: UploadKey, name: string) => setUploads((current) => ({ ...current, [key]: name }));

  return (
    <section className="commerce-hub commerce-hub-wide commerce-column-dashboard">
      <div className="commerce-hero commerce-hero-compact premium-glass-card premium-glass-card-raised">
        <div>
          <span className="section-kicker"><Store className="h-3.5 w-3.5" /> {copy.title}</span>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <div className="commerce-hero-actions">
          <span><small>{copy.locality}</small><strong>{placeLabel}</strong></span>
          <button type="button"><Plus className="h-4 w-4" /> {copy.primary}</button>
        </div>
      </div>

      <div className="commerce-stat-row commerce-stat-row-compact">
        <article><IndianRupee className="h-5 w-5" /><span><small>{copy.earnings}</small><strong>₹42,740</strong></span></article>
        <article><PackageCheck className="h-5 w-5" /><span><small>{copy.orders}</small><strong>8</strong></span></article>
        <article><ShieldCheck className="h-5 w-5" /><span><small>{copy.trust}</small><strong>{trustScore}%</strong></span></article>
      </div>

      <div className="commerce-column-board" aria-label={copy.title}>
        {columnConfig.map((column) => (
          <CommerceColumn
            key={column.key}
            columnKey={column.key}
            Icon={column.icon}
            copy={copy}
            uploadName={column.upload ? uploads[column.upload] : ''}
            onUpload={column.upload ? (name) => updateUpload(column.upload, name) : undefined}
            trustScore={trustScore}
          />
        ))}
      </div>

      <section className="commerce-card commerce-orders-card premium-glass-card commerce-orders-wide commerce-orders-compact">
        <div className="commerce-card-head"><span><Truck className="h-4 w-4" /> {copy.orders}</span><em>8</em></div>
        <div className="commerce-pipeline">{copy.pipeline.map((stage, index) => <span key={stage} className={index < 3 ? 'commerce-stage-on' : ''}>{stage}</span>)}</div>
        <div className="commerce-order-list">{copy.ordersList.map((order) => <article key={order.buyer}><div><strong>{order.buyer}</strong><small>{order.item}</small></div><span>{order.value}</span><button type="button">{order.action}</button></article>)}</div>
      </section>
    </section>
  );
}

function CommerceColumn({ columnKey, Icon, copy, uploadName, onUpload, trustScore }: {
  columnKey: keyof CommerceCopy['columns'];
  Icon: typeof Store;
  copy: CommerceCopy;
  uploadName: string;
  onUpload?: (name: string) => void;
  trustScore: number;
}) {
  const items = getColumnItems(columnKey, copy);
  const uploadLabel = columnKey === 'milk' ? copy.addMilkReport : columnKey === 'poultry' ? copy.addBirdBatch : columnKey === 'animals' ? copy.addAnimalPhoto : copy.addCertificate;

  return (
    <article className={'commerce-column premium-glass-card commerce-column-' + columnKey}>
      <div className="commerce-column-title">
        <span><Icon className="h-4 w-4" /> {copy.columns[columnKey]}</span>
        <em>{columnKey === 'proof' ? trustScore + '%' : copy.live}</em>
      </div>
      <p className="commerce-column-hint">{copy.columnHints[columnKey]}</p>

      {columnKey === 'proof' ? (
        <div className="commerce-proof-column-body">
          <label className="commerce-upload commerce-upload-compact">
            <FileCheck2 className="h-5 w-5" />
            <span>{uploadName || uploadLabel}</span>
            <input type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => onUpload?.(event.currentTarget.files?.[0]?.name || '')} />
          </label>
          <div className="commerce-proof-stack">
            <div><span>{copy.grade}</span><strong>A</strong></div>
            <div><span>{copy.trust}</span><strong>{trustScore}%</strong></div>
            <div><span>{copy.locationTrust}</span><strong>{copy.verified}</strong></div>
          </div>
          <p>{copy.smallNote}</p>
        </div>
      ) : (
        <>
          <div className="commerce-column-list">
            {items.map((item) => <ProductTile key={item.title} item={item} />)}
          </div>
          {onUpload && (
            <label className="commerce-mini-upload commerce-mini-upload-wide">
              <Camera className="h-4 w-4" /> {uploadName || uploadLabel}
              <input type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => onUpload(event.currentTarget.files?.[0]?.name || '')} />
            </label>
          )}
        </>
      )}
    </article>
  );
}

function ProductTile({ item }: { item: MarketItem | ColumnItem }) {
  return (
    <article className="commerce-column-card">
      <div className="commerce-column-card-top">
        <span><strong>{item.title}</strong><small>{item.meta}</small></span>
        <em>{'value' in item ? item.value : item.status}</em>
      </div>
      <p><BadgeCheck className="h-3.5 w-3.5" /> {item.proof}</p>
      <div className="commerce-column-card-bottom">
        <strong>{item.price}</strong>
        <button type="button">{item.status}<ChevronRight className="h-4 w-4" /></button>
      </div>
    </article>
  );
}

function getColumnItems(columnKey: keyof CommerceCopy['columns'], copy: CommerceCopy): Array<MarketItem | ColumnItem> {
  if (columnKey === 'crop') return copy.products;
  if (columnKey === 'milk') return copy.milkItems;
  if (columnKey === 'poultry') return copy.poultryItems;
  if (columnKey === 'animals') return copy.animalItems;
  return [];
}
