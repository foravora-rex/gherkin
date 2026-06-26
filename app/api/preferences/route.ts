import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { tags } = await request.json();

  await sql`
    UPDATE user_profiles SET tags = ${tags} WHERE clerk_id = ${userId}
  `;

  return NextResponse.json({ success: true });
}
