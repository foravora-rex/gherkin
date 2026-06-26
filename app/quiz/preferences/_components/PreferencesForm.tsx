'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GENRE_TAXONOMY, BROAD_TAGS } from '@/lib/tags';

const BROAD_LABEL: Record<string, string> = {
  music: 'Music',
  'screen-stage': 'Films & Series',
  'stories-words': 'Books & Writing',
  gaming: 'Gaming',
  theatre: 'Theatre & Live Events',
  podcasts: 'Podcasts',
  art: 'Art & Photography',
  sport: 'Sport & Movement',
};

type Props = {
  currentTags: string[];
};

export default function PreferencesForm({ currentTags }: Props) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>(currentTags);
  const [isSaving, setIsSaving] = useState(false);

  const broadTags = tags.filter((t) => BROAD_TAGS.includes(t));
  const genreTags = tags.filter((t) => !BROAD_TAGS.includes(t));

  function toggleBroad(value: string) {
    setTags((prev) => {
      if (prev.includes(value)) {
        // Remove the broad tag and any genres that belong to it
        const categoryGenres = GENRE_TAXONOMY[value]?.genres.map((g) => g.id) ?? [];
        return prev.filter((t) => t !== value && !categoryGenres.includes(t));
      }
      return [...prev, value];
    });
  }

  function toggleGenre(value: string) {
    setTags((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  async function handleSave() {
    setIsSaving(true);
    await fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags }),
    });
    router.push('/quiz');
  }

  const categoriesWithGenres = Object.entries(GENRE_TAXONOMY).filter(([broadTag]) =>
    broadTags.includes(broadTag)
  );

  return (
    <div className="max-w-lg w-full">
      <p className="text-xs uppercase tracking-widest text-[#466353] mb-8">Preferences</p>
      <h1 className="text-3xl font-light text-stone-900 mb-10">Refine your interests.</h1>

      {/* Broad interests */}
      <p className="text-sm text-stone-500 mb-4">What are you into?</p>
      <div className="grid grid-cols-2 gap-3 mb-10">
        {BROAD_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleBroad(tag)}
            className={`text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
              tags.includes(tag)
                ? 'border-[#466353] bg-[#466353]/8 text-stone-900'
                : 'border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            {BROAD_LABEL[tag]}
          </button>
        ))}
      </div>

      {/* Genre drilldown */}
      {categoriesWithGenres.length > 0 && (
        <div className="space-y-8 mb-10">
          {categoriesWithGenres.map(([broadTag, category]) => (
            <div key={broadTag}>
              <p className="text-sm text-stone-500 mb-4">{category.label} — which genres?</p>
              <div className="flex flex-wrap gap-2">
                {category.genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all duration-150 ${
                      tags.includes(genre.id)
                        ? 'border-[#466353] bg-[#466353]/8 text-stone-900'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-6">
        <button
          onClick={handleSave}
          disabled={isSaving || broadTags.length === 0}
          className={`px-8 py-3 rounded-full text-sm transition-opacity ${
            broadTags.length > 0
              ? 'bg-[#85A16A] text-white hover:opacity-90'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? 'Saving…' : 'Save preferences'}
        </button>
        <button
          onClick={() => router.push('/quiz?recalibrate=true')}
          className="text-sm text-[#466353] hover:text-stone-900 transition-colors"
        >
          Restart from scratch
        </button>
      </div>
    </div>
  );
}
