import { neon } from '@neondatabase/serverless';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { prompts } from './data/prompts';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

function embeddingInput(text: string, followUp?: string): string {
  return followUp ? `${text} ${followUp}` : text;
}

async function seed() {
  console.log(`Seeding ${prompts.length} prompts...`);

  const existing = await sql`SELECT COUNT(*)::int AS count FROM prompts`;
  if (existing[0].count > 0) {
    console.log(`Database already has ${existing[0].count} prompts. Skipping seed.`);
    console.log('To reseed, run: DELETE FROM prompts; then npm run seed');
    process.exit(0);
  }

  let seeded = 0;

  for (const prompt of prompts) {
    const input = embeddingInput(prompt.text, prompt.follow_up);
    const embedding = await generateEmbedding(input);
    const embeddingLiteral = `[${embedding.join(',')}]`;

    await sql`
      INSERT INTO prompts (text, follow_up, category, tags, embedding)
      VALUES (
        ${prompt.text},
        ${prompt.follow_up ?? null},
        ${prompt.category},
        ${prompt.tags},
        ${embeddingLiteral}::vector
      )
    `;

    seeded++;
    process.stdout.write(`\r${seeded}/${prompts.length} prompts seeded`);
  }

  console.log(`\n✓ Seed complete — ${seeded} prompts in database`);
}

seed().catch((err) => {
  console.error('\nSeed failed:', err);
  process.exit(1);
});
