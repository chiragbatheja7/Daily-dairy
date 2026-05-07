export interface QuestionAnswer {
  answer: 'Yes' | 'No' | null;
  elaboration: string;
}

export interface DiaryEntry {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  body: string;
  questions: QuestionAnswer[]; // Array of 4 question answers
  savedAt: string; // ISO 8601 timestamp
}

export interface DiaryEntryFormData {
  body: string;
  questions: QuestionAnswer[];
}
