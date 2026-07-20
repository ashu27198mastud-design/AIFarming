import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Egg, MapPin, Milk, Search, ShieldCheck, ShoppingBag, Sprout } from 'lucide-react';
import type { LanguageCode } from '@/lib/i18n';

const BAZAAR_NAME = 'KisanMitra Bazaar';

const COPY: Record<LanguageCode, {
  back: string;
  eyebrow: string;
  title: string;
  description: string;
  search: string;
  fresh: string;
  verified: string;
  mandi: string;
  farmerPrice: string;
  trace: string;
  buy: string;
  categories: string[];
  products: Array<{ title: string; meta: string; proof: string; price: string; mandi: string; distance: string; tag: string; icon: 'crop' | 'milk' | 'egg' }>;
}> = {
  en: {
    back: 'Dashboard',
    eyebrow: 'KisanMitra Bazaar',
    title: 'Fresh from nearby farms',
    description: 'Buy produce, milk and eggs directly from verified farmers. Mandi price stays visible so every deal feels fair.',
    search: 'Search tomato, A2 milk, eggs...',
    fresh: 'Harvested within 48h',
    verified: 'Verified proof',
    mandi: 'Mandi',
    farmerPrice: 'Farmer price',
    trace: 'View farm story',
    buy: 'Buy now',
    categories: ['Fresh crop', 'Organic', 'A2 milk', 'Eggs', 'Pre-book'],
    products: [
      { title: 'Organic tomato', meta: 'Grade A · 120 kg', proof: 'Organic certificate + 3 healthy scans', price: '₹42/kg', mandi: '₹38/kg', distance: '18 km', tag: 'Organic', icon: 'crop' },
      { title: 'A2 cow milk', meta: 'Gir cow · 35 L today', proof: 'Fat 4.8% · Protein 3.4%', price: '₹78/L', mandi: 'Local dairy ₹68/L', distance: '9 km', tag: 'Dairy', icon: 'milk' },
      { title: 'Desi eggs', meta: 'Free range · 90 eggs', proof: 'Batch photo verified', price: '₹11/egg', mandi: 'Retail ₹13/egg', distance: '12 km', tag: 'Poultry', icon: 'egg' },
    ],
  },
  hi: {
    back: 'डैशबोर्ड',
    eyebrow: 'किसानमित्र बाजार',
    title: 'नजदीकी खेतों से ताजा सामान',
    description: 'सत्यापित किसानों से फसल, दूध और अंडे सीधे खरीदें। मंडी भाव साथ दिखता है ताकि सौदा साफ रहे।',
    search: 'टमाटर, A2 दूध, अंडे खोजें...',
    fresh: '48 घंटे में कटाई',
    verified: 'प्रमाण सत्यापित',
    mandi: 'मंडी',
    farmerPrice: 'किसान भाव',
    trace: 'खेत कहानी देखें',
    buy: 'अभी खरीदें',
    categories: ['ताजा फसल', 'ऑर्गेनिक', 'A2 दूध', 'अंडे', 'प्री-बुक'],
    products: [
      { title: 'ऑर्गेनिक टमाटर', meta: 'ग्रेड A · 120 kg', proof: 'ऑर्गेनिक प्रमाणपत्र + 3 स्वस्थ स्कैन', price: '₹42/kg', mandi: '₹38/kg', distance: '18 km', tag: 'ऑर्गेनिक', icon: 'crop' },
      { title: 'A2 गाय दूध', meta: 'गिर गाय · 35 L आज', proof: 'फैट 4.8% · प्रोटीन 3.4%', price: '₹78/L', mandi: 'लोकल डेयरी ₹68/L', distance: '9 km', tag: 'डेयरी', icon: 'milk' },
      { title: 'देसी अंडे', meta: 'खुले पालन · 90 अंडे', proof: 'बैच फोटो सत्यापित', price: '₹11/अंडा', mandi: 'रिटेल ₹13/अंडा', distance: '12 km', tag: 'पोल्ट्री', icon: 'egg' },
    ],
  },
  mr: {
    back: 'डॅशबोर्ड',
    eyebrow: 'किसानमित्र बाजार',
    title: 'जवळच्या शेतातून ताजा माल',
    description: 'सत्यापित शेतकऱ्यांकडून पीक, दूध आणि अंडी थेट खरेदी करा. मंडी भाव सोबत दिसतो, त्यामुळे व्यवहार पारदर्शक राहतो.',
    search: 'टोमॅटो, A2 दूध, अंडी शोधा...',
    fresh: '48 तासांत काढणी',
    verified: 'प्रमाण सत्यापित',
    mandi: 'मंडी',
    farmerPrice: 'शेतकरी भाव',
    trace: 'शेत कथा पाहा',
    buy: 'आता खरेदी',
    categories: ['ताजे पीक', 'सेंद्रिय', 'A2 दूध', 'अंडी', 'प्री-बुक'],
    products: [
      { title: 'सेंद्रिय टोमॅटो', meta: 'ग्रेड A · 120 kg', proof: 'सेंद्रिय प्रमाणपत्र + 3 निरोगी स्कॅन', price: '₹42/kg', mandi: '₹38/kg', distance: '18 km', tag: 'सेंद्रिय', icon: 'crop' },
      { title: 'A2 गाय दूध', meta: 'गिर गाय · 35 L आज', proof: 'फॅट 4.8% · प्रोटीन 3.4%', price: '₹78/L', mandi: 'लोकल डेअरी ₹68/L', distance: '9 km', tag: 'दुग्ध', icon: 'milk' },
      { title: 'देशी अंडी', meta: 'मुक्त पालन · 90 अंडी', proof: 'बॅच फोटो सत्यापित', price: '₹11/अंडे', mandi: 'रिटेल ₹13/अंडे', distance: '12 km', tag: 'कोंबडी', icon: 'egg' },
    ],
  },
};

function ProductIcon({ type }: { type: 'crop' | 'milk' | 'egg' }) {
  if (type === 'milk') return <Milk className="h-5 w-5" />;
  if (type === 'egg') return <Egg className="h-5 w-5" />;
  return <Sprout className="h-5 w-5" />;
}

export default async function BazaarPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const language: LanguageCode = params.lang === 'mr' || params.lang === 'hi' ? params.lang : 'en';
  const copy = COPY[language];

  return (
    <main className="bazaar-page buyer-bazaar-page">
      <header className="bazaar-header buyer-bazaar-header">
        <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> {copy.back}</Link>
        <span><ShoppingBag className="h-5 w-5" /> {BAZAAR_NAME}</span>
      </header>

      <section className="buyer-bazaar-hero">
        <span className="section-kicker"><ShieldCheck className="h-3.5 w-3.5" /> {copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <div className="buyer-search"><Search className="h-4 w-4" /><span>{copy.search}</span></div>
        <div className="buyer-category-row">{copy.categories.map((item) => <button key={item} type="button">{item}</button>)}</div>
      </section>

      <section className="buyer-product-grid" aria-label={copy.eyebrow}>
        {copy.products.map((product) => (
          <article key={product.title} className="buyer-product-card">
            <div className="buyer-product-art"><ProductIcon type={product.icon} /><em>{product.tag}</em></div>
            <div className="buyer-product-copy">
              <span><MapPin className="h-3.5 w-3.5" /> {product.distance}</span>
              <h2>{product.title}</h2>
              <p>{product.meta}</p>
            </div>
            <div className="buyer-proof"><BadgeCheck className="h-4 w-4" /> {product.proof}</div>
            <div className="buyer-price-row">
              <div><small>{copy.farmerPrice}</small><strong>{product.price}</strong></div>
              <div><small>{copy.mandi}</small><strong>{product.mandi}</strong></div>
            </div>
            <div className="buyer-card-actions">
              <button type="button">{copy.buy}</button>
              <a href="#trace">{copy.trace}</a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}