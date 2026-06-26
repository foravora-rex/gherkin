import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getDrawForUser } from '@/lib/draw';
import AuthHeader from '@/components/AuthHeader';
import RefreshButton from './_components/RefreshButton';
import ExploreCard from './_components/ExploreCard';

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
      <AuthHeader />

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
                <ExploreCard
                  key={card.id}
                  id={card.id}
                  text={card.text}
                  type={card.type}
                  category={card.category}
                  cardLabel={CARD_LABELS[card.type]}
                  categoryLabel={CATEGORY_LABELS[card.category] ?? card.category}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
