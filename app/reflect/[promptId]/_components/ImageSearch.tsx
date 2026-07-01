'use client';

import { useEffect, useRef, useState } from 'react';
import type { ImageResult } from '@/lib/imageSearch';

type Props = {
  selected: ImageResult | null;
  onSelect: (image: ImageResult | null) => void;
};

export default function ImageSearch({ selected, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/images/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  function handleSelect(image: ImageResult) {
    onSelect(image);
    setQuery('');
    setResults([]);
    setHasSearched(false);
  }

  if (selected) {
    return (
      <div className="flex items-start gap-3">
        <img
          src={selected.url}
          alt={selected.label}
          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-stone-700 truncate">{selected.label}</p>
          {selected.creditName && (
            <p className="text-[10px] text-stone-400 mt-0.5">
              Photo by{' '}
              <a href={selected.creditUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {selected.creditName}
              </a>{' '}
              on Unsplash
            </p>
          )}
          <button
            onClick={() => onSelect(null)}
            className="mt-1.5 text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for an actor, artist, character, or mood…"
        className="w-full text-sm bg-transparent border-b border-stone-200 focus:border-stone-400 outline-none py-1.5 text-stone-900 placeholder:text-stone-400 transition-colors"
      />
      {isSearching && (
        <p className="mt-3 text-xs text-stone-400 animate-pulse">Searching…</p>
      )}
      {!isSearching && hasSearched && results.length === 0 && (
        <p className="mt-3 text-xs text-stone-400">No results found.</p>
      )}
      {results.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2 max-h-52 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              title={r.label}
              className="aspect-square overflow-hidden rounded-lg border border-stone-200 hover:border-[#85A16A] transition-colors"
            >
              <img src={r.url} alt={r.label} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
