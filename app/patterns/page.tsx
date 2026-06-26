import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AuthHeader from '@/components/AuthHeader';
import PatternSurface from './_components/PatternSurface';

const MIN_REFLECTIONS = 3;

export default async function PatternsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count FROM reflections WHERE clerk_id = ${userId}
  `;
  const reflectionCount = count as number;

  return (
    <div className="flex-1 flex flex-col">
      <AuthHeader />

      <main className="flex-1 px-8 py-12 max-w-2xl mx-auto w-full">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-[#466353] mb-2">
            What keeps coming up
          </p>
          <h1 className="text-3xl font-light text-stone-900">Your patterns.</h1>
        </div>

        {reflectionCount < MIN_REFLECTIONS ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-sm text-[#466353] mb-2">
              Patterns emerge with time.
            </p>
            <p className="text-sm text-[#466353] mb-8">
              Save {MIN_REFLECTIONS - reflectionCount} more{' '}
              {MIN_REFLECTIONS - reflectionCount === 1 ? 'reflection' : 'reflections'} to begin.
            </p>
            <Link
              href="/explore"
              className="bg-[#85A16A] text-white px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity"
            >
              Explore today&apos;s prompt
            </Link>
          </div>
        ) : (
          <PatternSurface reflectionCount={reflectionCount} />
        )}
      </main>
    </div>
  );
}
