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

export async function analyzeCropImage(imageBase64: string, mimeType: string, farmContext: string): Promise<string> {
  if (!genAI) {
    return JSON.stringify(getDemoDiagnosisResponse());
  }
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    safetySettings: GEMINI_SAFETY_SETTINGS,
  });
  const prompt = `You are KisanMitra (किसानमित्र), an expert farmer-first agronomist assistant. 
Farm context: ${farmContext}

Analyze the uploaded crop image and return a structured JSON response with these exact fields:
{
  "mostLikelyIssue": "Name of disease/deficiency in Hindi + English (e.g., अगेती झुलसा / Early Blight)",
  "alternativePossibilities": ["string in Hindi + English"],
  "confidence": number (0-100),
  "visibleIndicators": ["simple visible symptoms in Hindi + English"],
  "severity": "low|medium|high|critical",
  "urgency": "routine|soon|urgent|immediate",
  "questionsForAccuracy": ["clarifying questions in Hindi + English"],
  "immediateAction": "What the farmer should do right now (max 3 simple steps, clear, one line each, in Hindi + English)",
  "organicOptions": ["organic treatment/fertilizer with local Indian names and approx cost in ₹ (e.g., नीम का तेल / Neem Oil - ₹150)"],
  "chemicalCategory": "chemical option with local Indian brand/product names and approx cost in ₹ (e.g., मैंकोज़ेब / Mancozeb 75 WP - ₹250)",
  "preventionAdvice": "Simple preventive advice in Hindi + English",
  "followUpDays": number,
  "requiresExpert": boolean
}

IMPORTANT: Do not provide dangerous pesticide dosages. Refer users to local agriculture officers for exact volume. Keep descriptions simple, avoiding technical jargon, so it is understandable for smallholder farmers.`;
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

export async function getKisanMitraRecommendation(prompt: string, farmContext: string): Promise<string> {
  if (!genAI) return getDemoAssistantResponse(prompt);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro', safetySettings: GEMINI_SAFETY_SETTINGS });
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

function getDemoDiagnosisResponse() {
  return {
    mostLikelyIssue: 'अगेती झुलसा / Early Blight (Alternaria solani)',
    alternativePossibilities: [
      'पर्णदाग रोग / Septoria Leaf Spot (सेप्टोरिया लीफ स्पॉट)',
      'जीवाणु चित्ती रोग / Bacterial Speck (बैक्टीरियल स्पेक)'
    ],
    confidence: 78,
    visibleIndicators: [
      'निचले पत्तों पर गोल गहरे भूरे छल्ले / Circular dark brown rings on lower leaves',
      'धब्बों के चारों ओर पीलापन / Yellow halo surrounding lesions'
    ],
    severity: 'medium',
    urgency: 'soon',
    questionsForAccuracy: [
      'क्या यह केवल नीचे के पत्तों पर है? / Is this only on lower leaves?',
      'क्या ऊपरी नए पत्ते भी पीले हो रहे हैं? / Are the upper new leaves yellowing?'
    ],
    immediateAction: '1. संक्रमित पत्तों को तुरंत तोड़कर नष्ट करें। / Remove and destroy affected leaves.\n2. हवा का संचार बढ़ाने के लिए बीच की खरपतवार साफ करें। / Clear weeds to increase airflow.\n3. फफूंदनाशक का छिड़काव करें। / Apply fungicide spray.',
    organicOptions: [
      'नीम का तेल और खाने का सोडा / Neem oil + baking soda solution (₹150 - ₹200)',
      'ट्राइकोडर्मा जैविक नियंत्रण / Trichoderma biocontrol agent (₹120)'
    ],
    chemicalCategory: 'ताम्र फफूंदनाशक जैसे कॉपर ऑक्सीक्लोराइड / Copper Oxychloride 50 WP (₹250 - ₹300)',
    preventionAdvice: 'फसल चक्र अपनाएं और सिंचाई करते समय पत्तों पर पानी न डालें। / Rotate crops and avoid overhead irrigation to keep foliage dry.',
    followUpDays: 5,
    requiresExpert: false,
  };
}

function getDemoAssistantResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('tomato') || lower.includes('disease') || lower.includes('leaf') || lower.includes('टमाटर') || lower.includes('बीमारी')) {
    return 'टमाटर के पौधों में आर्द्रता अधिक होने से फफूंद रोग (Early Blight) का खतरा बढ़ गया है। नीम का तेल या फफूंदनाशक का छिड़काव करें।\n\nFungal risk (Early Blight) is high due to humidity in your tomato field. Apply neem oil or copper-based fungicide spray soon.';
  }
  if (lower.includes('water') || lower.includes('irrigation') || lower.includes('पानी') || lower.includes('सिंचाई')) {
    return 'खेत में नमी ७८% है, जो पर्याप्त है। आगामी १८ घंटों में बारिश का अनुमान है, इसलिए अभी सिंचाई रोक दें।\n\nSoil moisture is 78%, which is sufficient. Rain is expected in the next 18 hours, so pause irrigation for now.';
  }
  if (lower.includes('market') || lower.includes('price') || lower.includes('sell') || lower.includes('मंडी') || lower.includes('भाव')) {
    return 'नाशिक मंडी में टमाटर के भाव १२% बढ़ गए हैं। अभी बेचना लाभदायक रहेगा।\n\nNashik APMC prices are up 12% for tomatoes. It is a good time to sell.';
  }
  return 'नमस्कार! मैं किसानमित्र (KisanMitra) हूँ। मैं आपकी फसल की बीमारी, मौसम और मंडी भाव की जानकारी दे सकता हूँ। आप क्या पूछना चाहते हैं?\n\nHello! I am KisanMitra. I can help with crop disease diagnosis, weather alerts, and mandi prices. How can I help you today?';
}
