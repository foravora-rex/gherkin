import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';

const TONE_LABELS: Record<string, string> = {
  poetic: 'Poetic',
  letter: 'Letter to myself',
  'field-notes': 'Field notes',
  unfiltered: 'Unfiltered',
  'as-written': 'As written',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function GalleryPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const reflections = await sql`
    SELECT id, prompt_text, rendered_text, tone, created_at
    FROM reflections
    WHERE clerk_id = ${userId}
    ORDER BY created_at DESC
  `;

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex justify-between items-center px-8 py-6">
        <Link href="/" className="text-sm font-light text-stone-900 tracking-tight">
          Gherkin
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/explore"
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            Explore
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="flex-1 px-8 py-12 max-w-4xl mx-auto w-full">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#466353] mb-2">
              A gallery of self
            </p>
            <h1 className="text-3xl font-light text-stone-900">Your gallery.</h1>
          </div>
          {reflections.length > 0 && (
            <p className="text-xs text-[#466353]">
              {reflections.length} {reflections.length === 1 ? 'reflection' : 'reflections'}
            </p>
          )}
        </div>

        {reflections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-[#466353] text-sm mb-6">
              Your gallery is empty. Each reflection you save will live here.
            </p>
            <Link
              href="/explore"
              className="bg-[#85A16A] text-white px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity"
            >
              Explore today&apos;s prompt
            </Link>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-6">
            {reflections.map((r) => (
              <div
                key={r.id as string}
                className="break-inside-avoid mb-6 bg-white border border-stone-200 rounded-2xl p-6"
              >
                <p className="text-xs text-[#466353] mb-4">
                  {formatDate(r.created_at as Date)}
                </p>

                <p className="text-xs text-[#466353] italic mb-4 leading-relaxed">
                  {r.prompt_text as string}
                </p>

                <p className="text-sm text-stone-700 font-light leading-relaxed whitespace-pre-wrap">
                  {r.rendered_text as string}
                </p>

                <div className="mt-6 pt-4 border-t border-stone-100">
                  <span className="text-xs text-[#466353] uppercase tracking-widest">
                    {TONE_LABELS[r.tone as string] ?? r.tone as string}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
