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
  type LucideIcon,
} from 'lucide-react';
import type { LanguageCode } from '@/lib/i18n';

type Props = { lang: LanguageCode; placeLabel: string };
type SectionKey = 'crop' | 'milk' | 'poultry' | 'animals' | 'proof';
type UploadKey = 'certificate' | 'milkReport' | 'birdBatch' | 'animalPhoto';
type SellItem = { title: string; meta: string; proof: string; price: string; status: string; value?: string };
type OrderItem = { buyer: string; item: string; value: string; action: string };

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
  addCertificate: string;
  addMilkReport: string;
  addBirdBatch: string;
  addAnimalPhoto: string;
  smallNote: string;
  sectionLabel: Record<SectionKey, string>;
  sectionHint: Record<SectionKey, string>;
  sectionCta: Record<SectionKey, string>;
  items: Record<Exclude<SectionKey, 'proof'>, SellItem[]>;
  ordersList: OrderItem[];
  pipeline: string[];
  proofWallet: string;
  quality: string;
  locationTrust: string;
  todaysFocus: string;
  readyToSell: string;
};

const COPY: Record<LanguageCode, CommerceCopy> = {
  en: {
    title: 'Seller Hub',
    subtitle: 'Choose one line of business and manage it like a focused mini dashboard.',
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
    addCertificate: 'Add certificate',
    addMilkReport: 'Add milk test',
    addBirdBatch: 'Add batch photo',
    addAnimalPhoto: 'Add animal photo',
    smallNote: 'Proof builds buyer trust: grade, certificate, scan history, milk test, animal type and delivery promise.',
    sectionLabel: { crop: 'Crop sale', milk: 'Milk products', poultry: 'Eggs & poultry', animals: 'Live animals', proof: 'Certificates' },
    sectionHint: {
      crop: 'Sell organic and fresh produce with certificate, photo and mandi-linked price.',
      milk: 'Sell milk, ghee, paneer and curd with fat, protein, A2 and animal type proof.',
      poultry: 'Sell eggs, hens, chicks and poultry lots with batch photos.',
      animals: 'List goats, cows, buffalo, pigs and other animals with verified photos.',
      proof: 'Keep certificates, reports and trust signals in one wallet.',
    },
    sectionCta: { crop: 'Add crop sale', milk: 'Add milk product', poultry: 'Add poultry lot', animals: 'Add animal listing', proof: 'Upload proof' },
    items: {
      crop: [
        { title: 'Organic tomatoes', meta: '120 kg | Grade A', proof: 'Organic certificate attached', price: '₹42/kg', status: 'Live' },
        { title: 'Green chilli', meta: '40 kg | morning harvest', proof: 'Photo and farm scan ready', price: '₹68/kg', status: 'Live' },
      ],
      milk: [
        { title: 'A2 cow milk', meta: '35 L today | Gir cow', proof: 'Fat 4.8% | Protein 3.4%', price: '₹78/L', value: 'A2', status: 'Live' },
        { title: 'Fresh ghee', meta: '6 kg | small batch', proof: 'Milk source verified', price: '₹920/kg', value: 'Pure', status: 'Draft' },
      ],
      poultry: [
        { title: 'Desi eggs', meta: '90 eggs | free range', proof: 'Batch photo pending', price: '₹11/egg', value: '90', status: 'Draft' },
        { title: 'Healthy hens', meta: '12 birds | vaccinated', proof: 'Health note attached', price: '₹460/bird', value: '12', status: 'Live' },
      ],
      animals: [
        { title: 'Osmanabadi goats', meta: '4 goats | 18-24 kg', proof: 'Photo and age proof ready', price: '₹8,500+', value: '4', status: 'Live' },
        { title: 'Gir cow listing', meta: 'A2 milk line | calf with cow', proof: 'Milk report required', price: 'Quote', value: '1', status: 'Draft' },
      ],
    },
    ordersList: [
      { buyer: 'Green Basket', item: 'Tomato | 60 kg', value: '₹2,520', action: 'Pack' },
      { buyer: 'A2 Fresh Co-op', item: 'Milk | 20 L', value: '₹1,560', action: 'Confirm fat' },
      { buyer: 'Hotel Suruchi', item: 'Eggs | 60', value: '₹660', action: 'Dispatch' },
    ],
    pipeline: ['New', 'Accepted', 'Ready', 'On road', 'Done'],
    proofWallet: 'Proof wallet',
    quality: 'Quality',
    locationTrust: 'Local verified',
    todaysFocus: 'Today focus',
    readyToSell: 'Ready to sell',
  },
  hi: {
    title: 'बिक्री केंद्र',
    subtitle: 'एक व्यवसाय लाइन चुनें और उसे साफ मिनी डैशबोर्ड की तरह चलाएं.',
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
    addCertificate: 'प्रमाणपत्र जोड़ें',
    addMilkReport: 'दूध जांच जोड़ें',
    addBirdBatch: 'बैच फोटो जोड़ें',
    addAnimalPhoto: 'पशु फोटो जोड़ें',
    smallNote: 'ग्रेड, प्रमाणपत्र, स्कैन इतिहास, दूध जांच, पशु प्रकार और डिलीवरी वादा खरीदार भरोसा बनाते हैं.',
    sectionLabel: { crop: 'फसल बिक्री', milk: 'दूध उत्पाद', poultry: 'अंडे व पोल्ट्री', animals: 'जीवित पशु', proof: 'प्रमाणपत्र' },
    sectionHint: {
      crop: 'ऑर्गेनिक और ताजी उपज प्रमाणपत्र, फोटो और मंडी से जुड़े भाव के साथ बेचें.',
      milk: 'दूध, घी, पनीर, दही को फैट, प्रोटीन, A2 और पशु प्रकार प्रमाण के साथ बेचें.',
      poultry: 'अंडे, मुर्गी, चूजे और पोल्ट्री लॉट बैच फोटो के साथ बेचें.',
      animals: 'बकरी, गाय, भैंस, सूअर और अन्य पशु सत्यापित फोटो के साथ जोड़ें.',
      proof: 'प्रमाणपत्र, रिपोर्ट और भरोसा संकेत एक वॉलेट में रखें.',
    },
    sectionCta: { crop: 'फसल बिक्री जोड़ें', milk: 'दूध उत्पाद जोड़ें', poultry: 'पोल्ट्री लॉट जोड़ें', animals: 'पशु लिस्टिंग जोड़ें', proof: 'प्रमाण अपलोड' },
    items: {
      crop: [
        { title: 'ऑर्गेनिक टमाटर', meta: '120 kg | ग्रेड A', proof: 'ऑर्गेनिक प्रमाणपत्र जुड़ा', price: '₹42/kg', status: 'लाइव' },
        { title: 'हरी मिर्च', meta: '40 kg | सुबह की तुड़ाई', proof: 'फोटो और खेत स्कैन तैयार', price: '₹68/kg', status: 'लाइव' },
      ],
      milk: [
        { title: 'A2 गाय दूध', meta: '35 L आज | गिर गाय', proof: 'फैट 4.8% | प्रोटीन 3.4%', price: '₹78/L', value: 'A2', status: 'लाइव' },
        { title: 'ताजा घी', meta: '6 kg | छोटा बैच', proof: 'दूध स्रोत सत्यापित', price: '₹920/kg', value: 'शुद्ध', status: 'ड्राफ्ट' },
      ],
      poultry: [
        { title: 'देसी अंडे', meta: '90 अंडे | मुक्त पालन', proof: 'बैच फोटो बाकी', price: '₹11/अंडा', value: '90', status: 'ड्राफ्ट' },
        { title: 'स्वस्थ मुर्गी', meta: '12 पक्षी | टीकाकरण', proof: 'स्वास्थ्य नोट जुड़ा', price: '₹460/पक्षी', value: '12', status: 'लाइव' },
      ],
      animals: [
        { title: 'उस्मानाबादी बकरी', meta: '4 बकरी | 18-24 kg', proof: 'फोटो और उम्र प्रमाण तैयार', price: '₹8,500+', value: '4', status: 'लाइव' },
        { title: 'गिर गाय लिस्टिंग', meta: 'A2 दूध लाइन | बछड़ा साथ', proof: 'दूध रिपोर्ट चाहिए', price: 'भाव पूछें', value: '1', status: 'ड्राफ्ट' },
      ],
    },
    ordersList: [
      { buyer: 'ग्रीन बास्केट', item: 'टमाटर | 60 kg', value: '₹2,520', action: 'पैक करें' },
      { buyer: 'A2 फ्रेश सहकारी', item: 'दूध | 20 L', value: '₹1,560', action: 'फैट पुष्टि' },
      { buyer: 'होटल सुरुचि', item: 'अंडे | 60', value: '₹660', action: 'भेजें' },
    ],
    pipeline: ['नया', 'स्वीकार', 'तैयार', 'रास्ते में', 'पूर्ण'],
    proofWallet: 'प्रमाण वॉलेट',
    quality: 'गुणवत्ता',
    locationTrust: 'स्थानीय सत्यापित',
    todaysFocus: 'आज का ध्यान',
    readyToSell: 'बिक्री के लिए तैयार',
  },
  mr: {
    title: 'विक्री केंद्र',
    subtitle: 'एक व्यवसाय लाइन निवडा आणि ती स्वच्छ मिनी डॅशबोर्डसारखी चालवा.',
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
    addCertificate: 'प्रमाणपत्र जोडा',
    addMilkReport: 'दूध चाचणी जोडा',
    addBirdBatch: 'बॅच फोटो जोडा',
    addAnimalPhoto: 'जनावराचा फोटो जोडा',
    smallNote: 'ग्रेड, प्रमाणपत्र, स्कॅन इतिहास, दूध चाचणी, जनावर प्रकार आणि डिलिव्हरी वचन खरेदीदार विश्वास वाढवतात.',
    sectionLabel: { crop: 'पीक विक्री', milk: 'दूध उत्पादने', poultry: 'अंडी व कोंबडी', animals: 'जिवंत जनावरे', proof: 'प्रमाणपत्र' },
    sectionHint: {
      crop: 'सेंद्रिय आणि ताजे उत्पादन प्रमाणपत्र, फोटो आणि मंडीशी जोडलेल्या भावासह विका.',
      milk: 'दूध, तूप, पनीर, दही फॅट, प्रोटीन, A2 आणि जनावर प्रकार पुराव्यासह विका.',
      poultry: 'अंडी, कोंबडी, पिल्ले आणि पोल्ट्री लॉट बॅच फोटोसह विका.',
      animals: 'शेळी, गाय, म्हैस, डुक्कर आणि इतर जनावरे सत्यापित फोटोसह जोडा.',
      proof: 'प्रमाणपत्रे, रिपोर्ट आणि विश्वास संकेत एका वॉलेटमध्ये ठेवा.',
    },
    sectionCta: { crop: 'पीक विक्री जोडा', milk: 'दूध उत्पादन जोडा', poultry: 'पोल्ट्री लॉट जोडा', animals: 'जनावर लिस्टिंग जोडा', proof: 'प्रमाण अपलोड' },
    items: {
      crop: [
        { title: 'सेंद्रिय टोमॅटो', meta: '120 kg | ग्रेड A', proof: 'सेंद्रिय प्रमाणपत्र जोडले', price: '₹42/kg', status: 'लाइव्ह' },
        { title: 'हिरवी मिरची', meta: '40 kg | सकाळची तोडणी', proof: 'फोटो आणि शेत स्कॅन तयार', price: '₹68/kg', status: 'लाइव्ह' },
      ],
      milk: [
        { title: 'A2 गाय दूध', meta: '35 L आज | गिर गाय', proof: 'फॅट 4.8% | प्रोटीन 3.4%', price: '₹78/L', value: 'A2', status: 'लाइव्ह' },
        { title: 'ताजे तूप', meta: '6 kg | छोटा बॅच', proof: 'दूध स्रोत सत्यापित', price: '₹920/kg', value: 'शुद्ध', status: 'ड्राफ्ट' },
      ],
      poultry: [
        { title: 'देशी अंडी', meta: '90 अंडी | मुक्त पालन', proof: 'बॅच फोटो बाकी', price: '₹11/अंडे', value: '90', status: 'ड्राफ्ट' },
        { title: 'निरोगी कोंबडी', meta: '12 पक्षी | लसीकरण', proof: 'आरोग्य नोंद जोडली', price: '₹460/पक्षी', value: '12', status: 'लाइव्ह' },
      ],
      animals: [
        { title: 'उस्मानाबादी शेळी', meta: '4 शेळ्या | 18-24 kg', proof: 'फोटो आणि वय पुरावा तयार', price: '₹8,500+', value: '4', status: 'लाइव्ह' },
        { title: 'गिर गाय लिस्टिंग', meta: 'A2 दूध लाइन | वासरू सोबत', proof: 'दूध रिपोर्ट हवा', price: 'भाव विचारा', value: '1', status: 'ड्राफ्ट' },
      ],
    },
    ordersList: [
      { buyer: 'ग्रीन बास्केट', item: 'टोमॅटो | 60 kg', value: '₹2,520', action: 'पॅक करा' },
      { buyer: 'A2 फ्रेश सहकारी', item: 'दूध | 20 L', value: '₹1,560', action: 'फॅट खात्री' },
      { buyer: 'हॉटेल सुरुची', item: 'अंडी | 60', value: '₹660', action: 'पाठवा' },
    ],
    pipeline: ['नवीन', 'स्वीकारले', 'तयार', 'रस्त्यात', 'पूर्ण'],
    proofWallet: 'प्रमाण वॉलेट',
    quality: 'गुणवत्ता',
    locationTrust: 'स्थानिक सत्यापित',
    todaysFocus: 'आजचा फोकस',
    readyToSell: 'विक्रीसाठी तयार',
  },
};

const sectionConfig: Array<{ key: SectionKey; icon: LucideIcon; upload?: UploadKey }> = [
  { key: 'crop', icon: Store },
  { key: 'milk', icon: Milk, upload: 'milkReport' },
  { key: 'poultry', icon: Egg, upload: 'birdBatch' },
  { key: 'animals', icon: PawPrint, upload: 'animalPhoto' },
  { key: 'proof', icon: FileCheck2, upload: 'certificate' },
];

export default function CommerceHub({ lang, placeLabel }: Props) {
  const copy = COPY[lang];
  const [activeSection, setActiveSection] = useState<SectionKey>('crop');
  const [uploads, setUploads] = useState<Record<UploadKey, string>>({ certificate: '', milkReport: '', birdBatch: '', animalPhoto: '' });
  const trustScore = useMemo(() => uploads.certificate ? 92 : 78, [uploads.certificate]);
  const activeConfig = sectionConfig.find((item) => item.key === activeSection) ?? sectionConfig[0];

  const updateUpload = (key: UploadKey, name: string) => setUploads((current) => ({ ...current, [key]: name }));

  return (
    <section className="commerce-hub commerce-hub-wide commerce-page-dashboard">
      <div className="commerce-topline premium-glass-card premium-glass-card-raised">
        <div className="commerce-topline-copy">
          <span className="section-kicker"><Store className="h-3.5 w-3.5" /> {copy.title}</span>
          <h2>{copy.sectionLabel[activeSection]}</h2>
          <p>{copy.sectionHint[activeSection]}</p>
        </div>
        <div className="commerce-topline-actions">
          <span><small>{copy.locality}</small><strong>{placeLabel}</strong></span>
          <button type="button"><Plus className="h-4 w-4" /> {copy.sectionCta[activeSection]}</button>
        </div>
      </div>

      <nav className="commerce-subnav premium-glass-card" aria-label={copy.title}>
        {sectionConfig.map((section) => {
          const Icon = section.icon;
          return (
            <button key={section.key} type="button" onClick={() => setActiveSection(section.key)} className={activeSection === section.key ? 'active' : ''}>
              <Icon className="h-4 w-4" />
              <span>{copy.sectionLabel[section.key]}</span>
            </button>
          );
        })}
      </nav>

      <div className="commerce-kpi-strip">
        <article><IndianRupee className="h-5 w-5" /><span><small>{copy.earnings}</small><strong>₹42,740</strong></span></article>
        <article><PackageCheck className="h-5 w-5" /><span><small>{copy.orders}</small><strong>8</strong></span></article>
        <article><ShieldCheck className="h-5 w-5" /><span><small>{copy.trust}</small><strong>{trustScore}%</strong></span></article>
      </div>

      <section className="commerce-section-page premium-glass-card">
        <div className="commerce-section-head">
          <span><activeConfig.icon className="h-4 w-4" /> {copy.sectionLabel[activeSection]}</span>
          <em>{copy.readyToSell}</em>
        </div>
        {activeSection === 'proof' ? (
          <ProofDashboard copy={copy} certificateName={uploads.certificate} trustScore={trustScore} onUpload={(name) => updateUpload('certificate', name)} />
        ) : (
          <SellDashboard
            copy={copy}
            sectionKey={activeSection}
            uploadName={activeConfig.upload ? uploads[activeConfig.upload] : ''}
            onUpload={activeConfig.upload ? (name) => updateUpload(activeConfig.upload as UploadKey, name) : undefined}
          />
        )}
      </section>

      <section className="commerce-card commerce-orders-card premium-glass-card commerce-orders-wide commerce-orders-compact commerce-orders-page">
        <div className="commerce-card-head"><span><Truck className="h-4 w-4" /> {copy.orders}</span><em>8</em></div>
        <div className="commerce-pipeline">{copy.pipeline.map((stage, index) => <span key={stage} className={index < 3 ? 'commerce-stage-on' : ''}>{stage}</span>)}</div>
        <div className="commerce-order-list">{copy.ordersList.map((order) => <article key={order.buyer}><div><strong>{order.buyer}</strong><small>{order.item}</small></div><span>{order.value}</span><button type="button">{order.action}</button></article>)}</div>
      </section>
    </section>
  );
}

function SellDashboard({ copy, sectionKey, uploadName, onUpload }: { copy: CommerceCopy; sectionKey: Exclude<SectionKey, 'proof'>; uploadName: string; onUpload?: (name: string) => void }) {
  const uploadLabel = sectionKey === 'milk' ? copy.addMilkReport : sectionKey === 'poultry' ? copy.addBirdBatch : sectionKey === 'animals' ? copy.addAnimalPhoto : copy.sectionCta.crop;
  const items = copy.items[sectionKey];
  const featured = items[0];

  return (
    <div className="commerce-subpage-grid">
      <article className="commerce-feature-card">
        <div>
          <small>{copy.todaysFocus}</small>
          <h3>{featured.title}</h3>
          <p>{featured.meta}</p>
        </div>
        <strong>{featured.price}</strong>
        <button type="button">{copy.sectionCta[sectionKey]}<ChevronRight className="h-4 w-4" /></button>
      </article>

      <div className="commerce-list-panel">
        {items.map((item) => <ProductTile key={item.title} item={item} />)}
      </div>

      <aside className="commerce-action-panel">
        <div className="commerce-proof-mini">
          <BadgeCheck className="h-5 w-5" />
          <span><small>{copy.quality}</small><strong>{featured.proof}</strong></span>
        </div>
        {onUpload && (
          <label className="commerce-mini-upload commerce-mini-upload-wide">
            <Camera className="h-4 w-4" /> {uploadName || uploadLabel}
            <input type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => onUpload(event.currentTarget.files?.[0]?.name || '')} />
          </label>
        )}
        <p>{copy.smallNote}</p>
      </aside>
    </div>
  );
}

function ProofDashboard({ copy, certificateName, trustScore, onUpload }: { copy: CommerceCopy; certificateName: string; trustScore: number; onUpload: (name: string) => void }) {
  return (
    <div className="commerce-proof-page">
      <label className="commerce-upload commerce-upload-compact">
        <FileCheck2 className="h-5 w-5" />
        <span>{certificateName || copy.addCertificate}</span>
        <input type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => onUpload(event.currentTarget.files?.[0]?.name || '')} />
      </label>
      <div className="commerce-proof-stack commerce-proof-stack-wide">
        <div><span>{copy.grade}</span><strong>A</strong></div>
        <div><span>{copy.trust}</span><strong>{trustScore}%</strong></div>
        <div><span>{copy.locationTrust}</span><strong>{copy.verified}</strong></div>
      </div>
      <p>{copy.smallNote}</p>
    </div>
  );
}

function ProductTile({ item }: { item: SellItem }) {
  return (
    <article className="commerce-column-card commerce-product-row-card">
      <div className="commerce-column-card-top">
        <span><strong>{item.title}</strong><small>{item.meta}</small></span>
        <em>{item.value ?? item.status}</em>
      </div>
      <p><BadgeCheck className="h-3.5 w-3.5" /> {item.proof}</p>
      <div className="commerce-column-card-bottom">
        <strong>{item.price}</strong>
        <button type="button">{item.status}<ChevronRight className="h-4 w-4" /></button>
      </div>
    </article>
  );
}
