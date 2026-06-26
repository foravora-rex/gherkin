import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import OnboardingQuiz from './_components/OnboardingQuiz';
import ExistingPreferences from './_components/ExistingPreferences';

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ recalibrate?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { recalibrate } = await searchParams;
  const isRecalibrating = recalibrate === 'true';

  const rows = await sql`
    SELECT tags FROM user_profiles
    WHERE clerk_id = ${userId} AND cardinality(tags) > 0
  `;

  const hasCompletedOnboarding = rows.length > 0;

  if (hasCompletedOnboarding && !isRecalibrating) {
    return <ExistingPreferences tags={rows[0].tags as string[]} />;
  }

  return <OnboardingQuiz />;
}
