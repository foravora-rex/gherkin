'use client';

import { useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';

export default function RefreshButton() {
  const router = useRouter();
  const posthog = usePostHog();
  return (
    <button
      onClick={() => {
        posthog?.capture('draw_again');
        router.refresh();
      }}
      className="text-xs text-[#466353] hover:text-stone-700 transition-colors"
    >
      Draw again
    </button>
  );
}
