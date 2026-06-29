import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { patternLimiter } from '@/lib/ratelimit';
import { stripJsonFences } from '@/lib/json';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a perceptive reader examining someone's private reflections. Your task: identify what genuinely recurs in how this person thinks, what they care about, and how they relate to themselves and the world.

Be specific. Name what is actually there. Avoid generic observations that could apply to anyone. Quote their exact words when they are telling.

Write each observation directly to the person — use "you", not "they".

Return a JSON array of 2 to 3 patterns. Each pattern has:
- "theme": a short, precise name (3–6 words)
- "observation": 2–3 sentences that name what you see and why it matters

Return only valid JSON. No preamble, no explanation, no other text.`;

export type Pattern = {
  theme: string;
  observation: string;
};

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await patternLimiter.limit(userId);
  if (!success) {
    return NextResponse.json({ error: 'Daily pattern limit reached' }, { status: 429 });
  }

  const rows = await sql`
    SELECT prompt_text, rendered_text
    FROM reflections
    WHERE clerk_id = ${userId}
    ORDER BY created_at ASC
  `;

  if (rows.length < 3) {
    return NextResponse.json({ error: 'Not enough reflections' }, { status: 422 });
  }

  const reflectionsText = rows
    .map(
      (r) =>
        `---\nPrompt: "${r.prompt_text as string}"\nReflection: ${r.rendered_text as string}\n---`
    )
    .join('\n\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Here are the reflections:\n\n${reflectionsText}`,
      },
    ],
  });

  const raw = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  const json = stripJsonFences(raw);
  const patterns: Pattern[] = JSON.parse(json);

  return NextResponse.json({ patterns, reflectionCount: rows.length });
}
