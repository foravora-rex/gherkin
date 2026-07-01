'use client';

import { useEffect, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { Pattern } from '@/app/api/patterns/route';

type Status = 'loading' | 'result' | 'error' | 'rate-limited';

type Props = {
  reflectionCount: number;
};

export default function PatternSurface({ reflectionCount }: Props) {
  const posthog = usePostHog();
  const [status, setStatus] = useState<Status>('loading');
  const [patterns, setPatterns] = useState<Pattern[]>([]);

  async function fetchPatterns(force = false) {
    setStatus('loading');
    try {
      const url = force ? '/api/patterns?force=true' : '/api/patterns';
      const res = await fetch(url, { method: 'POST' });
      if (res.status === 429) { setStatus('rate-limited'); return; }
      if (!res.ok) { setStatus('error'); return; }
      const data = await res.json();
      setPatterns(data.patterns);
      setStatus('result');
      if (!data.cached) posthog?.capture('patterns_surfaced', { reflectionCount });
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => { fetchPatterns(); }, []);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-sm text-[#466353] animate-pulse">Reading your reflections…</p>
      </div>
    );
  }

  if (status === 'rate-limited') {
    return (
      <div className="py-32 text-center">
        <p className="text-sm text-[#466353]">You&apos;ve surfaced patterns 5 times today. Come back tomorrow.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="py-32 text-center">
        <p className="text-sm text-[#466353] mb-4">Something went wrong.</p>
        <button
          onClick={() => { fetchPatterns(); }}
          className="text-xs text-[#466353] underline hover:text-stone-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-6">
        {patterns.map((pattern, i) => (
          <div
            key={i}
            className="bg-white border border-stone-200 rounded-2xl p-8"
          >
            <p className="text-xs uppercase tracking-widest text-[#466353] mb-3">
              Pattern {i + 1}
            </p>
            <h2 className="text-xl font-light text-stone-900 mb-4">{pattern.theme}</h2>
            <p className="text-sm text-stone-600 font-light leading-relaxed">
              {pattern.observation}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={() => { fetchPatterns(true); }}
          className="text-xs text-[#466353] hover:text-stone-700 transition-colors"
        >
          See it differently →
        </button>
      </div>
    </div>
  );
}
