'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { ChevronDown, Leaf, PackagePlus, ShoppingBag, X } from 'lucide-react';
import type { FertilizerGapResult } from '@/lib/fert-gap';
import type { LanguageCode } from '@/lib/i18n';

const INVENTORY_KEY = 'km-fertilizer-inventory-v2';

const COPY: Record<LanguageCode, {
  title: string;
  empty: string;
  addStock: string;
  buy: string;
  details: string;
  sheetTitle: string;
  sheetHelp: string;
  planned: string;
  stock: string;
  cancel: string;
  save: string;
}> = {
  hi: {
    title: 'उर्वरक योजना',
    empty: 'अपना उर्वरक स्टॉक दर्ज करें',
    addStock: 'स्टॉक जोड़ें',
    buy: 'खरीदें',
    details: 'विवरण',
    sheetTitle: 'उर्वरक स्टॉक',
    sheetHelp: 'अपनी मौजूदा योजना और स्टॉक दर्ज करें। हम केवल अंतर निकालते हैं।',
    planned: 'योजना के बैग',
    stock: 'उपलब्ध बैग',
    cancel: 'रद्द करें',
    save: 'सहेजें',
  },
  en: {
    title: 'Fertiliser plan',
    empty: 'Log your fertiliser stock',
    addStock: 'Add stock',
    buy: 'Buy category',
    details: 'Details',
    sheetTitle: 'Fertiliser stock',
    sheetHelp: 'Enter your existing plan and stock. We calculate only the gap.',
    planned: 'Planned bags',
    stock: 'Bags in stock',
    cancel: 'Cancel',
    save: 'Save',
  },
  mr: {
    title: 'खत योजना',
    empty: 'तुमचा खत साठा नोंदवा',
    addStock: 'साठा जोडा',
    buy: 'खरेदी करा',
    details: 'विवरण',
    sheetTitle: 'खत साठा',
    sheetHelp: 'तुमची सध्याची योजना आणि साठा नोंदवा. आम्ही फक्त फरक मोजतो.',
    planned: 'योजनेतील बॅग',
    stock: 'उपलब्ध बॅग',
    cancel: 'रद्द करा',
    save: 'जतन करा',
  },
};

type Props = {
  crop: string;
  language: LanguageCode;
};

type Inventory = {
  crop: string;
  plannedBags: number;
  stockBags: number;
};

export default function FertilizerGapCard({ crop, language }: Props) {
  const copy = COPY[language];
  const [result, setResult] = useState<FertilizerGapResult | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [plannedBags, setPlannedBags] = useState('');
  const [stockBags, setStockBags] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let inventory: Inventory | null = null;
    try {
      inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY) || 'null') as Inventory | null;
    } catch {
      inventory = null;
    }

    const params = new URLSearchParams({ crop, language });
    if (inventory && inventory.crop === crop && Number.isFinite(inventory.plannedBags) && Number.isFinite(inventory.stockBags)) {
      params.set('plannedBags', String(inventory.plannedBags));
      params.set('stockBags', String(inventory.stockBags));
    }

    fetch('/api/fert-gap?' + params.toString(), { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: FertilizerGapResult) => setResult(payload))
      .catch((error) => {
        if ((error as Error).name !== 'AbortError') setResult({ status: 'empty' });
      });

    return () => controller.abort();
  }, [crop, language, revision]);

  const openInventorySheet = () => {
    try {
      const inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY) || 'null') as Inventory | null;
      if (inventory && inventory.crop === crop && Number.isFinite(inventory.plannedBags) && Number.isFinite(inventory.stockBags)) {
        setPlannedBags(String(inventory.plannedBags));
        setStockBags(String(inventory.stockBags));
      } else {
        setPlannedBags('');
        setStockBags('');
      }
    } catch {
      setPlannedBags('');
      setStockBags('');
    }
    setSheetOpen(true);
  };

  const saveInventory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const planned = Number(plannedBags);
    const stock = Number(stockBags);
    if (!Number.isFinite(planned) || !Number.isFinite(stock) || planned < 0 || stock < 0) return;
    localStorage.setItem(INVENTORY_KEY, JSON.stringify({ crop, plannedBags: planned, stockBags: stock }));
    setSheetOpen(false);
    setRevision((value) => value + 1);
  };

  return (
    <section className="ops-fertilizer-panel fert-gap-card premium-glass-card">
      <div className="ops-panel-heading fert-gap-heading">
        <span><Leaf className="h-4 w-4" /> {copy.title}</span>
        <strong>{crop}</strong>
      </div>

      {!result && <div className="fert-gap-loading" aria-label={copy.title} />}

      {result?.status === 'empty' && (
        <div className="fert-gap-empty">
          <p>{copy.empty}</p>
          <button type="button" className="fert-gap-primary" onClick={openInventorySheet}>
            <PackagePlus className="h-4 w-4" /> {copy.addStock}
          </button>
        </div>
      )}

      {result?.status === 'ready' && (
        <>
          <p className="fert-gap-verdict" aria-label={result.verdict}>
            <span>{result.verdictParts.prefix}</span>
            <strong>{result.verdictParts.quantity}</strong>
            <span>{result.verdictParts.suffix}</span>
          </p>
          <p className="fert-gap-context">{result.context}</p>
          <div className="fert-gap-actions">
            <Link className="fert-gap-primary" href={result.categoryPath}>
              <ShoppingBag className="h-4 w-4" /> {copy.buy}
            </Link>
            <details className="fert-gap-details">
              <summary>{copy.details}<ChevronDown className="h-3.5 w-3.5" /></summary>
              <p>{result.compliance}</p>
            </details>
          </div>
        </>
      )}

      {sheetOpen && (
        <div className="fert-inventory-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSheetOpen(false);
        }}>
          <section className="fert-inventory-sheet" role="dialog" aria-modal="true" aria-labelledby="fert-inventory-title">
            <div className="fert-inventory-header">
              <div><strong id="fert-inventory-title">{copy.sheetTitle}</strong><p>{copy.sheetHelp}</p></div>
              <button type="button" onClick={() => setSheetOpen(false)} aria-label={copy.cancel}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={saveInventory}>
              <label><span>{copy.planned}</span><input min="0" step="1" inputMode="numeric" required value={plannedBags} onChange={(event) => setPlannedBags(event.target.value)} /></label>
              <label><span>{copy.stock}</span><input min="0" step="1" inputMode="numeric" required value={stockBags} onChange={(event) => setStockBags(event.target.value)} /></label>
              <div className="fert-inventory-actions">
                <button type="button" onClick={() => setSheetOpen(false)}>{copy.cancel}</button>
                <button type="submit" className="fert-gap-primary">{copy.save}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
