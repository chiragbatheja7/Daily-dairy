'use client';

import { useEffect, useState } from 'react';
import { DiaryEntry } from '@/lib/types';
import { EntryCard } from '@/components/EntryCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TimelinePage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/entries');
        if (!response.ok) {
          throw new Error('Failed to fetch entries');
        }
        const data = await response.json();
        setEntries(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching entries:', err);
        setError(err instanceof Error ? err.message : 'Failed to load entries');
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Timeline</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Today
            </Button>
          </Link>
        </div>

        {/* Error State */}
        {error && !isLoading && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading entries...</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && entries.length === 0 && (
          <div className="rounded-lg bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No entries yet. Start by writing today&apos;s entry.
            </p>
            <Link href="/" className="mt-4 inline-block">
              <Button size="sm">Write Your First Entry</Button>
            </Link>
          </div>
        )}

        {/* Entries Grid */}
        {!isLoading && entries.length > 0 && (
          <div className="grid gap-4">
            {entries.map((entry) => (
              <EntryCard key={entry.date} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
