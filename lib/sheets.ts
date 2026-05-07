import { google } from 'googleapis';
import { DiaryEntry, QuestionAnswer } from './types';

let sheetsClient: ReturnType<typeof google.sheets> | null = null;

export async function initializeSheets() {
  if (sheetsClient) {
    return sheetsClient;
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable');
  }

  if (!process.env.GOOGLE_SHEET_ID) {
    throw new Error('Missing GOOGLE_SHEET_ID environment variable');
  }

  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({
      version: 'v4',
      auth,
    });

    return sheetsClient;
  } catch (error) {
    console.error('Failed to initialize Sheets client:', error);
    throw error;
  }
}

export async function getAllEntries(): Promise<DiaryEntry[]> {
  const sheets = await initializeSheets();
  const sheetId = process.env.GOOGLE_SHEET_ID!;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A2:L1000', // Start from row 2 (after header)
    });

    const rows = response.data.values || [];
    return rows.map(formatRowToEntry).filter((entry) => entry !== null) as DiaryEntry[];
  } catch (error) {
    console.error('Failed to get all entries:', error);
    throw error;
  }
}

export async function getTodayEntry(): Promise<DiaryEntry | null> {
  const sheets = await initializeSheets();
  const sheetId = process.env.GOOGLE_SHEET_ID!;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A2:L1000',
    });

    const rows = response.data.values || [];
    for (const row of rows) {
      const entry = formatRowToEntry(row);
      if (entry && entry.date === today) {
        return entry;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get today entry:', error);
    throw error;
  }
}

export async function createEntry(entry: DiaryEntry): Promise<void> {
  const sheets = await initializeSheets();
  const sheetId = process.env.GOOGLE_SHEET_ID!;

  try {
    const row = formatEntryToRow(entry);
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } catch (error) {
    console.error('Failed to create entry:', error);
    throw error;
  }
}

export async function updateEntry(entry: DiaryEntry): Promise<void> {
  const sheets = await initializeSheets();
  const sheetId = process.env.GOOGLE_SHEET_ID!;

  try {
    // Find the row index for today's date
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A2:L1000',
    });

    const rows = response.data.values || [];
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === entry.date) {
        rowIndex = i + 2; // +2 because we start from row 2
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Entry for date ${entry.date} not found`);
    }

    const row = formatEntryToRow(entry);
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `A${rowIndex}:L${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } catch (error) {
    console.error('Failed to update entry:', error);
    throw error;
  }
}

export function formatRowToEntry(row: string[]): DiaryEntry | null {
  if (!row || row.length < 12) {
    return null;
  }

  try {
    const questions: QuestionAnswer[] = [];
    // Q1: columns D-E
    questions.push({
      answer: (row[3] as 'Yes' | 'No' | null) || null,
      elaboration: row[4] || '',
    });
    // Q2: columns F-G
    questions.push({
      answer: (row[5] as 'Yes' | 'No' | null) || null,
      elaboration: row[6] || '',
    });
    // Q3: columns H-I
    questions.push({
      answer: (row[7] as 'Yes' | 'No' | null) || null,
      elaboration: row[8] || '',
    });
    // Q4: columns J-K
    questions.push({
      answer: (row[9] as 'Yes' | 'No' | null) || null,
      elaboration: row[10] || '',
    });

    return {
      date: row[0] || '',
      dayOfWeek: row[1] || '',
      body: row[2] || '',
      questions,
      savedAt: row[11] || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to format row to entry:', error);
    return null;
  }
}

export function formatEntryToRow(entry: DiaryEntry): (string | null)[] {
  return [
    entry.date,
    entry.dayOfWeek,
    entry.body,
    entry.questions[0]?.answer || '',
    entry.questions[0]?.elaboration || '',
    entry.questions[1]?.answer || '',
    entry.questions[1]?.elaboration || '',
    entry.questions[2]?.answer || '',
    entry.questions[2]?.elaboration || '',
    entry.questions[3]?.answer || '',
    entry.questions[3]?.elaboration || '',
    entry.savedAt,
  ];
}
