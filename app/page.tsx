'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiaryEntry } from '@/lib/types';
import { DiaryForm } from '@/components/DiaryForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TodayPage() {
  const router = useRouter();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayEntry = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/entries/today');
        if (!response.ok) {
          throw new Error('Failed to fetch today entry');
        }
        const data = await response.json();
        setEntry(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching today entry:', err);
        setError(err instanceof Error ? err.message : 'Failed to load entry');
        setEntry(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayEntry();
  }, []);

  const handleSubmit = async (formEntry: DiaryEntry) => {
    try {
      const method = entry ? 'PUT' : 'POST';
      const endpoint = entry ? '/api/entries/today' : '/api/entries';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formEntry),
      });

      if (!response.ok) {
        throw new Error('Failed to save entry');
      }

      const savedEntry = await response.json();
      setEntry(savedEntry);
    } catch (err) {
      console.error('Error saving entry:', err);
      throw err;
    }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Day</h1>
            <p className="mt-1 text-sm text-muted-foreground">{dateStr}</p>
          </div>
          <Link href="/timeline">
            <Button variant="outline" size="sm">
              View Timeline
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
            <div className="text-sm text-muted-foreground">Loading your entry...</div>
          </div>
        )}

        {/* Form */}
        {!isLoading && (
          <div className="rounded-lg bg-card p-6">
            <DiaryForm
              initialEntry={entry}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
