import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import OnboardingQuiz from './_components/OnboardingQuiz';

export default async function QuizPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const rows = await sql`
    SELECT clerk_id FROM user_profiles WHERE clerk_id = ${userId}
  `;

  if (rows.length > 0) {
    redirect('/quiz/draw');
  }

  return <OnboardingQuiz />;
}
