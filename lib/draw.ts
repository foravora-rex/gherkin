import { sql } from './db';

type Prompt = {
  id: string;
  text: string;
  category: string;
  tags: string[];
};

export type DrawCard = Prompt & { type: 'known' | 'adjacent' | 'unexpected' };

const CULTURAL_CATEGORIES = ['music', 'stories-and-words', 'screen-and-stage'];

function mapTagsToCategories(tags: string[]): string[] {
  const map: Record<string, string> = {
    music: 'music',
    'screen-stage': 'screen-and-stage',
    'stories-words': 'stories-and-words',
  };
  return tags.map((t) => map[t]).filter(Boolean) as string[];
}

async function pickPrompt(excludeIds: string[], categories?: string[]): Promise<Prompt | null> {
  const hasCategories = categories && categories.length > 0;
  const hasExclusions = excludeIds.length > 0;

  if (hasCategories) {
    const rows = hasExclusions
      ? await sql`
          SELECT id, text, category, tags FROM prompts
          WHERE category = ANY(${categories!}::text[])
          AND id != ALL(${excludeIds}::uuid[])
          ORDER BY random() LIMIT 1
        `
      : await sql`
          SELECT id, text, category, tags FROM prompts
          WHERE category = ANY(${categories!}::text[])
          ORDER BY random() LIMIT 1
        `;
    if (rows[0]) return rows[0] as Prompt;
  }

  // Fallback: any category
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

  const preferredCategories = mapTagsToCategories(userTags);
  const adjacentCategories = CULTURAL_CATEGORIES.filter(
    (c) => !preferredCategories.includes(c)
  );

  const known = await pickPrompt(
    answeredIds,
    preferredCategories.length > 0 ? preferredCategories : CULTURAL_CATEGORIES
  );

  const excluded1 = [...answeredIds, ...(known ? [known.id] : [])];
  const adjacent = await pickPrompt(
    excluded1,
    adjacentCategories.length > 0 ? adjacentCategories : CULTURAL_CATEGORIES
  );

  const excluded2 = [...excluded1, ...(adjacent ? [adjacent.id] : [])];
  const unexpected = await pickPrompt(excluded2, ['universal']);

  return [
    ...(known ? [{ ...known, type: 'known' as const }] : []),
    ...(adjacent ? [{ ...adjacent, type: 'adjacent' as const }] : []),
    ...(unexpected ? [{ ...unexpected, type: 'unexpected' as const }] : []),
  ];
}
