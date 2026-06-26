'use client';

import { useRouter } from 'next/navigation';

export default function RefreshButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.refresh()}
      className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
    >
      Draw again
    </button>
  );
}
