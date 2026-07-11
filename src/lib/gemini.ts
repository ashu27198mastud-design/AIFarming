// KisanMitra — Gemini AI Client (server-side only)
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export const isGeminiConfigured = !!process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (isGeminiConfigured) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

export const GEMINI_SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export type CropDiagnosisResult = {
  mostLikelyIssue: string;
  alternativePossibilities: string[];
  confidence: number;
  visibleIndicators: string[];
  severity: 'healthy' | 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  urgency: 'none' | 'routine' | 'soon' | 'urgent' | 'immediate' | 'review';
  questionsForAccuracy: string[];
  immediateAction: string;
  organicOptions: string[];
  chemicalCategory: string;
  preventionAdvice: string;
  followUpDays: number;
  requiresExpert: boolean;
  imageQuality: 'poor' | 'acceptable' | 'good';
  imageCategory: 'crop' | 'non-crop' | 'unclear';
  isFallback?: boolean;
};

function unavailableDiagnosis(): CropDiagnosisResult {
  return {
    mostLikelyIssue: 'विश्लेषण उपलब्ध नहीं / Analysis unavailable',
    alternativePossibilities: [],
    confidence: 0,
    visibleIndicators: [],
    severity: 'unknown',
    urgency: 'review',
    questionsForAccuracy: [
      'कृपया प्रभावित पत्ती का साफ़ क्लोज़-अप अपलोड करें। / Upload a clear close-up of the affected leaf.',
      'पूरे पौधे की एक अतिरिक्त फोटो दें। / Add one full-plant photograph.',
    ],
    immediateAction: 'इस स्कैन के आधार पर कोई उपचार न करें। कृपया दोबारा प्रयास करें। / Do not apply treatment based on this scan. Please retry.',
    organicOptions: [],
    chemicalCategory: '',
    preventionAdvice: 'स्पष्ट पहचान के बिना रसायन का उपयोग न करें। / Avoid chemical use without a clear diagnosis.',
    followUpDays: 0,
    requiresExpert: false,
    imageQuality: 'poor',
    imageCategory: 'unclear',
    isFallback: true,
  };
}

export async function analyzeCropImage(imageBase64: string, mimeType: string, farmContext: string): Promise<string> {
  if (!genAI) {
    return JSON.stringify(unavailableDiagnosis());
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    safetySettings: GEMINI_SAFETY_SETTINGS,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const prompt = `You are KisanMitra, an expert agronomist assistant.
Farm context: ${farmContext}

Analyse ONLY what is genuinely visible in the uploaded image. Never reuse a default diagnosis.

First classify the image as one of:
- crop: a recognisable crop or plant is visible
- non-crop: no crop or plant is visible
- unclear: image is too blurry, dark, distant, obstructed, or insufficient

Rules:
1. Do not assume the crop is tomato merely because the farm context mentions tomato.
2. Healthy must only be returned when the visible plant tissue shows no meaningful symptoms.
3. If the image is non-crop or unclear, set severity to unknown, confidence below 30, avoid naming a disease, and ask for a clearer image.
4. Different visible symptoms must produce different diagnoses.
5. If confidence is below 50, avoid treatment-specific chemical advice and request more evidence.
6. Do not provide pesticide dosages. Refer the farmer to the product label or local agriculture officer.
7. Return only JSON with these exact fields:
{
  "mostLikelyIssue": "Hindi + English diagnosis, or Unable to determine",
  "alternativePossibilities": ["Hindi + English"],
  "confidence": 0,
  "visibleIndicators": ["Hindi + English observations"],
  "severity": "healthy|low|medium|high|critical|unknown",
  "urgency": "none|routine|soon|urgent|immediate|review",
  "questionsForAccuracy": ["Hindi + English questions"],
  "immediateAction": "Maximum 3 short bilingual steps separated by newline",
  "organicOptions": ["Bilingual safe options"],
  "chemicalCategory": "General category only, no dosage",
  "preventionAdvice": "Bilingual prevention advice",
  "followUpDays": 0,
  "requiresExpert": false,
  "imageQuality": "poor|acceptable|good",
  "imageCategory": "crop|non-crop|unclear"
}`;

  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType } },
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text) as CropDiagnosisResult;

    return JSON.stringify({
      ...parsed,
      mostLikelyIssue: parsed.mostLikelyIssue || 'निर्धारित नहीं किया जा सका / Unable to determine crop condition',
      alternativePossibilities: Array.isArray(parsed.alternativePossibilities) ? parsed.alternativePossibilities : [],
      visibleIndicators: Array.isArray(parsed.visibleIndicators) ? parsed.visibleIndicators : [],
      questionsForAccuracy: Array.isArray(parsed.questionsForAccuracy) ? parsed.questionsForAccuracy : [],
      organicOptions: Array.isArray(parsed.organicOptions) ? parsed.organicOptions : [],
      confidence: Number.isFinite(parsed.confidence) ? Math.max(0, Math.min(100, parsed.confidence)) : 0,
      severity: parsed.severity || 'unknown',
      urgency: parsed.urgency || 'review',
      immediateAction: parsed.immediateAction || 'कृपया स्पष्ट फोटो के साथ पुनः प्रयास करें। / Please retry with a clearer image.',
      chemicalCategory: parsed.chemicalCategory || '',
      preventionAdvice: parsed.preventionAdvice || '',
      followUpDays: Number.isFinite(parsed.followUpDays) ? parsed.followUpDays : 0,
      requiresExpert: Boolean(parsed.requiresExpert),
      imageQuality: parsed.imageQuality || 'poor',
      imageCategory: parsed.imageCategory || 'unclear',
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return JSON.stringify(unavailableDiagnosis());
  }
}

export async function getKisanMitraRecommendation(prompt: string, farmContext: string): Promise<string> {
  if (!genAI) return getDemoAssistantResponse(prompt);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    safetySettings: GEMINI_SAFETY_SETTINGS,
    generationConfig: { temperature: 0.2 },
  });

  const systemPrompt = `You are KisanMitra (किसानमित्र), an expert AI crop companion for Indian farmers.
Farm context: ${farmContext}
Respond in a very simple, warm, and helpful tone in bilingual format (Hindi + English). Provide plain recommendations. Avoid technical jargon. Keep formatting clean.`;

  try {
    const result = await model.generateContent(`${systemPrompt}\n\nFarmer question: ${prompt}`);
    return result.response.text();
  } catch {
    return getDemoAssistantResponse(prompt);
  }
}

function getDemoAssistantResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('tomato') || lower.includes('disease') || lower.includes('leaf') || lower.includes('टमाटर') || lower.includes('बीमारी')) {
    return 'कृपया प्रभावित पत्ती और पूरे पौधे की स्पष्ट फोटो अपलोड करें। बिना फोटो विश्लेषण के बीमारी तय नहीं की जाएगी।\n\nPlease upload a clear affected-leaf image and one full-plant image. No disease will be assumed without image analysis.';
  }
  if (lower.includes('water') || lower.includes('irrigation') || lower.includes('पानी') || lower.includes('सिंचाई')) {
    return 'सिंचाई का निर्णय मिट्टी की नमी और ताज़ा मौसम पूर्वानुमान देखकर लें।\n\nUse current soil-moisture readings and the latest weather forecast before irrigating.';
  }
  if (lower.includes('market') || lower.includes('price') || lower.includes('sell') || lower.includes('मंडी') || lower.includes('भाव')) {
    return 'मंडी डेटा उपलब्ध होने पर स्थानीय भाव, परिवहन लागत और फसल की परिपक्वता की तुलना करें।\n\nWhen market data is available, compare local prices, transport cost, and crop maturity.';
  }
  return 'नमस्कार! मैं किसानमित्र हूँ। मैं फसल स्वास्थ्य, मौसम और बाजार निर्णय में मदद कर सकता हूँ।\n\nHello! I am KisanMitra. I can assist with crop health, weather, and market decisions.';
}
