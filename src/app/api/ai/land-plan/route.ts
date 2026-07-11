import { NextRequest, NextResponse } from 'next/server';
import { analyzeLandForCropPlan } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const context = String(formData.get('context') || '');
    const landPhoto = formData.get('landPhoto') as File | null;
    if (!context) return NextResponse.json({ error: 'Farm evidence is required' }, { status: 400 });
    if (landPhoto && landPhoto.size > 6 * 1024 * 1024) {
      return NextResponse.json({ error: 'Land photo must be below 6 MB' }, { status: 413 });
    }
    let imageBase64: string | undefined;
    let mimeType: string | undefined;
    if (landPhoto) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(landPhoto.type)) {
        return NextResponse.json({ error: 'Land photo must be JPEG, PNG, or WebP' }, { status: 415 });
      }
      imageBase64 = Buffer.from(await landPhoto.arrayBuffer()).toString('base64');
      mimeType = landPhoto.type;
    }
    const plan = await analyzeLandForCropPlan(context, imageBase64, mimeType);
    return NextResponse.json({ ...plan, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Land plan route failed:', error);
    return NextResponse.json({ error: 'Unable to build AI land plan' }, { status: 500 });
  }
}
