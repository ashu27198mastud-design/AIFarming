'use client';

import { useEffect, useMemo, useState } from 'react';
import { Camera, CheckCircle2, FileText, HelpCircle, Leaf, Upload, XCircle } from 'lucide-react';

type Inputs = {
  soilType: 'unknown' | 'black' | 'red' | 'alluvial' | 'sandy' | 'clay';
  ph: string;
  water: 'low' | 'medium' | 'assured';
  irrigation: 'rain' | 'borewell' | 'canal' | 'drip';
  previousCrop: string;
  budget: 'low' | 'medium' | 'high';
};

type SoilAnalysis = {
  soilType: Inputs['soilType'];
  ph: number | null;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  organicCarbon: string;
  summary: string;
  warnings: string[];
  recommendations: string[];
  confidence: number;
};

type AiLandPlan = {
  landQualityScore: number;
  confidence: number;
  summary: string;
  take: Array<{ crop: string; score: number; why: string; fertilizerFocus: string }>;
  caution: Array<{ crop: string; score: number; why: string }>;
  avoid: Array<{ crop: string; score: number; why: string }>;
  preventiveActions: string[];
  missingEvidence: string[];
  disclaimer: string;
};

type Props = {
  coords: { lat: number; lng: number };
  market: { state: string; district: string; distanceKm: number };
};

const CROPS = [
  { name: 'Soyabean', season: 'kharif', soils: ['black', 'alluvial'], water: 'medium', budget: 'low' },
  { name: 'Cotton', season: 'kharif', soils: ['black', 'red'], water: 'medium', budget: 'medium' },
  { name: 'Tomato', season: 'both', soils: ['red', 'alluvial', 'sandy'], water: 'assured', budget: 'high' },
  { name: 'Onion', season: 'rabi', soils: ['black', 'alluvial', 'sandy'], water: 'medium', budget: 'medium' },
  { name: 'Wheat', season: 'rabi', soils: ['alluvial', 'clay', 'black'], water: 'assured', budget: 'medium' },
  { name: 'Millet', season: 'kharif', soils: ['sandy', 'red'], water: 'low', budget: 'low' },
] as const;

function currentSeason(): 'kharif' | 'rabi' | 'summer' {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return 'kharif';
  if (month >= 11 || month <= 3) return 'rabi';
  return 'summer';
}

function scoreCrop(crop: typeof CROPS[number], input: Inputs) {
  const season = currentSeason();
  let score = 44;
  const reasons: string[] = [];
  const risks: string[] = [];

  if (crop.season === season || crop.season === 'both') {
    score += 22;
    reasons.push('Suitable for the current sowing season');
  } else {
    score -= 24;
    risks.push('Not the preferred crop for the current sowing window');
  }

  if (input.soilType === 'unknown') {
    risks.push('Soil type is not confirmed');
  } else if ((crop.soils as readonly string[]).includes(input.soilType)) {
    score += 16;
    reasons.push('Good match for selected soil type');
  } else {
    score -= 12;
    risks.push('Soil compatibility is weak');
  }

  const waterRank = { low: 1, medium: 2, assured: 3 };
  if (waterRank[input.water] >= waterRank[crop.water]) {
    score += 12;
    reasons.push('Available water can support this crop');
  } else {
    score -= 22;
    risks.push('Water availability may be insufficient');
  }

  const budgetRank = { low: 1, medium: 2, high: 3 };
  if (budgetRank[input.budget] >= budgetRank[crop.budget]) score += 6;
  else {
    score -= 10;
    risks.push('Input cost may exceed selected budget');
  }

  const ph = Number(input.ph);
  if (Number.isFinite(ph) && ph > 0) {
    if (ph >= 6 && ph <= 7.8) {
      score += 8;
      reasons.push('Entered soil pH is broadly suitable');
    } else {
      score -= 10;
      risks.push('Soil pH needs expert correction planning');
    }
  }

  if (input.previousCrop.toLowerCase() === crop.name.toLowerCase()) {
    score -= 8;
    risks.push('Repeating the same crop can increase pest and nutrient risk');
  }

  const finalScore = Math.max(12, Math.min(96, score));
  return {
    ...crop,
    score: finalScore,
    status: finalScore >= 72 ? 'take' : finalScore >= 52 ? 'caution' : 'avoid',
    reasons: reasons.slice(0, 3),
    risks: risks.slice(0, 3),
  };
}

export default function FieldPlanner({ coords, market }: Props) {
  const [inputs, setInputs] = useState<Inputs>({
    soilType: 'unknown',
    ph: '',
    water: 'medium',
    irrigation: 'rain',
    previousCrop: '',
    budget: 'medium',
  });
  const [landPhoto, setLandPhoto] = useState<File | null>(null);
  const [soilReport, setSoilReport] = useState<File | null>(null);
  const [soilAnalysis, setSoilAnalysis] = useState<SoilAnalysis | null>(null);
  const [soilLoading, setSoilLoading] = useState(false);
  const [soilError, setSoilError] = useState('');
  const [aiPlan, setAiPlan] = useState<AiLandPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const photoUrl = useMemo(() => landPhoto ? URL.createObjectURL(landPhoto) : '', [landPhoto]);
  const ranked = useMemo(() => CROPS.map((crop) => scoreCrop(crop, inputs)).sort((a, b) => b.score - a.score), [inputs]);

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  const analyzeSoilReport = async (file: File) => {
    setSoilReport(file);
    setSoilLoading(true);
    setSoilError('');
    setSoilAnalysis(null);
    try {
      const body = new FormData();
      body.append('report', file);
      const response = await fetch('/api/ai/soil-report', { method: 'POST', body });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error || 'Unable to read soil report');
      const analysis = payload as SoilAnalysis;
      setSoilAnalysis(analysis);
      setInputs((current) => ({
        ...current,
        soilType: analysis.soilType !== 'unknown' ? analysis.soilType : current.soilType,
        ph: analysis.ph !== null ? String(analysis.ph) : current.ph,
      }));
    } catch (error) {
      setSoilError(error instanceof Error ? error.message : 'Unable to read soil report');
    } finally {
      setSoilLoading(false);
    }
  };

  const buildAiPlan = async () => {
    setShowResults(true);
    setPlanLoading(true);
    setPlanError('');
    setAiPlan(null);
    try {
      const context = {
        gps: { ...coords, nearestMandiDistrict: market.district, state: market.state, distanceKm: market.distanceKm },
        season: currentSeason(),
        soilType: inputs.soilType,
        ph: inputs.ph || null,
        waterAvailability: inputs.water,
        irrigation: inputs.irrigation,
        budget: inputs.budget,
        previousCrop: inputs.previousCrop || 'not provided',
        soilReport: soilAnalysis,
        evidence: { hasLandPhoto: Boolean(landPhoto), hasSoilReport: Boolean(soilReport) },
      };
      const body = new FormData();
      body.append('context', JSON.stringify(context));
      if (landPhoto) body.append('landPhoto', landPhoto);
      const response = await fetch('/api/ai/land-plan', { method: 'POST', body });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error || 'AI plan failed');
      setAiPlan(payload as AiLandPlan);
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : 'AI plan failed');
    } finally {
      setPlanLoading(false);
    }
  };

  const confidence = Math.min(94, 48 + (inputs.soilType !== 'unknown' ? 12 : 0) + (inputs.ph ? 10 : 0) + (landPhoto ? 10 : 0) + (soilReport ? 14 : 0));

  return (
    <section className="m3-card field-planner space-y-5">
      <div>
        <span className="section-kicker"><Leaf className="h-3.5 w-3.5 text-[#65776E]" /> Field crop planner</span>
        <h2 className="mt-2 text-xl font-black text-[#242824]">What should I plant on this land?</h2>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-zinc-600">Add what you know. A soil report and land photo improve the recommendation, but are optional.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="rounded-2xl border border-zinc-200 bg-white p-3 text-xs font-black text-zinc-600">
          Soil type
          <select value={inputs.soilType} onChange={(event) => setInputs({ ...inputs, soilType: event.target.value as Inputs['soilType'] })} className="mt-2 w-full bg-transparent text-sm font-bold text-zinc-800 outline-none">
            <option value="unknown">I do not know</option>
            <option value="black">Black soil</option>
            <option value="red">Red soil</option>
            <option value="alluvial">Alluvial / loam</option>
            <option value="sandy">Sandy</option>
            <option value="clay">Clay</option>
          </select>
        </label>
        <label className="rounded-2xl border border-zinc-200 bg-white p-3 text-xs font-black text-zinc-600">
          Soil pH (optional)
          <input inputMode="decimal" value={inputs.ph} onChange={(event) => setInputs({ ...inputs, ph: event.target.value })} placeholder="Example: 6.8" className="mt-2 w-full bg-transparent text-sm font-bold text-zinc-800 outline-none" />
        </label>
        <label className="rounded-2xl border border-zinc-200 bg-white p-3 text-xs font-black text-zinc-600">
          Water availability
          <select value={inputs.water} onChange={(event) => setInputs({ ...inputs, water: event.target.value as Inputs['water'] })} className="mt-2 w-full bg-transparent text-sm font-bold text-zinc-800 outline-none">
            <option value="low">Low / rain only</option>
            <option value="medium">Limited irrigation</option>
            <option value="assured">Assured water</option>
          </select>
        </label>
        <label className="rounded-2xl border border-zinc-200 bg-white p-3 text-xs font-black text-zinc-600">
          Budget
          <select value={inputs.budget} onChange={(event) => setInputs({ ...inputs, budget: event.target.value as Inputs['budget'] })} className="mt-2 w-full bg-transparent text-sm font-bold text-zinc-800 outline-none">
            <option value="low">Low input</option>
            <option value="medium">Medium</option>
            <option value="high">Can invest more</option>
          </select>
        </label>
      </div>

      <label className="block rounded-2xl border border-zinc-200 bg-white p-3 text-xs font-black text-zinc-600">
        Previous crop (helps avoid risky repetition)
        <input value={inputs.previousCrop} onChange={(event) => setInputs({ ...inputs, previousCrop: event.target.value })} placeholder="Example: Cotton" className="mt-2 w-full bg-transparent text-sm font-bold text-zinc-800 outline-none" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#A9B8AF] bg-[#F5F8F5] p-3 text-center">
          <Camera className="mb-2 h-5 w-5 text-[#52665B]" />
          <span className="text-xs font-black text-[#44524A]">{landPhoto ? 'Change land photo' : 'Add land photo'}</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => setLandPhoto(event.target.files?.[0] ?? null)} />
        </label>
        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#CDBA94] bg-[#FCF8EF] p-3 text-center">
          <Upload className="mb-2 h-5 w-5 text-[#8A7655]" />
          <span className="text-xs font-black text-[#6F5D3E]">{soilReport ? 'Change soil report' : 'Upload soil report'}</span>
          <input
            type="file"
            accept="image/*,.pdf,application/pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void analyzeSoilReport(file);
              event.currentTarget.value = '';
            }}
          />
        </label>
      </div>

      {(photoUrl || soilReport) && (
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-[#FAFAF8] p-3">
          {photoUrl ? <img src={photoUrl} alt="Land preview" className="h-14 w-14 rounded-xl object-cover" /> : <FileText className="h-8 w-8 text-[#8A7655]" />}
          <div className="min-w-0 text-xs font-bold text-zinc-600">
            {landPhoto && <p className="truncate">Land: {landPhoto.name}</p>}
            {soilReport && <p className="truncate">Soil report: {soilReport.name}</p>}
          </div>
        </div>
      )}

      {(soilLoading || soilAnalysis || soilError) && (
        <div className="soil-analysis-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="section-kicker"><FileText className="h-3.5 w-3.5" /> Soil intelligence</span>
              <h3 className="mt-2 text-lg font-black text-[#202723]">{soilLoading ? 'Reading laboratory report...' : soilAnalysis ? 'Report understood' : 'Report needs attention'}</h3>
            </div>
            {soilAnalysis && <span className="metric-pill">{soilAnalysis.confidence}% confidence</span>}
          </div>
          {soilLoading && <div className="soil-loading-bar"><span /></div>}
          {soilError && <p className="mt-3 text-sm font-bold text-rose-700">{soilError}</p>}
          {soilAnalysis && (
            <>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-700">{soilAnalysis.summary}</p>
              <div className="soil-metrics">
                <div><span>pH</span><strong>{soilAnalysis.ph ?? 'Not found'}</strong></div>
                <div><span>Nitrogen</span><strong>{soilAnalysis.nitrogen}</strong></div>
                <div><span>Phosphorus</span><strong>{soilAnalysis.phosphorus}</strong></div>
                <div><span>Potassium</span><strong>{soilAnalysis.potassium}</strong></div>
              </div>
              {soilAnalysis.recommendations[0] && <p className="mt-3 rounded-xl bg-white/70 p-3 text-xs font-bold text-[#46554D]">Next: {soilAnalysis.recommendations[0]}</p>}
            </>
          )}
        </div>
      )}

      <button type="button" onClick={() => void buildAiPlan()} disabled={planLoading} className="btn-m3-primary min-h-14 w-full text-sm">
        <Leaf className="h-5 w-5" /> {planLoading ? 'AI is analysing land evidence...' : 'Build AI crop plan'}
      </button>

      {showResults && (
        <div className="space-y-4 border-t border-zinc-100 pt-4">
          {planLoading && <div className="soil-analysis-panel"><span className="section-kicker">AI land analysis</span><h3 className="mt-2 text-lg font-black">Combining soil, GPS, season, water and land evidence...</h3><div className="soil-loading-bar"><span /></div></div>}
          {planError && <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{planError} Transparent local scores are shown below.</p>}
          {aiPlan && (
            <section className="ai-land-plan">
              <div className="flex items-start justify-between gap-4">
                <div><span className="section-kicker">AI land verdict</span><h3 className="mt-2 text-xl font-black">{aiPlan.summary}</h3></div>
                <div className="land-score"><strong>{aiPlan.landQualityScore}</strong><span>land score</span></div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {aiPlan.take.map((crop) => <div key={crop.crop} className="ai-crop-take"><span>Take</span><strong>{crop.crop} · {crop.score}/100</strong><p>{crop.why}</p><small>Nutrition: {crop.fertilizerFocus}</small></div>)}
                {aiPlan.avoid.map((crop) => <div key={crop.crop} className="ai-crop-avoid"><span>Avoid now</span><strong>{crop.crop} · {crop.score}/100</strong><p>{crop.why}</p></div>)}
              </div>
              {aiPlan.preventiveActions[0] && <p className="mt-3 text-sm font-bold text-[#43534b]">Prevent first: {aiPlan.preventiveActions[0]}</p>}
              <p className="mt-2 text-[11px] font-bold text-zinc-500">AI confidence {aiPlan.confidence}%. {aiPlan.disclaimer}</p>
            </section>
          )}
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-[#242824]">Crop decision</h3>
            <span className="metric-pill">{confidence}% evidence confidence</span>
          </div>
          {ranked.slice(0, 4).map((crop) => (
            <div key={crop.name} className={`rounded-2xl border p-3 ${crop.status === 'take' ? 'border-emerald-200 bg-emerald-50' : crop.status === 'caution' ? 'border-amber-200 bg-amber-50' : 'border-rose-200 bg-rose-50'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {crop.status === 'avoid' ? <XCircle className="h-5 w-5 text-rose-700" /> : crop.status === 'take' ? <CheckCircle2 className="h-5 w-5 text-emerald-700" /> : <HelpCircle className="h-5 w-5 text-amber-700" />}
                  <strong className="text-sm text-zinc-800">{crop.name}</strong>
                </div>
                <span className="text-xs font-black uppercase text-zinc-700">{crop.status === 'take' ? 'Take' : crop.status === 'avoid' ? 'Avoid now' : 'Caution'} · {crop.score}/100</span>
              </div>
              <p className="mt-2 text-xs font-bold leading-relaxed text-zinc-700">{crop.reasons[0] || crop.risks[0]}</p>
              {crop.risks[0] && <p className="mt-1 text-xs font-semibold text-zinc-600">Risk: {crop.risks[0]}</p>}
            </div>
          ))}
          {confidence < 70 && <p className="rounded-2xl bg-[#F4F6F4] p-3 text-xs font-bold leading-relaxed text-zinc-600">For a stronger decision, add soil pH, soil type, and a soil report. Confirm the final crop and fertilizer dose with a local agriculture officer.</p>}
        </div>
      )}
    </section>
  );
}
