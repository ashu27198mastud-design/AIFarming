'use client';

import { useMemo, useState } from 'react';
import { BadgeCheck, Camera, ChevronRight, Egg, FileCheck2, IndianRupee, Milk, PackageCheck, PawPrint, Plus, ShieldCheck, Store, Truck } from 'lucide-react';
import type { LanguageCode } from '@/lib/i18n';

type Props = { lang: LanguageCode; placeLabel: string };
type Lane = 'crop' | 'milk' | 'poultry' | 'animals' | 'proof';

const COPY = {
  en: {
    title: 'Seller Hub', subtitle: 'Choose one selling lane. Crops, milk, eggs, poultry and animals each get their own simple dashboard.', locality: 'Selling from', primary: 'Create listing', earnings: 'Season earnings', orders: 'Orders today', trust: 'Buyer trust', live: 'Live', draft: 'Draft', verified: 'Verified', pending: 'Pending', grade: 'Grade', fat: 'Fat', protein: 'Protein', a2: 'A2 claim', animal: 'Animal', addCertificate: 'Add certificate', addMilkReport: 'Add milk test', addBirdBatch: 'Add poultry batch', addAnimalPhoto: 'Add animal photo', smallNote: 'Short proof builds trust: grade, certificate, scan history, milk test, animal type and delivery promise.', lanes: { crop: 'Crop sale', milk: 'Milk products', poultry: 'Eggs & poultry', animals: 'Live animals', proof: 'Certificates' }, laneHint: { crop: 'Organic and fresh produce with certificate and mandi anchor.', milk: 'Milk, ghee, paneer, curd with fat, protein, A2 and animal type.', poultry: 'Eggs, hens, chicks and poultry batches with photos.', animals: 'Goats, cows, buffalo, pigs and other animals for verified sale.', proof: 'Organic, dairy, vaccination and farm proof vault.' }, products: [{ title: 'Organic tomatoes', meta: '120 kg · Grade A', proof: 'Organic certificate attached', price: '₹42/kg', status: 'Live' }, { title: 'A2 cow milk', meta: '35 L today · Gir cow', proof: 'Fat 4.8% · Protein 3.4%', price: '₹78/L', status: 'Live' }, { title: 'Desi eggs', meta: '90 eggs · free range', proof: 'Batch photo pending', price: '₹11/egg', status: 'Draft' }], ordersList: [{ buyer: 'Green Basket', item: 'Tomato · 60 kg', value: '₹2,520', action: 'Pack' }, { buyer: 'A2 Fresh Co-op', item: 'Milk · 20 L', value: '₹1,560', action: 'Confirm fat' }, { buyer: 'Hotel Suruchi', item: 'Eggs · 60', value: '₹660', action: 'Dispatch' }], pipeline: ['New', 'Accepted', 'Ready', 'On road', 'Done'], milkProducts: ['A2 milk', 'Ghee', 'Paneer', 'Curd'], animals: ['Goat', 'Cow', 'Buffalo', 'Pig'], certificate: 'Certificate vault', crop: 'Organic produce', dairy: 'Dairy dashboard', poultry: 'Poultry dashboard', animalMarket: 'Animal marketplace' },
  hi: {
    title: 'बिक्री केंद्र', subtitle: 'एक बिक्री लेन चुनें। फसल, दूध, अंडे, पोल्ट्री और पशु के लिए अलग सरल डैशबोर्ड।', locality: 'बिक्री स्थान', primary: 'नई बिक्री जोड़ें', earnings: 'सीजन कमाई', orders: 'आज के ऑर्डर', trust: 'खरीदार भरोसा', live: 'लाइव', draft: 'ड्राफ्ट', verified: 'सत्यापित', pending: 'बाकी', grade: 'ग्रेड', fat: 'फैट', protein: 'प्रोटीन', a2: 'A2 दावा', animal: 'पशु', addCertificate: 'प्रमाणपत्र जोड़ें', addMilkReport: 'दूध टेस्ट जोड़ें', addBirdBatch: 'पोल्ट्री बैच जोड़ें', addAnimalPhoto: 'पशु फोटो जोड़ें', smallNote: 'कम शब्द, मजबूत भरोसा: ग्रेड, प्रमाणपत्र, स्कैन इतिहास, दूध टेस्ट, पशु प्रकार और डिलीवरी वादा।', lanes: { crop: 'फसल बिक्री', milk: 'दूध उत्पाद', poultry: 'अंडे व पोल्ट्री', animals: 'जीवित पशु', proof: 'प्रमाणपत्र' }, laneHint: { crop: 'ऑर्गेनिक और ताजी फसल, प्रमाणपत्र और मंडी भाव के साथ।', milk: 'दूध, घी, पनीर, दही: फैट, प्रोटीन, A2 और पशु प्रकार।', poultry: 'अंडे, मुर्गी, चूजे और पोल्ट्री बैच फोटो के साथ।', animals: 'बकरी, गाय, भैंस, सुअर और अन्य पशु सत्यापित बिक्री के लिए।', proof: 'ऑर्गेनिक, डेयरी, टीकाकरण और खेत प्रमाण वॉल्ट।' }, products: [{ title: 'ऑर्गेनिक टमाटर', meta: '120 kg · ग्रेड A', proof: 'ऑर्गेनिक प्रमाणपत्र जुड़ा', price: '₹42/kg', status: 'लाइव' }, { title: 'A2 गाय दूध', meta: '35 L आज · गिर गाय', proof: 'फैट 4.8% · प्रोटीन 3.4%', price: '₹78/L', status: 'लाइव' }, { title: 'देसी अंडे', meta: '90 अंडे · खुले पालन', proof: 'बैच फोटो बाकी', price: '₹11/अंडा', status: 'ड्राफ्ट' }], ordersList: [{ buyer: 'ग्रीन बास्केट', item: 'टमाटर · 60 kg', value: '₹2,520', action: 'पैक करें' }, { buyer: 'A2 फ्रेश सहकारी', item: 'दूध · 20 L', value: '₹1,560', action: 'फैट पुष्टि' }, { buyer: 'होटल सुरुचि', item: 'अंडे · 60', value: '₹660', action: 'भेजें' }], pipeline: ['नया', 'स्वीकार', 'तैयार', 'रास्ते में', 'पूर्ण'], milkProducts: ['A2 दूध', 'घी', 'पनीर', 'दही'], animals: ['बकरी', 'गाय', 'भैंस', 'सुअर'], certificate: 'प्रमाणपत्र वॉल्ट', crop: 'ऑर्गेनिक उत्पाद', dairy: 'डेयरी डैशबोर्ड', poultry: 'पोल्ट्री डैशबोर्ड', animalMarket: 'पशु बाजार' },
  mr: {
    title: 'विक्री केंद्र', subtitle: 'एक विक्री लेन निवडा. पीक, दूध, अंडी, कोंबडी आणि जनावरांसाठी स्वतंत्र सोपे डॅशबोर्ड.', locality: 'विक्री स्थान', primary: 'नवीन विक्री जोडा', earnings: 'हंगाम कमाई', orders: 'आजचे ऑर्डर', trust: 'खरेदीदार विश्वास', live: 'लाइव्ह', draft: 'ड्राफ्ट', verified: 'सत्यापित', pending: 'बाकी', grade: 'ग्रेड', fat: 'फॅट', protein: 'प्रोटीन', a2: 'A2 दावा', animal: 'जनावर', addCertificate: 'प्रमाणपत्र जोडा', addMilkReport: 'दूध चाचणी जोडा', addBirdBatch: 'कोंबडी बॅच जोडा', addAnimalPhoto: 'जनावराचा फोटो जोडा', smallNote: 'कमी मजकूर, मजबूत विश्वास: ग्रेड, प्रमाणपत्र, स्कॅन इतिहास, दूध चाचणी, जनावर प्रकार आणि डिलिव्हरी वचन.', lanes: { crop: 'पीक विक्री', milk: 'दूध उत्पादने', poultry: 'अंडी व कोंबडी', animals: 'जिवंत जनावरे', proof: 'प्रमाणपत्र' }, laneHint: { crop: 'सेंद्रिय आणि ताजे पीक, प्रमाणपत्र आणि मंडी भावासह.', milk: 'दूध, तूप, पनीर, दही: फॅट, प्रोटीन, A2 आणि जनावर प्रकार.', poultry: 'अंडी, कोंबडी, पिल्ले आणि पोल्ट्री बॅच फोटोसह.', animals: 'शेळी, गाय, म्हैस, डुक्कर आणि इतर जनावरे सत्यापित विक्रीसाठी.', proof: 'सेंद्रिय, डेअरी, लसीकरण आणि शेत पुरावा वॉल्ट.' }, products: [{ title: 'सेंद्रिय टोमॅटो', meta: '120 kg · ग्रेड A', proof: 'सेंद्रिय प्रमाणपत्र जोडले', price: '₹42/kg', status: 'लाइव्ह' }, { title: 'A2 गाय दूध', meta: '35 L आज · गिर गाय', proof: 'फॅट 4.8% · प्रोटीन 3.4%', price: '₹78/L', status: 'लाइव्ह' }, { title: 'देशी अंडी', meta: '90 अंडी · मुक्त पालन', proof: 'बॅच फोटो बाकी', price: '₹11/अंडे', status: 'ड्राफ्ट' }], ordersList: [{ buyer: 'ग्रीन बास्केट', item: 'टोमॅटो · 60 kg', value: '₹2,520', action: 'पॅक करा' }, { buyer: 'A2 फ्रेश सहकारी', item: 'दूध · 20 L', value: '₹1,560', action: 'फॅट खात्री' }, { buyer: 'हॉटेल सुरुची', item: 'अंडी · 60', value: '₹660', action: 'पाठवा' }], pipeline: ['नवीन', 'स्वीकारले', 'तयार', 'रस्त्यात', 'पूर्ण'], milkProducts: ['A2 दूध', 'तूप', 'पनीर', 'दही'], animals: ['शेळी', 'गाय', 'म्हैस', 'डुक्कर'], certificate: 'प्रमाणपत्र वॉल्ट', crop: 'सेंद्रिय शेतमाल', dairy: 'दुग्ध डॅशबोर्ड', poultry: 'कोंबडी डॅशबोर्ड', animalMarket: 'जनावर बाजार' },
} as const;

const laneIcons = { crop: Store, milk: Milk, poultry: Egg, animals: PawPrint, proof: FileCheck2 } as const;

type CommerceCopy = typeof COPY[LanguageCode];
const laneOrder: Lane[] = ['crop', 'milk', 'poultry', 'animals', 'proof'];

export default function CommerceHub({ lang, placeLabel }: Props) {
  const copy = COPY[lang];
  const [activeLane, setActiveLane] = useState<Lane>('crop');
  const [certificateName, setCertificateName] = useState('');
  const [milkReportName, setMilkReportName] = useState('');
  const [birdBatchName, setBirdBatchName] = useState('');
  const [animalPhotoName, setAnimalPhotoName] = useState('');
  const trustScore = useMemo(() => certificateName ? 92 : 78, [certificateName]);

  return (
    <section className="commerce-hub commerce-hub-wide">
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

      <div className="commerce-lane-shell premium-glass-card">
        <aside className="commerce-lane-rail" aria-label={copy.title}>
          {laneOrder.map((lane) => {
            const Icon = laneIcons[lane];
            return <button key={lane} type="button" onClick={() => setActiveLane(lane)} className={activeLane === lane ? 'active' : ''}><Icon className="h-4 w-4" /><span>{copy.lanes[lane]}</span></button>;
          })}
        </aside>
        <section className="commerce-lane-stage">
          <div className="commerce-lane-heading"><span>{copy.lanes[activeLane]}</span><p>{copy.laneHint[activeLane]}</p></div>
          {activeLane === 'crop' && <CropLane copy={copy} />}
          {activeLane === 'milk' && <MilkLane copy={copy} milkReportName={milkReportName} setMilkReportName={setMilkReportName} />}
          {activeLane === 'poultry' && <PoultryLane copy={copy} birdBatchName={birdBatchName} setBirdBatchName={setBirdBatchName} />}
          {activeLane === 'animals' && <AnimalLane copy={copy} animalPhotoName={animalPhotoName} setAnimalPhotoName={setAnimalPhotoName} />}
          {activeLane === 'proof' && <ProofLane copy={copy} certificateName={certificateName} setCertificateName={setCertificateName} trustScore={trustScore} />}
        </section>
      </div>

      <section className="commerce-card commerce-orders-card premium-glass-card commerce-orders-wide">
        <div className="commerce-card-head"><span><Truck className="h-4 w-4" /> {copy.orders}</span><em>8</em></div>
        <div className="commerce-pipeline">{copy.pipeline.map((stage, index) => <span key={stage} className={index < 3 ? 'commerce-stage-on' : ''}>{stage}</span>)}</div>
        <div className="commerce-order-list">{copy.ordersList.map((order) => <article key={order.buyer}><div><strong>{order.buyer}</strong><small>{order.item}</small></div><span>{order.value}</span><button type="button">{order.action}</button></article>)}</div>
      </section>
    </section>
  );
}

function CropLane({ copy }: { copy: CommerceCopy }) {
  return <div className="commerce-product-list commerce-lane-grid">{copy.products.map((product) => <article key={product.title}><div><strong>{product.title}</strong><small>{product.meta}</small></div><span>{product.price}</span><p><BadgeCheck className="h-3.5 w-3.5" /> {product.proof}</p><button type="button">{product.status}<ChevronRight className="h-4 w-4" /></button></article>)}</div>;
}

function MilkLane({ copy, milkReportName, setMilkReportName }: { copy: CommerceCopy; milkReportName: string; setMilkReportName: (name: string) => void }) {
  return <div className="commerce-split-lane"><section className="commerce-card commerce-dairy-card"><div className="commerce-card-head"><span><Milk className="h-4 w-4" /> {copy.dairy}</span><em>{copy.live}</em></div><div className="commerce-metric-grid"><div><small>{copy.fat}</small><strong>4.8%</strong></div><div><small>{copy.protein}</small><strong>3.4%</strong></div><div><small>{copy.a2}</small><strong>{copy.verified}</strong></div><div><small>{copy.animal}</small><strong>Gir</strong></div></div><label className="commerce-mini-upload"><Camera className="h-4 w-4" /> {milkReportName || copy.addMilkReport}<input type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => setMilkReportName(event.currentTarget.files?.[0]?.name || '')} /></label></section><section className="commerce-card commerce-product-card"><div className="commerce-card-head"><span><Milk className="h-4 w-4" /> {copy.milkProducts}</span><em>{copy.live}</em></div><div className="commerce-pill-grid">{copy.milkProducts.map((item) => <button key={item} type="button">{item}<ChevronRight className="h-4 w-4" /></button>)}</div></section></div>;
}

function PoultryLane({ copy, birdBatchName, setBirdBatchName }: { copy: CommerceCopy; birdBatchName: string; setBirdBatchName: (name: string) => void }) {
  return <div className="commerce-split-lane"><section className="commerce-card commerce-poultry-card"><div className="commerce-card-head"><span><Egg className="h-4 w-4" /> {copy.poultry}</span><em>{copy.draft}</em></div><div className="commerce-poultry-visual"><strong>90</strong><span>eggs</span></div><label className="commerce-mini-upload"><Camera className="h-4 w-4" /> {birdBatchName || copy.addBirdBatch}<input type="file" accept="image/*" onChange={(event) => setBirdBatchName(event.currentTarget.files?.[0]?.name || '')} /></label></section><section className="commerce-card"><div className="commerce-card-head"><span><Egg className="h-4 w-4" /> {copy.lanes.poultry}</span><em>{copy.live}</em></div><div className="commerce-pill-grid"><button type="button">Eggs<ChevronRight className="h-4 w-4" /></button><button type="button">Hen<ChevronRight className="h-4 w-4" /></button><button type="button">Chicks<ChevronRight className="h-4 w-4" /></button><button type="button">Feed batch<ChevronRight className="h-4 w-4" /></button></div></section></div>;
}

function AnimalLane({ copy, animalPhotoName, setAnimalPhotoName }: { copy: CommerceCopy; animalPhotoName: string; setAnimalPhotoName: (name: string) => void }) {
  return <div className="commerce-split-lane"><section className="commerce-card commerce-animal-card"><div className="commerce-card-head"><span><PawPrint className="h-4 w-4" /> {copy.animalMarket}</span><em>{copy.verified}</em></div><div className="commerce-animal-grid">{copy.animals.map((item) => <button key={item} type="button"><PawPrint className="h-4 w-4" /> {item}</button>)}</div><label className="commerce-mini-upload"><Camera className="h-4 w-4" /> {animalPhotoName || copy.addAnimalPhoto}<input type="file" accept="image/*" onChange={(event) => setAnimalPhotoName(event.currentTarget.files?.[0]?.name || '')} /></label></section><section className="commerce-card"><div className="commerce-card-head"><span><ShieldCheck className="h-4 w-4" /> {copy.trust}</span><em>82%</em></div><div className="commerce-proof-stack"><div><span>{copy.animal}</span><strong>{copy.animals[0]}</strong></div><div><span>{copy.grade}</span><strong>A</strong></div></div><p>{copy.smallNote}</p></section></div>;
}

function ProofLane({ copy, certificateName, setCertificateName, trustScore }: { copy: CommerceCopy; certificateName: string; setCertificateName: (name: string) => void; trustScore: number }) {
  return <section className="commerce-card commerce-trust-card"><div className="commerce-card-head"><span><FileCheck2 className="h-4 w-4" /> {copy.certificate}</span><em>{certificateName ? copy.verified : copy.pending}</em></div><label className="commerce-upload"><FileCheck2 className="h-5 w-5" /><span>{certificateName || copy.addCertificate}</span><input type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => setCertificateName(event.currentTarget.files?.[0]?.name || '')} /></label><div className="commerce-proof-stack"><div><span>{copy.grade}</span><strong>A</strong></div><div><span>{copy.trust}</span><strong>{trustScore}%</strong></div></div><p>{copy.smallNote}</p></section>;
}