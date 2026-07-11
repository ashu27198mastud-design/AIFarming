import { NextRequest, NextResponse } from 'next/server';
import { analyzeCropImage } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const farmContext = formData.get('farmContext') as string || '';

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const maxSizeBytes = 4 * 1024 * 1024; // 4MB
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

    const parsed = JSON.parse(result);
    return NextResponse.json({
      ...parsed,
      dataSource: process.env.GEMINI_API_KEY ? 'live' : 'simulated',
      timestamp: new Date().toISOString(),
      disclaimer: 'AI analysis is indicative only. Consult a certified agronomist before applying treatments.',
    });
  } catch (error) {
    console.error('Diagnose API error:', error);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
