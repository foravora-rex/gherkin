'use client';

import Link from 'next/link';
import { usePostHog } from 'posthog-js/react';

type Props = {
  id: string;
  text: string;
  type: string;
  category: string;
  cardLabel: string;
  categoryLabel: string;
};

export default function ExploreCard({ id, text, type, category, cardLabel, categoryLabel }: Props) {
  const posthog = usePostHog();

  return (
    <Link
      href={`/reflect/${id}`}
      onClick={() => posthog?.capture('card_clicked', { type, category })}
      className="group flex flex-col justify-between bg-white border border-stone-200 rounded-2xl p-6 min-h-52 hover:border-[#85A16A] hover:shadow-sm transition-all duration-200"
    >
      <p className="text-stone-800 text-base font-light leading-relaxed">
        {text}
      </p>
      <div className="flex items-center justify-between mt-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#466353] uppercase tracking-widest">
            {cardLabel}
          </span>
          <span className="text-xs text-[#466353]">
            {categoryLabel}
          </span>
        </div>
        <span className="text-[#466353] group-hover:text-[#85A16A] transition-colors text-lg">
          →
        </span>
      </div>
    </Link>
  );
}
