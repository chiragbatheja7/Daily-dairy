'use client';

import { useState } from 'react';
import { DiaryEntry } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

interface EntryCardProps {
  entry: DiaryEntry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const bodyPreview = entry.body.split('\n').slice(0, 3).join('\n');
  const hasMore = entry.body.split('\n').length > 3 || entry.body.length > 150;
  const hasReflections = entry.questions.some((q) => q.answer !== null);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="font-semibold text-foreground">{formatDate(entry.date)}</h3>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>

        <p className="mb-2 whitespace-pre-wrap text-sm text-foreground/80">
          {bodyPreview}
          {hasMore ? '...' : ''}
        </p>

        {hasReflections && (
          <p className="text-xs text-muted-foreground">
            {isExpanded ? '' : 'Tap to view reflections'}
          </p>
        )}

        {isExpanded && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <div className="whitespace-pre-wrap text-sm text-foreground">
              {entry.body}
            </div>

            {hasReflections && (
              <div className="space-y-3 pt-2">
                <h4 className="font-medium text-sm text-foreground">Reflections</h4>
                {entry.questions.map((q, idx) => (
                  q.answer && (
                    <div key={idx} className="border-l-2 border-border pl-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Question {idx + 1}
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {q.answer}
                        {q.elaboration && ` — ${q.elaboration}`}
                      </p>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
