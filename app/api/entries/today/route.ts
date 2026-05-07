import { NextRequest, NextResponse } from 'next/server';
import { getTodayEntry, updateEntry } from '@/lib/sheets';
import { DiaryEntry } from '@/lib/types';

export async function GET() {
  try {
    const entry = await getTodayEntry();
    if (!entry) {
      return NextResponse.json(null);
    }
    return NextResponse.json(entry);
  } catch (error) {
    console.error('GET /api/entries/today error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today entry' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const entry: DiaryEntry = {
      date: body.date,
      dayOfWeek: body.dayOfWeek,
      body: body.body,
      questions: body.questions,
      savedAt: new Date().toISOString(),
    };

    // Validate required fields
    if (!entry.body || !entry.date) {
      return NextResponse.json(
        { error: 'Missing required fields: body and date' },
        { status: 400 }
      );
    }

    await updateEntry(entry);
    return NextResponse.json(entry);
  } catch (error) {
    console.error('PUT /api/entries/today error:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}
