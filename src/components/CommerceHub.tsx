'use client';

import { useMemo, useState } from 'react';
import { BadgeCheck, Camera, ChevronRight, Egg, FileCheck2, IndianRupee, Milk, PackageCheck, Plus, ShieldCheck, Store, Truck } from 'lucide-react';
import type { LanguageCode } from '@/lib/i18n';

type Props = {
  lang: LanguageCode;
  placeLabel: string;
};

const COPY = {
  en: {
    title: 'Seller Hub',
    subtitle: 'Sell produce, milk, poultry and certified farm products from one simple desk.',
    locality: 'Selling from',
    primary: 'Create listing',
    organic: 'Organic produce',
    dairy: 'Dairy milk',
    poultry: 'Poultry & eggs',
    certificate: 'Certificate vault',
    orders: 'Orders today',
    earnings: 'Season earnings',
    trust: 'Buyer trust',
    addCertificate: 'Add certificate',
    addMilkReport: 'Add milk test',
    addBirdBatch: 'Add poultry batch',
    fat: 'Fat',
    protein: 'Protein',
    a2: 'A2 claim',
    animal: 'Animal',
    grade: 'Grade',
    live: 'Live',
    draft: 'Draft',
    verified: 'Verified',
    pending: 'Pending',
    nextStep: 'Next step',
    dispatch: 'Pack & dispatch',
    publish: 'Publish after certificate',
    collect: 'Collect milk sample',
    smallNote: 'Keep details short. Buyers trust proof: grade, certificate, scan history and delivery promise.',
    orderPipeline: ['New', 'Accepted', 'Ready', 'On road', 'Done'],
    products: [
      { title: 'Organic tomatoes', meta: '120 kg · Grade A', proof: 'Organic certificate attached', price: '₹42/kg', status: 'Live' },
      { title: 'A2 cow milk', meta: '35 L today · Gir cow', proof: 'Fat 4.8% · Protein 3.4%', price: '₹78/L', status: 'Live' },
      { title: 'Desi eggs', meta: '90 eggs · free range', proof: 'Batch photo pending', price: '₹11/egg', status: 'Draft' },
    ],
    ordersList: [
      { buyer: 'Green Basket', item: 'Tomato · 60 kg', value: '₹2,520', action: 'Pack' },
      { buyer: 'A2 Fresh Co-op', item: 'Milk · 20 L', value: '₹1,560', action: 'Confirm fat' },
      { buyer: 'Hotel Suruchi', item: 'Eggs · 60', value: '₹660', action: 'Dispatch' },
    ],
  },
  hi: {
    title: 'बिक्री केंद्र',
    subtitle: 'फसल, दूध, अंडे और प्रमाणित उत्पाद एक सरल जगह से बेचें।',
    locality: 'बिक्री स्थान',
    primary: 'नई बिक्री जोड़ें',
    organic: 'ऑर्गेनिक उत्पाद',
    dairy: 'डेयरी दूध',
    poultry: 'पोल्ट्री और अंडे',
    certificate: 'प्रमाणपत्र वॉल्ट',
    orders: 'आज के ऑर्डर',
    earnings: 'सीजन कमाई',
    trust: 'खरीदार भरोसा',
    addCertificate: 'प्रमाणपत्र जोड़ें',
    addMilkReport: 'दूध टेस्ट जोड़ें',
    addBirdBatch: 'पोल्ट्री बैच जोड़ें',
    fat: 'फैट',
    protein: 'प्रोटीन',
    a2: 'A2 दावा',
    animal: 'पशु',
    grade: 'ग्रेड',
    live: 'लाइव',
    draft: 'ड्राफ्ट',
    verified: 'सत्यापित',
    pending: 'बाकी',
    nextStep: 'अगला कदम',
    dispatch: 'पैक कर भेजें',
    publish: 'प्रमाणपत्र के बाद लाइव करें',
    collect: 'दूध सैंपल लें',
    smallNote: 'कम शब्द, मजबूत भरोसा: ग्रेड, प्रमाणपत्र, स्कैन इतिहास और डिलीवरी वादा।',
    orderPipeline: ['नया', 'स्वीकार', 'तैयार', 'रास्ते में', 'पूर्ण'],
    products: [
      { title: 'ऑर्गेनिक टमाटर', meta: '120 kg · ग्रेड A', proof: 'ऑर्गेनिक प्रमाणपत्र जुड़ा', price: '₹42/kg', status: 'लाइव' },
      { title: 'A2 गाय दूध', meta: '35 L आज · गिर गाय', proof: 'फैट 4.8% · प्रोटीन 3.4%', price: '₹78/L', status: 'लाइव' },
      { title: 'देसी अंडे', meta: '90 अंडे · खुले पालन', proof: 'बैच फोटो बाकी', price: '₹11/अंडा', status: 'ड्राफ्ट' },
    ],
    ordersList: [
      { buyer: 'ग्रीन बास्केट', item: 'टमाटर · 60 kg', value: '₹2,520', action: 'पैक करें' },
      { buyer: 'A2 फ्रेश सहकारी', item: 'दूध · 20 L', value: '₹1,560', action: 'फैट पुष्टि' },
      { buyer: 'होटल सुरुचि', item: 'अंडे · 60', value: '₹660', action: 'भेजें' },
    ],
  },
  mr: {
    title: 'विक्री केंद्र',
    subtitle: 'पीक, दूध, अंडी आणि प्रमाणित शेतमाल एका सोप्या जागेतून विक्री करा.',
    locality: 'विक्री स्थान',
    primary: 'नवीन विक्री जोडा',
    organic: 'सेंद्रिय शेतमाल',
    dairy: 'दुग्ध विक्री',
    poultry: 'कोंबडी व अंडी',
    certificate: 'प्रमाणपत्र वॉल्ट',
    orders: 'आजचे ऑर्डर',
    earnings: 'हंगाम कमाई',
    trust: 'खरेदीदार विश्वास',
    addCertificate: 'प्रमाणपत्र जोडा',
    addMilkReport: 'दूध चाचणी जोडा',
    addBirdBatch: 'कोंबडी बॅच जोडा',
    fat: 'फॅट',
    protein: 'प्रोटीन',
    a2: 'A2 दावा',
    animal: 'जनावर',
    grade: 'ग्रेड',
    live: 'लाइव्ह',
    draft: 'ड्राफ्ट',
    verified: 'सत्यापित',
    pending: 'बाकी',
    nextStep: 'पुढचे पाऊल',
    dispatch: 'पॅक करून पाठवा',
    publish: 'प्रमाणपत्रानंतर लाइव्ह करा',
    collect: 'दूध नमुना घ्या',
    smallNote: 'कमी मजकूर, मजबूत विश्वास: ग्रेड, प्रमाणपत्र, स्कॅन इतिहास आणि डिलिव्हरी वचन.',
    orderPipeline: ['नवीन', 'स्वीकारले', 'तयार', 'रस्त्यात', 'पूर्ण'],
    products: [
      { title: 'सेंद्रिय टोमॅटो', meta: '120 kg · ग्रेड A', proof: 'सेंद्रिय प्रमाणपत्र जोडले', price: '₹42/kg', status: 'लाइव्ह' },
      { title: 'A2 गाय दूध', meta: '35 L आज · गिर गाय', proof: 'फॅट 4.8% · प्रोटीन 3.4%', price: '₹78/L', status: 'लाइव्ह' },
      { title: 'देशी अंडी', meta: '90 अंडी · मुक्त पालन', proof: 'बॅच फोटो बाकी', price: '₹11/अंडे', status: 'ड्राफ्ट' },
    ],
    ordersList: [
      { buyer: 'ग्रीन बास्केट', item: 'टोमॅटो · 60 kg', value: '₹2,520', action: 'पॅक करा' },
      { buyer: 'A2 फ्रेश सहकारी', item: 'दूध · 20 L', value: '₹1,560', action: 'फॅट खात्री' },
      { buyer: 'हॉटेल सुरुची', item: 'अंडी · 60', value: '₹660', action: 'पाठवा' },
    ],
  },
} as const;

export default function CommerceHub({ lang, placeLabel }: Props) {
  const copy = COPY[lang];
  const [certificateName, setCertificateName] = useState('');
  const [milkReportName, setMilkReportName] = useState('');
  const [birdBatchName, setBirdBatchName] = useState('');
  const trustScore = useMemo(() => certificateName ? 92 : 78, [certificateName]);

  return (
    <section className="commerce-hub">
      <div className="commerce-hero premium-glass-card premium-glass-card-raised">
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

      <div className="commerce-stat-row">
        <article><IndianRupee className="h-5 w-5" /><span><small>{copy.earnings}</small><strong>₹42,740</strong></span></article>
        <article><PackageCheck className="h-5 w-5" /><span><small>{copy.orders}</small><strong>8</strong></span></article>
        <article><ShieldCheck className="h-5 w-5" /><span><small>{copy.trust}</small><strong>{trustScore}%</strong></span></article>
      </div>

      <div className="commerce-grid">
        <section className="commerce-card commerce-product-card premium-glass-card">
          <div className="commerce-card-head"><span><LeafIcon /> {copy.organic}</span><em>{copy.live}</em></div>
          <div className="commerce-product-list">
            {copy.products.map((product) => (
              <article key={product.title}>
                <div><strong>{product.title}</strong><small>{product.meta}</small></div>
                <span>{product.price}</span>
                <p><BadgeCheck className="h-3.5 w-3.5" /> {product.proof}</p>
                <button type="button">{product.status}<ChevronRight className="h-4 w-4" /></button>
              </article>
            ))}
          </div>
        </section>

        <section className="commerce-card commerce-trust-card premium-glass-card">
          <div className="commerce-card-head"><span><FileCheck2 className="h-4 w-4" /> {copy.certificate}</span><em>{certificateName ? copy.verified : copy.pending}</em></div>
          <label className="commerce-upload">
            <FileCheck2 className="h-5 w-5" />
            <span>{certificateName || copy.addCertificate}</span>
            <input type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => setCertificateName(event.currentTarget.files?.[0]?.name || '')} />
          </label>
          <div className="commerce-proof-stack">
            <div><span>{copy.grade}</span><strong>A</strong></div>
            <div><span>{copy.trust}</span><strong>{trustScore}%</strong></div>
          </div>
          <p>{copy.smallNote}</p>
        </section>

        <section className="commerce-card commerce-dairy-card premium-glass-card">
          <div className="commerce-card-head"><span><Milk className="h-4 w-4" /> {copy.dairy}</span><em>{copy.live}</em></div>
          <div className="commerce-metric-grid">
            <div><small>{copy.fat}</small><strong>4.8%</strong></div>
            <div><small>{copy.protein}</small><strong>3.4%</strong></div>
            <div><small>{copy.a2}</small><strong>{copy.verified}</strong></div>
            <div><small>{copy.animal}</small><strong>Gir</strong></div>
          </div>
          <label className="commerce-mini-upload"><Camera className="h-4 w-4" /> {milkReportName || copy.addMilkReport}<input type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => setMilkReportName(event.currentTarget.files?.[0]?.name || '')} /></label>
        </section>

        <section className="commerce-card commerce-poultry-card premium-glass-card">
          <div className="commerce-card-head"><span><Egg className="h-4 w-4" /> {copy.poultry}</span><em>{copy.draft}</em></div>
          <div className="commerce-poultry-visual"><strong>90</strong><span>eggs</span></div>
          <label className="commerce-mini-upload"><Camera className="h-4 w-4" /> {birdBatchName || copy.addBirdBatch}<input type="file" accept="image/*" onChange={(event) => setBirdBatchName(event.currentTarget.files?.[0]?.name || '')} /></label>
        </section>

        <section className="commerce-card commerce-orders-card premium-glass-card">
          <div className="commerce-card-head"><span><Truck className="h-4 w-4" /> {copy.orders}</span><em>8</em></div>
          <div className="commerce-pipeline">
            {copy.orderPipeline.map((stage, index) => <span key={stage} className={index < 3 ? 'commerce-stage-on' : ''}>{stage}</span>)}
          </div>
          <div className="commerce-order-list">
            {copy.ordersList.map((order) => (
              <article key={order.buyer}>
                <div><strong>{order.buyer}</strong><small>{order.item}</small></div>
                <span>{order.value}</span>
                <button type="button">{order.action}</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function LeafIcon() {
  return <span className="commerce-leaf-dot" aria-hidden="true" />;
}