import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AuthHeader from '@/components/AuthHeader';
import PreferencesForm from './_components/PreferencesForm';

export default async function PreferencesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [profile] = await sql`
    SELECT tags FROM user_profiles WHERE clerk_id = ${userId}
  `;
  if (!profile) redirect('/quiz');

  return (
    <div className="flex-1 flex flex-col">
      <AuthHeader />
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <PreferencesForm currentTags={(profile.tags as string[]) ?? []} />
      </div>
    </div>
  );
}
