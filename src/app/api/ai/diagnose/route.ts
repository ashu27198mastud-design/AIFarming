import { NextRequest, NextResponse } from 'next/server';
import { analyzeCropImage } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const farmContext = (formData.get('farmContext') as string) || '';

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const maxSizeBytes = 4 * 1024 * 1024;
    if (imageFile.size > maxSizeBytes) {
      return NextResponse.json({ error: 'Image too large. Please compress below 4MB.' }, { status: 413 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json({ error: 'Invalid image format. Use JPEG, PNG, or WebP.' }, { status: 415 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const result = await analyzeCropImage(base64, imageFile.type, farmContext);
    const raw = JSON.parse(result);

    const normalized = {
      mostLikelyIssue:
        raw.mostLikelyIssue ||
        raw.likelyIssue ||
        raw.diseaseName ||
        raw.diagnosis ||
        'निर्धारित नहीं किया जा सका / Unable to determine crop condition',
      alternativePossibilities:
        raw.alternativePossibilities || raw.alternativeIssues || [],
      confidence: Number.isFinite(raw.confidence)
        ? Math.max(0, Math.min(100, raw.confidence))
        : 0,
      visibleIndicators: raw.visibleIndicators || raw.visibleSignals || [],
      severity: raw.severity || 'unknown',
      urgency: raw.urgency || 'review',
      questionsForAccuracy: raw.questionsForAccuracy || raw.questions || [],
      immediateAction:
        raw.immediateAction ||
        'कृपया स्पष्ट फोटो के साथ पुनः प्रयास करें। / Please retry with a clearer image.',
      organicOptions: raw.organicOptions || [],
      chemicalCategory:
        raw.chemicalCategory || raw.chemicalOptions?.[0] || '',
      fertilizerAdvice:
        raw.fertilizerAdvice || raw.nutrientAdvice || 'Use soil-test based nutrition only; avoid extra nitrogen during disease pressure.',
      preventionAdvice: raw.preventionAdvice || '',
      followUpDays:
        raw.followUpDays ??
        (Number.isFinite(raw.followUpHours) ? Math.ceil(raw.followUpHours / 24) : 0),
      requiresExpert:
        raw.requiresExpert ?? raw.expertEscalationRequired ?? false,
      imageQuality: raw.imageQuality || 'poor',
      imageCategory: raw.imageCategory || 'unclear',
      isFallback: Boolean(raw.isFallback),
      dataSource: raw.isFallback
        ? 'unavailable'
        : process.env.GEMINI_API_KEY
          ? 'live'
          : 'unavailable',
      timestamp: new Date().toISOString(),
      disclaimer:
        'AI analysis is indicative only. Consult a certified agronomist before applying treatments.',
    };

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Diagnose API error:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed. Please try again.',
        mostLikelyIssue: 'विश्लेषण विफल / Analysis failed',
        confidence: 0,
        severity: 'unknown',
        isFallback: true,
      },
      { status: 500 },
    );
  }
}
