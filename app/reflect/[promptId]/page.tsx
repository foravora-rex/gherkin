import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import AuthHeader from '@/components/AuthHeader';
import ReflectionFlow from './_components/ReflectionFlow';

export default async function ReflectPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { promptId } = await params;

  const [prompt] = await sql`
    SELECT id, text, follow_up FROM prompts WHERE id = ${promptId}
  `;
  if (!prompt) redirect('/explore');

  const [profile] = await sql`
    SELECT preferred_tone FROM user_profiles WHERE clerk_id = ${userId}
  `;

  return (
    <div className="flex-1 flex flex-col">
      <AuthHeader />
      <ReflectionFlow
        promptId={prompt.id as string}
        promptText={prompt.text as string}
        followUp={(prompt.follow_up as string | null) ?? null}
        preferredTone={(profile?.preferred_tone as string | null) ?? null}
      />
    </div>
  );
}
