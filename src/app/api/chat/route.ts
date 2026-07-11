import { NextRequest, NextResponse } from 'next/server';
import { getKisanMitraRecommendation } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { message, farmContext } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    const response = await getKisanMitraRecommendation(message, farmContext ?? '');
    return NextResponse.json({
      response,
      dataSource: process.env.GEMINI_API_KEY ? 'live' : 'simulated',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
