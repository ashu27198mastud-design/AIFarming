// AETHER AG — Gemini AI Client (server-side only)
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

export async function analyzeCropImage(imageBase64: string, mimeType: string, farmContext: string): Promise<string> {
  if (!genAI) {
    return JSON.stringify(getDemoDiagnosisResponse());
  }
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    safetySettings: GEMINI_SAFETY_SETTINGS,
  });
  const prompt = `You are an expert agronomist AI assistant for the AETHER AG platform. 
Farm context: ${farmContext}

Analyze the uploaded crop image and return a structured JSON response with these exact fields:
{
  "mostLikelyIssue": "string",
  "alternativePossibilities": ["string"],
  "confidence": number (0-100),
  "visibleIndicators": ["string"],
  "severity": "low|medium|high|critical",
  "urgency": "routine|soon|urgent|immediate",
  "questionsForAccuracy": ["string"],
  "immediateAction": "string",
  "organicOptions": ["string"],
  "chemicalCategory": "string or null",
  "preventionAdvice": "string",
  "followUpDays": number,
  "requiresExpert": boolean
}

IMPORTANT: Do not provide specific pesticide dosages. Refer users to local agronomists for dosage. If confidence is below 60%, ask for more photos.`;
  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType } },
    ]);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : JSON.stringify(getDemoDiagnosisResponse());
  } catch (error) {
    console.error('Gemini API error:', error);
    return JSON.stringify(getDemoDiagnosisResponse());
  }
}

export async function getAetherRecommendation(prompt: string, farmContext: string): Promise<string> {
  if (!genAI) return getDemoAssistantResponse(prompt);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro', safetySettings: GEMINI_SAFETY_SETTINGS });
  const systemPrompt = `You are Aether, an expert AI agricultural advisor integrated into the AETHER AG operating system. 
Farm context: ${farmContext}
Respond in a helpful, confident, but appropriately cautious way. Always distinguish between confirmed data and predictions. Never make guaranteed yield or profit claims.`;
  try {
    const result = await model.generateContent(`${systemPrompt}\n\nFarmer question: ${prompt}`);
    return result.response.text();
  } catch {
    return getDemoAssistantResponse(prompt);
  }
}

function getDemoDiagnosisResponse() {
  return {
    mostLikelyIssue: 'Early Blight (Alternaria solani)',
    alternativePossibilities: ['Septoria Leaf Spot', 'Bacterial Speck', 'Calcium deficiency'],
    confidence: 78,
    visibleIndicators: ['Concentric dark brown rings on lower leaves', 'Yellow halo surrounding lesions', 'Progressive defoliation from bottom upward'],
    severity: 'medium',
    urgency: 'soon',
    questionsForAccuracy: ['How long have you noticed these marks?', 'Are the upper leaves also affected?', 'Have you applied fungicide in the last 14 days?'],
    immediateAction: 'Remove and destroy the 3–5 most severely affected lower leaves. Apply copper-based fungicide within 24 hours.',
    organicOptions: ['Copper hydroxide spray', 'Neem oil + baking soda solution', 'Trichoderma biocontrol agent'],
    chemicalCategory: 'Protectant fungicide — consult local agronomist for dosage',
    preventionAdvice: 'Increase row spacing. Use mulch to prevent soil splash. Avoid overhead irrigation during humid periods.',
    followUpDays: 5,
    requiresExpert: false,
  };
}

function getDemoAssistantResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('tomato') || lower.includes('disease') || lower.includes('leaf')) {
    return 'Based on Asha\'s Farm Twin, I can see the North Field tomatoes are at flowering stage with some stress indicators. The humidity levels and upcoming rainfall suggest fungal risk is the main concern right now. I\'d recommend reviewing the active Resolution Card for immediate action.';
  }
  if (lower.includes('water') || lower.includes('irrigation')) {
    return 'The soil moisture in North Field is currently at 78% field capacity — above the 65% optimal for flowering tomatoes. With 34mm of rain forecast, I recommend pausing irrigation for at least 48 hours.';
  }
  if (lower.includes('market') || lower.includes('price') || lower.includes('sell')) {
    return 'Simulated APMC data shows tomato prices rising 12% in Nashik. Based on crop maturity estimates, the 3–5 day harvest window through the cooperative channel offers the best estimated net realisation. Please review the Market Intelligence module for scenario comparison.';
  }
  return 'I\'m Aether, your agricultural intelligence assistant. I can see Asha\'s farm in Maharashtra is growing tomatoes at the flowering stage. How can I help you today? You can ask me about crop health, weather risks, irrigation, or market opportunities.';
}
