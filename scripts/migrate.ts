import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('Running migrations...');

  await sql`CREATE EXTENSION IF NOT EXISTS vector`;

  await sql`
    CREATE TABLE IF NOT EXISTS user_profiles (
      clerk_id   TEXT        PRIMARY KEY,
      tags       TEXT[]      NOT NULL DEFAULT '{}',
      inner_life TEXT[]      NOT NULL DEFAULT '{}',
      chapter    TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS prompts (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      text        TEXT        NOT NULL,
      follow_up   TEXT,
      category    TEXT        NOT NULL,
      tags        TEXT[]      NOT NULL DEFAULT '{}',
      embedding   vector(1536),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE prompts DROP COLUMN IF EXISTS is_goat
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reflections (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_id      TEXT        NOT NULL REFERENCES user_profiles(clerk_id) ON DELETE CASCADE,
      prompt_id     UUID        NOT NULL REFERENCES prompts(id),
      prompt_text   TEXT        NOT NULL,
      transcript    TEXT        NOT NULL,
      rendered_text TEXT        NOT NULL,
      tone          TEXT        NOT NULL,
      embedding     vector(1536),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS prompts_embedding_idx
    ON prompts USING hnsw (embedding vector_cosine_ops)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS reflections_embedding_idx
    ON reflections USING hnsw (embedding vector_cosine_ops)
  `;

  console.log('✓ Migrations complete');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
