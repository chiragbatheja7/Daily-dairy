'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface QuestionBlockProps {
  question: string;
  answer: 'Yes' | 'No' | null;
  elaboration: string;
  onAnswerChange: (answer: 'Yes' | 'No' | null) => void;
  onElaborationChange: (text: string) => void;
}

export function QuestionBlock({
  question,
  answer,
  elaboration,
  onAnswerChange,
  onElaborationChange,
}: QuestionBlockProps) {
  const handleYesClick = () => {
    onAnswerChange(answer === 'Yes' ? null : 'Yes');
  };

  const handleNoClick = () => {
    onAnswerChange(answer === 'No' ? null : 'No');
  };

  return (
    <div className="space-y-3 border-b border-border pb-6 last:border-0">
      <p className="text-sm font-medium text-foreground">{question}</p>
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant={answer === 'Yes' ? 'default' : 'outline'}
          size="sm"
          className="rounded-full px-4"
          onClick={handleYesClick}
        >
          Yes
        </Button>
        <Button
          type="button"
          variant={answer === 'No' ? 'default' : 'outline'}
          size="sm"
          className="rounded-full px-4"
          onClick={handleNoClick}
        >
          No
        </Button>
      </div>

      {answer && (
        <Textarea
          placeholder="Add more details (optional)"
          value={elaboration}
          onChange={(e) => onElaborationChange(e.target.value)}
          className="min-h-20 text-sm"
        />
      )}
    </div>
  );
}
