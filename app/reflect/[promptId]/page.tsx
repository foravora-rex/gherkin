import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';

export default async function ReflectPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { promptId } = await params;

  const [prompt] = await sql`
    SELECT text FROM prompts WHERE id = ${promptId}
  `;

  if (!prompt) redirect('/explore');

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-stone-300 mb-8">Reflect</p>
      <p className="text-xl font-light text-stone-800 leading-relaxed mb-8">
        {prompt.text}
      </p>
      <p className="text-sm text-stone-400">Reflection input coming soon.</p>
    </div>
  );
}
