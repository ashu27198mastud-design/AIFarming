import { NextRequest, NextResponse } from 'next/server';
import { analyzeSoilReport } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const report = formData.get('report') as File | null;
    if (!report) return NextResponse.json({ error: 'No soil report provided' }, { status: 400 });
    if (report.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Report must be below 8 MB' }, { status: 413 });

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(report.type)) {
      return NextResponse.json({ error: 'Upload a PDF, JPEG, PNG, or WebP soil report' }, { status: 415 });
    }

    const base64 = Buffer.from(await report.arrayBuffer()).toString('base64');
    const result = await analyzeSoilReport(base64, report.type);
    return NextResponse.json({ ...result, fileName: report.name, analyzedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Soil report route failed:', error);
    return NextResponse.json({ error: 'Soil report analysis failed' }, { status: 500 });
  }
}
