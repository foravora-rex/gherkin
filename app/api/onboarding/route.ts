import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tags, chapter, inner_life } = await request.json();

  await sql`
    INSERT INTO user_profiles (clerk_id, tags, chapter, inner_life)
    VALUES (${userId}, ${tags}, ${chapter}, ${inner_life})
    ON CONFLICT (clerk_id) DO UPDATE
    SET tags       = EXCLUDED.tags,
        chapter    = EXCLUDED.chapter,
        inner_life = EXCLUDED.inner_life
  `;

  return NextResponse.json({ success: true });
}
