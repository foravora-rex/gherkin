import Link from 'next/link';
import { formatTag } from '@/lib/tags';

export default function ExistingPreferences({ tags }: { tags: string[] }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="max-w-lg w-full">
        <p className="text-xs uppercase tracking-widest text-[#466353] mb-8">
          Your interests
        </p>
        <h2 className="text-3xl font-light text-stone-900 mb-3">
          Here&apos;s what you told us.
        </h2>
        <p className="text-sm text-[#466353] mb-10">
          We use these to shape your draws.
        </p>

        <div className="flex flex-wrap gap-2 mb-12">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-1.5 rounded-full border border-[#85A16A] text-[#85A16A] text-sm"
            >
              {formatTag(tag)}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-start gap-4">
          <Link
            href="/explore"
            className="bg-[#85A16A] text-white px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            Take me to my draw
          </Link>
          <Link
            href="/quiz/preferences"
            className="text-sm text-[#466353] hover:text-stone-700 transition-colors"
          >
            Refine preferences
          </Link>
        </div>
      </div>
    </div>
  );
}
