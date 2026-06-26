import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { getDrawForUser } from '@/lib/draw';
import RefreshButton from './_components/RefreshButton';

const CARD_LABELS: Record<string, string> = {
  known: 'From your world',
  adjacent: 'Just beyond',
  unexpected: 'Something else',
};

const CATEGORY_LABELS: Record<string, string> = {
  music: 'Music',
  'stories-and-words': 'Stories & words',
  'screen-and-stage': 'Screen & stage',
  universal: 'Inner life',
};

export default async function ExplorePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const cards = await getDrawForUser(userId);

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex justify-between items-center px-8 py-6">
        <Link href="/" className="text-sm font-light text-stone-900 tracking-tight">
          Gherkin
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/gallery"
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            My gallery
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-4xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#466353] mb-2">
                Today
              </p>
              <h1 className="text-3xl font-light text-stone-900">
                Explore today&apos;s prompt.
              </h1>
            </div>
            <RefreshButton />
          </div>

          {cards.length === 0 ? (
            <p className="text-sm text-[#466353]">
              No prompts available. Try again shortly.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cards.map((card) => (
                <Link
                  key={card.id}
                  href={`/reflect/${card.id}`}
                  className="group flex flex-col justify-between bg-white border border-stone-200 rounded-2xl p-6 min-h-52 hover:border-[#85A16A] hover:shadow-sm transition-all duration-200"
                >
                  <p className="text-stone-800 text-base font-light leading-relaxed">
                    {card.text}
                  </p>
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-[#466353] uppercase tracking-widest">
                        {CARD_LABELS[card.type]}
                      </span>
                      <span className="text-xs text-[#466353]">
                        {CATEGORY_LABELS[card.category] ?? card.category}
                      </span>
                    </div>
                    <span className="text-[#466353] group-hover:text-[#85A16A] transition-colors text-lg">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
