import { NextRequest, NextResponse } from 'next/server';
import { getAllEntries, createEntry } from '@/lib/sheets';
import { DiaryEntry } from '@/lib/types';

export async function GET() {
  try {
    const entries = await getAllEntries();
    // Sort by date descending (newest first)
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(entries);
  } catch (error) {
    console.error('GET /api/entries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    await createEntry(entry);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('POST /api/entries error:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}