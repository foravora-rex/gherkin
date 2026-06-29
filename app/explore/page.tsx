import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getDrawForUser } from '@/lib/draw';
import { drawLimiter } from '@/lib/ratelimit';
import AuthHeader from '@/components/AuthHeader';
import RefreshButton from './_components/RefreshButton';
import ExploreCard from './_components/ExploreCard';
import BubbleField from '@/components/BubbleField';

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

  const { success, remaining } = await drawLimiter.limit(userId);

  const isExhausted = !success;
  const isLastDraw = success && remaining === 0;
  const cards = isExhausted ? [] : await getDrawForUser(userId);

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      <BubbleField />
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
            {!isExhausted && !isLastDraw && <RefreshButton />}
          </div>

          {(isExhausted || isLastDraw) && (
            <div className="mb-8 px-5 py-4 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-600">
              Our croupier has shuffled their last card for today — apparently {isExhausted ? 'this many' : '50'} draws in a single day is enough to exhaust even the most dedicated deck-handler. They&apos;re resting now. Come back tomorrow for a fresh hand.
            </div>
          )}

          {cards.length > 0 && (
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
