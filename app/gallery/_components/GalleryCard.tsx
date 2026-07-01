'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatTag } from '@/lib/tags';
import ImageSearch from '@/app/reflect/[promptId]/_components/ImageSearch';
import type { ImageResult } from '@/lib/imageSearch';

const TONE_LABELS: Record<string, string> = {
  poetic: 'Poetic',
  letter: 'Note to self',
  'field-notes': 'Field notes',
  unfiltered: 'Unfiltered',
  'as-written': 'As written',
};

type Props = {
  id: string;
  promptText: string;
  renderedText: string;
  tone: string;
  createdAt: string;
  tags: string[];
  image?: ImageResult | null;
};

type Mode = 'view' | 'edit' | 'confirm-delete';

export default function GalleryCard({ id, promptText, renderedText, tone, createdAt, tags, image }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('view');
  const [editText, setEditText] = useState(renderedText);
  const [displayText, setDisplayText] = useState(renderedText);
  const [displayImage, setDisplayImage] = useState<ImageResult | null>(image ?? null);
  const [editImage, setEditImage] = useState<ImageResult | null>(image ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    await fetch(`/api/reflect/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ renderedText: editText, image: editImage }),
    });
    setDisplayText(editText);
    setDisplayImage(editImage);
    setIsSaving(false);
    setMode('view');
  }

  function handleCancelEdit() {
    setEditText(displayText);
    setEditImage(displayImage);
    setMode('view');
  }

  async function handleDelete() {
    setIsDeleting(true);
    await fetch(`/api/reflect/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="break-inside-avoid mb-6 bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {displayImage?.url && (
        <div className="relative">
          <img src={displayImage.url} alt={displayImage.label ?? ''} className="w-full h-48 object-cover" />
          {displayImage.creditName && (
            <p className="absolute bottom-1.5 right-2 text-[9px] text-white/70">
              <a href={displayImage.creditUrl} target="_blank" rel="noopener noreferrer">
                © {displayImage.creditName} / Unsplash
              </a>
            </p>
          )}
        </div>
      )}
      <div className="p-6">
      <p className="text-xs text-[#466353] mb-4">{createdAt}</p>

      <p className="text-xs text-[#466353] italic mb-4 leading-relaxed">{promptText}</p>

      {mode === 'edit' ? (
        <>
          <textarea
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full text-sm text-stone-700 bg-transparent border-b border-stone-200 focus:outline-none focus:border-[#85A16A] resize-none leading-relaxed transition-colors pb-2 mb-6"
            rows={Math.max(4, displayText.split('\n').length + 2)}
          />
          <div className="mt-6 pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">
              Image <span className="normal-case">(optional)</span>
            </p>
            <ImageSearch selected={editImage} onSelect={setEditImage} />
          </div>
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving || !editText.trim()}
              className="bg-[#85A16A] text-white px-6 py-2 rounded-full text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-xs text-[#466353] hover:text-stone-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-stone-700 font-light leading-relaxed whitespace-pre-wrap">
          {displayText}
        </p>
      )}

      <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-4 flex-wrap">
        <span className="text-xs text-[#466353] uppercase tracking-widest">
          {TONE_LABELS[tone] ?? tone}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full border border-[#466353]/30 text-[#466353]"
            >
              {formatTag(tag)}
            </span>
          ))}
        </div>
      </div>

      {mode === 'view' && (
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={() => setMode('edit')}
            className="text-xs text-[#466353] hover:text-stone-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setMode('confirm-delete')}
            className="text-xs text-[#466353] hover:text-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      {mode === 'confirm-delete' && (
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <span className="text-xs text-stone-500">Delete this reflection forever?</span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting…' : 'Yes, delete'}
          </button>
          <button
            onClick={() => setMode('view')}
            className="text-xs text-[#466353] hover:text-stone-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
