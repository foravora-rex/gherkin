import { sql } from './db';
import { ALL_GENRE_IDS, BROAD_TAGS } from './tags';

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

async function pickPrompt(
  excludeIds: string[],
  genreTags?: string[],
  categories?: string[]
): Promise<Prompt | null> {
  const hasExclusions = excludeIds.length > 0;

  // Try genre-level match first (most precise)
  if (genreTags && genreTags.length > 0) {
    const rows = hasExclusions
      ? await sql`
          SELECT id, text, category, tags FROM prompts
          WHERE tags && ${genreTags}::text[]
          AND id != ALL(${excludeIds}::uuid[])
          ORDER BY random() LIMIT 1
        `
      : await sql`
          SELECT id, text, category, tags FROM prompts
          WHERE tags && ${genreTags}::text[]
          ORDER BY random() LIMIT 1
        `;
    if (rows[0]) return rows[0] as Prompt;
  }

  // Fall back to category-level match
  if (categories && categories.length > 0) {
    const rows = hasExclusions
      ? await sql`
          SELECT id, text, category, tags FROM prompts
          WHERE category = ANY(${categories}::text[])
          AND id != ALL(${excludeIds}::uuid[])
          ORDER BY random() LIMIT 1
        `
      : await sql`
          SELECT id, text, category, tags FROM prompts
          WHERE category = ANY(${categories}::text[])
          ORDER BY random() LIMIT 1
        `;
    if (rows[0]) return rows[0] as Prompt;
  }

  // Last resort: any unanswered prompt
  const rows = hasExclusions
    ? await sql`
        SELECT id, text, category, tags FROM prompts
        WHERE id != ALL(${excludeIds}::uuid[])
        ORDER BY random() LIMIT 1
      `
    : await sql`
        SELECT id, text, category, tags FROM prompts
        ORDER BY random() LIMIT 1
      `;
  return (rows[0] as Prompt) ?? null;
}

export async function getDrawForUser(userId: string): Promise<DrawCard[]> {
  const profileRows = await sql`
    SELECT tags FROM user_profiles WHERE clerk_id = ${userId}
  `;
  const userTags = (profileRows[0]?.tags as string[]) ?? [];

  const answeredRows = await sql`
    SELECT prompt_id FROM reflections WHERE clerk_id = ${userId}
  `;
  const answeredIds = answeredRows.map((r) => r.prompt_id as string);

  // Implicit learning: tags from prompts the user has already reflected on
  const implicitRows = await sql`
    SELECT DISTINCT unnest(p.tags) AS tag
    FROM reflections r
    JOIN prompts p ON p.id = r.prompt_id
    WHERE r.clerk_id = ${userId}
  `;
  const implicitTags = implicitRows.map((r) => r.tag as string);

  // Separate broad interests from genre-level tags
  const broadTags = userTags.filter((t) => BROAD_TAGS.includes(t));
  const explicitGenreTags = userTags.filter((t) => ALL_GENRE_IDS.has(t));

  // Combine explicit genre preferences with implicit signals
  const knownGenreTags = [...new Set([...explicitGenreTags, ...implicitTags])];

  // Derive preferred categories from broad tags
  const preferredCategories = broadTags
    .map((t) => BROAD_TO_CATEGORY[t])
    .filter(Boolean) as string[];
  const fallbackCategories =
    preferredCategories.length > 0 ? preferredCategories : CULTURAL_CATEGORIES;

  // Adjacent: cultural categories NOT in the user's preferred set
  const adjacentCategories = CULTURAL_CATEGORIES.filter(
    (c) => !preferredCategories.includes(c)
  );

  const known = await pickPrompt(answeredIds, knownGenreTags, fallbackCategories);

  const excluded1 = [...answeredIds, ...(known ? [known.id] : [])];
  const adjacent = await pickPrompt(
    excluded1,
    undefined,
    adjacentCategories.length > 0 ? adjacentCategories : CULTURAL_CATEGORIES
  );

  const excluded2 = [...excluded1, ...(adjacent ? [adjacent.id] : [])];
  const unexpected = await pickPrompt(excluded2, undefined, ['universal']);

  return [
    ...(known ? [{ ...known, type: 'known' as const }] : []),
    ...(adjacent ? [{ ...adjacent, type: 'adjacent' as const }] : []),
    ...(unexpected ? [{ ...unexpected, type: 'unexpected' as const }] : []),
  ];
}
