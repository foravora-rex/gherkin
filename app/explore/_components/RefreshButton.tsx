'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';

export default function RefreshButton() {
  const router = useRouter();
  const posthog = usePostHog();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    posthog?.capture('draw_again');
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#466353] text-[#466353] text-sm hover:bg-[#466353] hover:text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <>
          <svg className="animate-spin h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Drawing…
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4v5h5M20 20v-5h-5" />
            <path d="M4.06 9a8 8 0 0 1 14.93-1M19.94 15A8 8 0 0 1 5 16" />
          </svg>
          Draw again
        </>
      )}
    </button>
  );
}
