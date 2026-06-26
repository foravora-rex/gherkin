import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';
import { reflectionLimiter } from '@/lib/ratelimit';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await reflectionLimiter.limit(userId);
  if (!success) {
    return NextResponse.json({ error: 'Daily reflection limit reached' }, { status: 429 });
  }

  const { promptId, promptText, transcript, renderedText, tone } = await request.json();

  const embedding = await generateEmbedding(transcript);

  await sql`
    INSERT INTO reflections (clerk_id, prompt_id, prompt_text, transcript, rendered_text, tone, embedding)
    VALUES (
      ${userId},
      ${promptId},
      ${promptText},
      ${transcript},
      ${renderedText},
      ${tone},
      ${JSON.stringify(embedding)}
    )
  `;

  const toneCountRows = await sql`
    SELECT COUNT(*)::int AS count FROM reflections
    WHERE clerk_id = ${userId} AND tone = ${tone}
  `;
  const toneCount = toneCountRows[0].count as number;

  if (toneCount >= 3) {
    await sql`
      UPDATE user_profiles SET preferred_tone = ${tone} WHERE clerk_id = ${userId}
    `;
  }

  return NextResponse.json({ success: true });
}
