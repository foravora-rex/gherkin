import { createHash } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { patternLimiter } from '@/lib/ratelimit';
import redis from '@/lib/redis';
import { stripJsonFences } from '@/lib/json';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a perceptive, well-read observer examining someone's private reflections. You draw on psychology, philosophy, and the social sciences — not to diagnose or categorise, but to illuminate what is genuinely present in how this person thinks and feels.

Your task: identify 2–3 patterns that recur in how this person thinks, what they care about, and how they relate to themselves and the world.

For each pattern:
— Ground your observation in an established framework: psychology (attachment theory, cognitive psychology, developmental psychology, positive psychology, Jungian concepts, existential psychology), philosophy (Stoicism, existentialism, phenomenology, virtue ethics), sociology, anthropology, or neuroscience. Name the framework or thinker naturally within the observation — woven into the insight, not appended as a citation.
— Be specific to this person. Quote their exact words when they are telling. Avoid observations so general they could apply to anyone.
— Frame patterns as tendencies or processes, not fixed traits. "You tend to..." rather than "You are...".
— Weight observations that recur across different topics more heavily — the more varied the contexts in which a pattern appears, the stronger the signal.
— Write directly to the person in second person. Be warm, precise, and honest.
— Do not reference pseudosciences: no astrology, numerology, Myers-Briggs, enneagram, Human Design, or similar.
— End each observation with a question or an unresolved thought that invites the person to go further. The pattern should feel like a beginning, not a verdict.

Return a JSON array of 2 to 3 patterns. Each pattern has:
— "theme": a short, human phrase naming the pattern (3–6 words, not a clinical label)
— "observation": 2–3 sentences that name what you see in this person's specific words, connect it to a relevant framework, and close with something worth sitting with

Return only valid JSON. No preamble, no explanation, no other text.`;

export type Pattern = {
  theme: string;
  observation: string;
};

const CACHE_KEY_PREFIX = 'gherkin:patterns_cache';
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days — fingerprint invalidates before TTL in practice

type PatternsCache = {
  fingerprint: string;
  patterns: Pattern[];
};

function buildFingerprint(rows: Record<string, unknown>[]): string {
  const content = rows.map((r) => r.rendered_text as string).join('\x00');
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const force = req.nextUrl.searchParams.get('force') === 'true';

  const rows = await sql`
    SELECT prompt_text, rendered_text
    FROM reflections
    WHERE clerk_id = ${userId}
    ORDER BY created_at ASC
  `;

  if (rows.length < 3) {
    return NextResponse.json({ error: 'Not enough reflections' }, { status: 422 });
  }

  const fingerprint = buildFingerprint(rows);
  const cacheKey = `${CACHE_KEY_PREFIX}:${userId}`;

  if (!force) {
    const cached = await redis.get<PatternsCache>(cacheKey);
    if (cached?.fingerprint === fingerprint) {
      return NextResponse.json({ patterns: cached.patterns, reflectionCount: rows.length, cached: true });
    }
  }

  const { success } = await patternLimiter.limit(userId);
  if (!success) {
    return NextResponse.json({ error: 'Daily pattern limit reached' }, { status: 429 });
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
    temperature: 0.4,
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

  await redis.set<PatternsCache>(cacheKey, { fingerprint, patterns }, { ex: CACHE_TTL_SECONDS });

  return NextResponse.json({ patterns, reflectionCount: rows.length, cached: false });
}
