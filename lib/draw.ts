import { sql } from './db';
import { generateEmbedding } from './embeddings';
import { buildProfileString } from './profile';

export { buildProfileString };

type Prompt = {
  id: string;
  text: string;
  category: string;
  tags: string[];
};

export type DrawCard = Prompt & { type: 'known' | 'adjacent' | 'unexpected' };

const CULTURAL_CATEGORIES = ['music', 'stories-and-words', 'screen-and-stage'];

const BROAD_TO_CATEGORY: Record<string, string> = {
  music: 'music',
  'screen-stage': 'screen-and-stage',
  'stories-words': 'stories-and-words',
};

export function buildAdjacentPool(userTags: string[]): string[] {
  const preferredCategories = userTags
    .map((t) => BROAD_TO_CATEGORY[t])
    .filter(Boolean) as string[];
  const adjacentCategories = CULTURAL_CATEGORIES.filter((c) => !preferredCategories.includes(c));
  return adjacentCategories.length > 0 ? adjacentCategories : CULTURAL_CATEGORIES;
}

export async function getDrawForUser(userId: string): Promise<DrawCard[]> {
  const profileRows = await sql`
    SELECT tags, inner_life, chapter FROM user_profiles WHERE clerk_id = ${userId}
  `;

  const userTags = (profileRows[0]?.tags as string[]) ?? [];
  const innerLife = (profileRows[0]?.inner_life as string[]) ?? [];
  const chapter = (profileRows[0]?.chapter as string | null) ?? null;

  const answeredRows = await sql`
    SELECT prompt_id FROM reflections WHERE clerk_id = ${userId}
  `;
  const answeredIds = answeredRows.map((r) => r.prompt_id as string);

  const profileString = buildProfileString(userTags, innerLife, chapter);
  const profileEmbedding = await generateEmbedding(profileString);
  const embeddingLiteral = `[${profileEmbedding.join(',')}]`;

  const adjacentPool = buildAdjacentPool(userTags);

  // Known: random pick from the 10 semantically closest prompts across all categories
  const knownRows =
    answeredIds.length > 0
      ? await sql`
          SELECT id, text, category, tags FROM (
            SELECT id, text, category, tags FROM prompts
            WHERE id != ALL(${answeredIds}::uuid[])
            ORDER BY embedding <=> ${embeddingLiteral}::vector
            LIMIT 10
          ) pool ORDER BY random() LIMIT 1
        `
      : await sql`
          SELECT id, text, category, tags FROM (
            SELECT id, text, category, tags FROM prompts
            ORDER BY embedding <=> ${embeddingLiteral}::vector
            LIMIT 10
          ) pool ORDER BY random() LIMIT 1
        `;
  const known = (knownRows[0] as Prompt) ?? null;

  const excluded1 = [...answeredIds, ...(known ? [known.id] : [])];

  // Adjacent: random pick from the 10 closest prompts outside user's preferred categories
  const adjacentRows =
    excluded1.length > 0
      ? await sql`
          SELECT id, text, category, tags FROM (
            SELECT id, text, category, tags FROM prompts
            WHERE category = ANY(${adjacentPool}::text[])
            AND id != ALL(${excluded1}::uuid[])
            ORDER BY embedding <=> ${embeddingLiteral}::vector
            LIMIT 10
          ) pool ORDER BY random() LIMIT 1
        `
      : await sql`
          SELECT id, text, category, tags FROM (
            SELECT id, text, category, tags FROM prompts
            WHERE category = ANY(${adjacentPool}::text[])
            ORDER BY embedding <=> ${embeddingLiteral}::vector
            LIMIT 10
          ) pool ORDER BY random() LIMIT 1
        `;
  const adjacent = (adjacentRows[0] as Prompt) ?? null;

  const excluded2 = [...excluded1, ...(adjacent ? [adjacent.id] : [])];

  // Unexpected: random pick from the 10 most semantically distant universal prompts
  const unexpectedRows =
    excluded2.length > 0
      ? await sql`
          SELECT id, text, category, tags FROM (
            SELECT id, text, category, tags FROM prompts
            WHERE category = 'universal'
            AND id != ALL(${excluded2}::uuid[])
            ORDER BY embedding <=> ${embeddingLiteral}::vector DESC
            LIMIT 10
          ) pool ORDER BY random() LIMIT 1
        `
      : await sql`
          SELECT id, text, category, tags FROM (
            SELECT id, text, category, tags FROM prompts
            WHERE category = 'universal'
            ORDER BY embedding <=> ${embeddingLiteral}::vector DESC
            LIMIT 10
          ) pool ORDER BY random() LIMIT 1
        `;
  const unexpected = (unexpectedRows[0] as Prompt) ?? null;

  return [
    ...(known ? [{ ...known, type: 'known' as const }] : []),
    ...(adjacent ? [{ ...adjacent, type: 'adjacent' as const }] : []),
    ...(unexpected ? [{ ...unexpected, type: 'unexpected' as const }] : []),
  ];
}
