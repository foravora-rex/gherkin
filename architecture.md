# Gherkin — Architecture Design Document
*Written by Rocky & Lucy — last updated 2026-06-26*

---

## 1. What We Are Building

Gherkin is a self-discovery application. Users reflect on curated questions, build a permanent private gallery of their answers, and over time discover patterns in who they are. The core thesis: organising around *identity* rather than *time* (the day-level journalling model) produces a fundamentally different and more valuable artefact.

This document covers the technical architecture of the web-based demo — a working prototype built for user testing and professional portfolio use. Every decision is documented with its reasoning so that future contributors (or interviewers) can understand not just what was built, but why.

---

## 2. Platform: Web over iOS

**Decision:** Build a web application hosted on Vercel, not a native iOS app distributed via TestFlight.

**Reasoning:**

The original build plan targeted iOS. The pivot to web was driven by one insight: a CV demo needs zero-friction access. A TestFlight link requires an Apple device, an invite, and the patience to install — three things a hiring manager or investor will not reliably provide. A URL opens in three seconds on any device.

Secondary benefits:
- No Apple Developer Account ($99/year saved)
- No EAS/Expo build pipeline complexity
- No native module compilation (speech recognition was the main source of friction)
- Vercel Hobby tier is free; total infrastructure cost is ~$0.003 per reflection (Claude API)

**Trade-off acknowledged:** Voice input is the primary reflection mechanism in the product vision. The Web Speech API (Chrome/Edge only) is a weaker experience than Apple's `SFSpeechRecognizer`. For this demo, text input is the primary path with voice as an enhancement. If the product moves to production, native iOS is the right return.

---

## 3. Framework: Next.js App Router

**Decision:** Next.js 16 with App Router, TypeScript, Tailwind CSS.

**Reasoning:**

Next.js is the natural choice when deploying to Vercel — they are made by the same team, and the integration is first-class: instant deploys, automatic edge functions, environment variable management, and preview URLs on every push.

App Router (over Pages Router) was chosen because:
- Server Components reduce client-side JavaScript for content-heavy pages (gallery, card draw)
- Route handlers replace the need for a separate API layer
- `async/await auth()` from Clerk integrates cleanly with Server Components
- It is the current and future direction of Next.js — Pages Router is in maintenance mode

TypeScript throughout. The schema is strongly typed end-to-end: from the database query to the API response to the component props. This catches a class of bugs at compile time rather than runtime, which matters when moving fast on a solo project.

Tailwind CSS v4 for styling. No component library — the design language is intentionally minimal and bespoke (stone palette, clean typography, no shadows or decoration). A component library would add constraints and visual debt without benefit.

---

## 4. Hosting: Vercel

**Decision:** Vercel Hobby tier for hosting.

**Reasoning:**

Cost: free for the demo phase. The Hobby tier handles personal projects with no monthly fee. The only usage cost is Claude API calls (~$0.003 per reflection) and OpenAI embedding calls (~$0.00002 per prompt embed — negligible).

Vercel provides:
- Automatic HTTPS (required for Web Speech API, required for Clerk)
- Preview deployments on every git push (useful for sharing work-in-progress)
- Built-in environment variable management (syncs with local `.env.local`)
- Edge network for fast global response times

**When to move off Vercel Hobby:** When the app needs persistent background jobs (pattern surfacing triggered server-side), or when traffic exceeds free tier limits (~100GB bandwidth/month). Neither applies at demo scale.

---

## 5. Authentication: Clerk

**Decision:** Clerk for authentication, over anonymous UUID sessions.

**Reasoning:**

The alternative considered was an anonymous UUID stored in `localStorage` — simpler to set up, no login friction for the user. It was rejected on GDPR grounds.

**Why anonymous UUID fails GDPR:**

Reflection content is personal data under GDPR regardless of whether a name or email is attached. The content itself — personal thoughts, memories, fears — is identifiable. This means:

- There is no established lawful basis for processing (no consent, no contract)
- The right to erasure cannot be fulfilled: you cannot verify who owns a UUID, so you cannot safely delete the right person's data
- Data breach notification is impossible: no contact details means no way to notify affected users within the 72-hour GDPR window
- Vercel's edge infrastructure logs IP addresses alongside request paths, which can link a UUID to a real person — making the "anonymous" claim legally fragile

Clerk solves all of this:
- Consent is established at sign-up (lawful basis: contract)
- Right to erasure: delete account → cascade delete all reflections
- Breach notification: email addresses on file
- Data Processing Agreement: Clerk provides a DPA and is SOC 2 Type II certified

**Cost:** Free up to 50,000 Monthly Retained Users (as of 2026). For a demo, cost is $0.

**Implementation:** `ClerkProvider` wraps the application. All protected routes go through `proxy.ts` (Next.js 16's replacement for `middleware.ts`) using `clerkMiddleware` and `createRouteMatcher`. Auth is verified server-side on every API route via `await auth()` — the client never asserts its own identity.

---

## 6. Database: Neon Postgres + pgvector

**Decision:** Neon serverless Postgres with the pgvector extension, over a dedicated vector database (Pinecone, Weaviate, etc.).

**Reasoning:**

The core question was: do we need a separate vector database, or can Postgres handle it?

For this application, Postgres with pgvector is the right answer for three reasons:

**1. One service, not two.**
Adding a dedicated vector database means a second connection, a second set of credentials, a second billing relationship, and a second failure mode. pgvector gives vector similarity search inside the same Postgres instance that holds the rest of the data. A reflection can be stored and its embedding indexed in a single transaction.

**2. HNSW indexes are fast enough.**
pgvector's HNSW (Hierarchical Navigable Small World) indexes provide approximate nearest-neighbour search at millisecond latency for our data volumes. We are not operating at the scale where a dedicated vector database's performance advantage becomes meaningful. At 10,000 prompts and tens of thousands of reflections, pgvector is fast.

**3. Joins work.**
The card draw query needs to retrieve semantically similar prompts *and* join them with category and tag metadata in a single query. In a hybrid architecture (relational DB + separate vector DB), this requires two round trips and application-side merging. pgvector does it in one query.

**Why Neon specifically:**
- Serverless Postgres — scales to zero, no idle compute cost
- pgvector pre-installed on all instances (no manual extension management)
- Native Vercel integration (environment variable injection)
- Free tier sufficient for demo scale (0.5GB storage, 190 compute hours/month)
- Connection pooling via the `@neondatabase/serverless` driver, which uses HTTP rather than persistent TCP connections — correct for serverless environments where persistent connections are expensive

---

## 7. Embeddings: OpenAI text-embedding-3-small

**Decision:** OpenAI `text-embedding-3-small` for generating embeddings, over Voyage AI or local models.

**Reasoning:**

Anthropic does not offer an embedding API. Claude handles text generation; a separate provider handles embeddings. Three options were evaluated:

| Option | Dimensions | Cost | Notes |
|---|---|---|---|
| OpenAI text-embedding-3-small | 1536 | ~$0.00002/1K tokens | Industry standard, widely supported |
| Voyage AI voyage-3-lite | 512 | ~$0.00002/1K tokens | Anthropic's recommended partner |
| Local model (@xenova/transformers) | varies | $0 | Slower, adds bundle weight, offline only |

`text-embedding-3-small` was chosen because it is the industry standard — recognised by any engineer who reviews the code, well-documented, and trivially integrated via the `openai` npm package. The cost difference between OpenAI and Voyage is negligible at demo scale.

**Embedding strategy:**
- Prompts are embedded once at seed time. The embedding captures the full semantic meaning of the question (text + follow-up if present, concatenated).
- User reflections are embedded at save time, immediately after the user confirms their rendered text.
- The user's interest profile (for the card draw) is embedded at query time from a string constructed from their tags: `"Interests: indie music, literary fiction. Inner life: overthinker. Chapter: in transition."`

---

## 8. AI Generation: Anthropic Claude (claude-sonnet-4-6)

**Decision:** Claude Sonnet for all AI generation tasks: tone rendering, follow-up question generation, and pattern surfacing synthesis.

**Reasoning:**

Claude is the right model for text that needs to feel genuinely human and emotionally intelligent. The four rendering tones (Poetic, Letter to myself, Field notes, Unfiltered) require a model that can hold a consistent voice, understand register, and produce prose that doesn't feel generated. Claude Sonnet is the balance point between quality and cost — Claude Opus would be higher quality but the cost difference is not justified for a demo.

**Tasks handled by Claude:**
1. **Tone rendering** — Takes the user's raw transcript and renders it in the chosen tone. The prompt is precise about each tone's characteristics.
2. **Dig deeper** — Generates a single follow-up question after a reflection, tailored to what the user actually said.
3. **Pattern surfacing** — Receives the top-N semantically similar reflections (retrieved via pgvector) and synthesises recurring themes. This is the RAG output step.

**What Claude does not do:**
- Claude does not converse. There is no chatbot. The AI is a quiet layer beneath the user experience — it renders, it observes, it occasionally offers one question. It does not interrupt.

---

## 9. RAG Architecture

Retrieval-Augmented Generation powers two features: the card draw and the pattern surfacing.

### 9.1 Card Draw (Prompt Retrieval)

**The problem it solves:** Rule-based tag matching is brittle. A user tagged as "Bookworm" and "Overthinker" needs prompts that genuinely resonate — not just any prompt with those tag strings attached. Semantic similarity captures nuance that string matching cannot.

**How it works:**

1. At draw time, construct a user profile string from their stored tags and life chapter.
2. Embed that string using `text-embedding-3-small`.
3. Query pgvector three times using cosine distance:
   - **Known card:** `ORDER BY embedding <=> $userEmbedding LIMIT 1` — closest semantic match, excluding recently seen prompts
   - **Adjacent card:** retrieve prompts at mid-range distance — close enough to be relevant, different enough to stretch
   - **Unexpected card:** retrieve from the furthest semantic distance — genuinely outside the user's declared territory
4. Return all three simultaneously.

The "adjacent" threshold is the interesting engineering decision. We use a cosine distance range rather than a fixed offset: prompts with distance between 0.3 and 0.6 from the user embedding. This is tunable once we have real user data.

### 9.2 Pattern Surfacing (Reflection Retrieval)

**How it works:**

1. User triggers "See patterns" explicitly.
2. Retrieve all of the user's reflections (or the most recent N if they have many).
3. Run a clustering query: find groups of reflections whose embeddings are close to each other — these are the recurring themes.
4. Pass the top clusters to Claude with a synthesis prompt: *"Here are reflections from a user across different questions. Identify the 2-3 recurring themes in how they think and what they care about. Be specific — name what you see."*
5. Return Claude's synthesis to the user.

**The cold start constraint:** Pattern surfacing requires at least 3 reflections to be meaningful. Below that threshold, the app shows an honest holding state rather than a weak result.

---

## 10. Schema Design

### Tables

**`user_profiles`**
```
clerk_id   TEXT PRIMARY KEY    — Clerk user ID, e.g. "user_2abc..."
tags       TEXT[]              — Passion tags from onboarding quiz
inner_life TEXT[]              — Inner life tags surfaced by quiz
chapter    TEXT                — Life chapter (nullable)
created_at TIMESTAMPTZ
```

**`prompts`**
```
id         UUID PRIMARY KEY
text       TEXT                — The question
follow_up  TEXT (nullable)     — Pre-written follow-up; non-null signals GOAT format
category   TEXT                — Source library: 'music', 'stories-and-words', etc.
tags       TEXT[]              — Specific tag: 'indie-alternative', 'literary-fiction', etc.
embedding  vector(1536)        — OpenAI text-embedding-3-small
created_at TIMESTAMPTZ
```

**`reflections`**
```
id            UUID PRIMARY KEY
clerk_id      TEXT → user_profiles.clerk_id (CASCADE DELETE)
prompt_id     UUID → prompts.id
prompt_text   TEXT                — Denormalised for display without join
transcript    TEXT                — Raw user input
rendered_text TEXT                — AI-rendered version
tone          TEXT                — 'raw' | 'poetic' | 'letter' | 'field-notes' | 'unfiltered'
embedding     vector(1536)        — For pattern surfacing
created_at    TIMESTAMPTZ
```

### Key Design Decisions

**Tags as `TEXT[]`, not a foreign key to a tags table.**
Adding a new passion tag requires zero schema changes — write new prompts with the new tag string and seed them. The taxonomy is a content concern, not a structural one. This was a deliberate choice to keep the system extensible without migrations.

**`is_goat` column was removed.**
Initially included as a boolean flag for GOAT-format prompts. Rejected because `follow_up IS NOT NULL` carries the same information with no redundancy. The UI renders follow-ups upfront when they exist; it does not need a separate flag to know this.

**`prompt_text` is denormalised onto `reflections`.**
The prompt text a user reflected on should be readable in their gallery without always joining to the `prompts` table. Prompts could theoretically be edited or reworded over time; the reflection should preserve the exact question the user was given at the time they wrote their answer.

**`clerk_id` as the universal user key.**
Clerk generates this identifier. It is verified server-side on every request via `await auth()`. The client never asserts its own identity. This is the single thread connecting user identity across all tables.

### Indexes

```sql
-- HNSW indexes for approximate nearest-neighbour search
CREATE INDEX ON prompts     USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON reflections USING hnsw (embedding vector_cosine_ops);
```

HNSW (Hierarchical Navigable Small World) is chosen over IVFFlat because it provides better recall at query time without requiring a training step on the data. For our volumes, the build time cost is negligible.

---

## 11. Security

### Row-Level Security (RLS)

RLS is enforced at the Postgres level on `reflections` and `user_profiles`. Even if application code passes the wrong `clerk_id` due to a bug, the database rejects the query. This is defence in depth — security that does not rely solely on application correctness.

### Why Application-Level Encryption Was Not Implemented

The reflections table holds highly personal data. Encrypting it at the application level before storage was considered and rejected for one reason: **it breaks RAG**.

Pattern surfacing requires vector similarity search over `reflections.embedding`. That embedding is a semantic fingerprint of the reflection content. If we encrypt the text but store the embedding unencrypted, an attacker with database access can use the embedding to approximate the original text — making the encryption partially cosmetic. A fully consistent encryption model would require encrypting both text and embedding, which makes vector search impossible.

The correct production approach — per-user encryption keys with embeddings stored in a separate, access-controlled store — is out of scope for this demo. The controls in place (RLS, Neon encryption at rest, Clerk-verified server-side auth, HTTPS) provide appropriate protection for demo scale.

### Encryption at Rest

Neon encrypts all data at rest with AES-256. This is transparent — no application code required.

### HTTPS

Enforced by Vercel on all deployments. Required for Clerk auth and for the Web Speech API (browser enforces HTTPS for microphone access).

---

## 12. What Is Deferred

| Feature | Status | Reason |
|---|---|---|
| Voice input (primary) | Web Speech API placeholder | Chrome/Edge only; acceptable for demo. Native iOS would be the production path. |
| Scrapbook / visual mode | Post-MVP | Core hypothesis (do people reflect deeply?) must be validated before investing in the aesthetic layer |
| Friend matching | Post-MVP | Requires user base; meaningless at demo scale |
| Thumbs-down avoidance tracking | Post-MVP | Needs enough session data to be meaningful |
| Production Clerk instance | Post-demo | Development instance configured. Production instance needed before public launch. |
| Per-user encryption keys | Post-demo | Requires rethinking the RAG architecture; out of scope for demo |
| Shareable card export | Nice-to-have | Core loop validated first |

---

## 13. Cost Summary (Demo Phase)

| Service | Cost |
|---|---|
| Vercel (hosting) | $0 — Hobby tier |
| Clerk (auth) | $0 — free up to 50K Monthly Retained Users |
| Neon Postgres + pgvector | $0 — free tier |
| OpenAI embeddings | ~$0.00002 per prompt (one-time seed cost) |
| Claude API (tone rendering) | ~$0.003 per reflection |
| Claude API (pattern surfacing) | ~$0.005 per synthesis |

Total variable cost per active user per session: **~$0.008**. Negligible at demo scale.

---

*Architecture by Rocky & Lucy — Gherkin, 2026*
