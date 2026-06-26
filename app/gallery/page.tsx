import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AuthHeader from '@/components/AuthHeader';
import GalleryCard from './_components/GalleryCard';

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
    SELECT r.id, r.prompt_text, r.rendered_text, r.tone, r.created_at, p.tags
    FROM reflections r
    JOIN prompts p ON p.id = r.prompt_id
    WHERE r.clerk_id = ${userId}
    ORDER BY r.created_at DESC
  `;

  return (
    <div className="flex-1 flex flex-col">
      <AuthHeader />

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
              <GalleryCard
                key={r.id as string}
                id={r.id as string}
                promptText={r.prompt_text as string}
                renderedText={r.rendered_text as string}
                tone={r.tone as string}
                createdAt={formatDate(r.created_at as Date)}
                tags={r.tags as string[]}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
