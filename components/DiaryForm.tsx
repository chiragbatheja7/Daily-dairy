'use client';

import { useState } from 'react';
import { DiaryEntry, QuestionAnswer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { QuestionBlock } from '@/components/QuestionBlock';
import { toast } from 'sonner';

const REFLECTION_QUESTIONS = [
  'Did I accomplish what I set out to do today?',
  'Was I present and mindful today?',
  'Did I treat others with kindness?',
  'Did I take care of my physical health?',
];

interface DiaryFormProps {
  initialEntry?: DiaryEntry | null;
  onSubmit: (entry: DiaryEntry) => Promise<void>;
  isLoading?: boolean;
}

export function DiaryForm({ initialEntry, onSubmit, isLoading = false }: DiaryFormProps) {
  const [body, setBody] = useState(initialEntry?.body || '');
  const [questions, setQuestions] = useState<QuestionAnswer[]>(
    initialEntry?.questions || [
      { answer: null, elaboration: '' },
      { answer: null, elaboration: '' },
      { answer: null, elaboration: '' },
      { answer: null, elaboration: '' },
    ]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionAnswer = (index: number, answer: 'Yes' | 'No' | null) => {
    const newQuestions = [...questions];
    newQuestions[index].answer = answer;
    // Clear elaboration if answer is deselected
    if (answer === null) {
      newQuestions[index].elaboration = '';
    }
    setQuestions(newQuestions);
  };

  const handleQuestionElaboration = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].elaboration = text;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) {
      toast.error('Please write something for your entry');
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });

      const entry: DiaryEntry = {
        date: dateStr,
        dayOfWeek,
        body,
        questions,
        savedAt: new Date().toISOString(),
      };

      await onSubmit(entry);
      
      // Only reset on create, not on update
      if (!initialEntry) {
        setBody('');
        setQuestions([
          { answer: null, elaboration: '' },
          { answer: null, elaboration: '' },
          { answer: null, elaboration: '' },
          { answer: null, elaboration: '' },
        ]);
      }
      
      toast.success(initialEntry ? 'Entry updated successfully' : 'Entry saved successfully');
    } catch (error) {
      console.error('Failed to submit entry:', error);
      toast.error('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="body" className="text-sm font-medium text-foreground">
          How was your day?
        </label>
        <Textarea
          id="body"
          placeholder="Write about your day, thoughts, and feelings..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-32"
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground">Reflections</h3>
        {REFLECTION_QUESTIONS.map((question, idx) => (
          <QuestionBlock
            key={idx}
            question={question}
            answer={questions[idx].answer}
            elaboration={questions[idx].elaboration}
            onAnswerChange={(answer) => handleQuestionAnswer(idx, answer)}
            onElaborationChange={(text) => handleQuestionElaboration(idx, text)}
          />
        ))}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full"
      >
        {isSubmitting ? 'Saving...' : initialEntry ? 'Update Entry' : 'Save Entry'}
      </Button>
    </form>
  );
}
