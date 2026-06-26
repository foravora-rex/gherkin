# Gherkin — Architecture Design Document
*Written by Rocky & Lucy — last updated 2026-06-26*  
*Draw architecture updated 2026-06-26: vector-based curation implemented*

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

Tailwind CSS v4 for styling. No component library — the design language is intentionally minimal and bespoke (stone palette, sage green `#85A16A` CTAs, teal `#466353` secondary text). A component library would add constraints and visual debt without benefit.

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
- Native Vercel Analytics integration (cookieless, no configuration required)

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
The card draw query needs to retrieve prompts by tag and category in a single query. In a hybrid architecture (relational DB + separate vector DB), this requires two round trips and application-side merging. Postgres does it in one query.

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
- User reflections are embedded at save time from the raw `transcript` (the user's own words), not the AI-rendered version. This keeps the semantic signal close to the user's voice.
- The user profile embedding (constructed at draw time from tags + inner life + chapter) powers card curation via cosine distance against prompt embeddings.
- Reflection embeddings are stored for future use — available for embedding-based pattern surfacing when corpus size warrants retrieval pre-filtering (see Section 12).

---

## 8. AI Generation: Anthropic Claude (claude-sonnet-4-6)

**Decision:** Claude Sonnet for all AI generation tasks: tone rendering, follow-up question generation, and pattern surfacing synthesis.

**Reasoning:**

Claude is the right model for text that needs to feel genuinely human and emotionally intelligent. The five rendering options (Poetic, Letter to myself, Field notes, Unfiltered, and As written) require a model that can hold a consistent voice, understand register, and produce prose that doesn't feel generated. Claude Sonnet is the balance point between quality and cost — Claude Opus would be higher quality but the cost difference is not justified for a demo.

**Tasks handled by Claude:**
1. **Tone rendering** — Takes the user's raw transcript and renders it in the chosen tone. The prompt is precise about each tone's characteristics.
2. **Pattern surfacing** — Receives all of a user's saved reflections and synthesises 2–3 recurring themes, returned as structured JSON cards. See Section 12.

**What Claude does not do:**
- Claude does not converse. There is no chatbot. The AI is a quiet layer beneath the user experience — it renders, it observes. It does not interrupt.

---

## 9. Card Draw Algorithm

The card draw surfaces three prompts per session using vector similarity search against the user's semantic profile.

### 9.1 Vector-Based Curation

**The problem with tag matching:** Tag string overlap is brittle. A user who loves Dostoevsky and tagged themselves `literary-fiction` needs prompts about moral weight and inner conflict — not just prompts that happen to carry the same tag string. Semantic similarity captures that nuance; tag matching cannot.

**How it works (`lib/draw.ts`):**

1. Load the user's `tags`, `inner_life`, and `chapter` from `user_profiles`.
2. Construct a profile string: `"Interests: Folk & Singer-Songwriter. Inner life: overthinker. Chapter: in transition."` — this is the semantic fingerprint of the user's declared self.
3. Embed that string once using `text-embedding-3-small`. One OpenAI call per draw, one vector reused for all three cards.
4. Query pgvector with different constraints per card type:

| Card | Label | Query logic |
|---|---|---|
| Known | "From your world" | Fetch the 10 semantically closest prompts (any category, excluding answered), pick one at random |
| Adjacent | "Just beyond" | Fetch the 10 closest prompts from cultural categories *outside* the user's declared preferences, pick one at random |
| Unexpected | "Something else" | Fetch the 10 most semantically *distant* prompts from the `universal` category, pick one at random |

5. Each card excludes all prompts drawn earlier in the same session.

**Why top-10 with random selection:** Picking deterministically from the single closest match means "Draw again" always returns the same card — nothing changes between refreshes. Sampling randomly within the top 10 preserves semantic quality (all candidates are genuinely relevant) while giving variety on each draw.

**Why `universal` for the unexpected card:** Universal prompts (`"What do you do when you're afraid?"`) don't belong to any cultural domain — they are inherently outside a culturally-declared profile. Fetching the most distant within that pool ensures genuine surprise rather than a random universal question.

**Why one embedding, not three:** The profile string is fixed for the session. Embedding it once and reusing the vector for all three queries saves two OpenAI calls compared to per-card embedding.

---

## 10. Genre Preferences

### 10.1 Taxonomy

The genre taxonomy lives in `lib/tags.ts` as the single source of truth:

| Broad Category | Genres |
|---|---|
| Music | Indie & Alternative, Pop, Folk & Singer-Songwriter, Classical & Jazz, Electronic & Dance, Hip-Hop & R&B, World Music, Metal & Rock, Blues, Soul & Country |
| Films & Series | Cinema, Comfort TV, Anime |
| Books & Writing | Literary Fiction, Fantasy & Sci-Fi, Fanfiction |

Broad tags (`music`, `screen-stage`, `stories-words`) appear during onboarding. Genre tags (`indie-alternative`, `comfort-tv`, `literary-fiction`) are resolved after, on the preferences page.

### 10.2 Preferences Page (`/quiz/preferences`)

After onboarding, users can drill into genre-level preferences. For each broad cultural category they selected, the page shows its genres as selectable chips. Selecting genres updates `user_profiles.tags` to genre-level specificity (replacing the broad tag with individual genre tags).

The preferences page is accessible at any time via the main navigation — this was a deliberate product decision. Self-knowledge evolves; preferences should be easy to refine, not buried in a one-time setup flow.

### 10.3 Preferred Tone

After a user selects the same tone three times across reflections, their `preferred_tone` is recorded in `user_profiles`. On subsequent reflection screens, that tone is pre-selected. The user can always change it — the pre-selection is a hint, not a lock.

---

## 11. Schema Design

### Tables

**`user_profiles`**
```
clerk_id        TEXT PRIMARY KEY    — Clerk user ID, e.g. "user_2abc..."
tags            TEXT[]              — Genre tags from onboarding + preferences page
inner_life      TEXT[]              — Inner life tags surfaced by quiz
chapter         TEXT                — Life chapter (nullable)
preferred_tone  TEXT                — Auto-set after 3 uses of same tone (nullable)
created_at      TIMESTAMPTZ
```

**`prompts`**
```
id         UUID PRIMARY KEY
text       TEXT                — The question
follow_up  TEXT (nullable)     — Pre-written follow-up; non-null signals GOAT format
category   TEXT                — Source library: 'music', 'screen-stage', 'universal', etc.
tags       TEXT[]              — Genre tags: 'indie-alternative', 'literary-fiction', etc.
embedding  vector(1536)        — OpenAI text-embedding-3-small (card draw curation)
created_at TIMESTAMPTZ
```

**`reflections`**
```
id            UUID PRIMARY KEY
clerk_id      TEXT → user_profiles.clerk_id (CASCADE DELETE)
prompt_id     UUID → prompts.id
prompt_text   TEXT                — Denormalised for display without join
transcript    TEXT                — Raw user input
rendered_text TEXT                — AI-rendered version (or transcript if 'as-written')
tone          TEXT                — 'as-written' | 'poetic' | 'letter' | 'field-notes' | 'unfiltered'
embedding     vector(1536)        — For pattern surfacing
created_at    TIMESTAMPTZ
```

### Key Design Decisions

**Tags as `TEXT[]`, not a foreign key to a tags table.**
Adding a new passion tag requires zero schema changes — write new prompts with the new tag string and seed them. The taxonomy is a content concern, not a structural one. This was a deliberate choice to keep the system extensible without migrations.

**`is_goat` column was removed.**
Initially included as a boolean flag for GOAT-format prompts. Rejected because `follow_up IS NOT NULL` carries the same information with no redundancy. The UI reveals the follow-up after the first answer; it does not need a separate flag to know this.

**`prompt_text` is denormalised onto `reflections`.**
The prompt text a user reflected on should be readable in their gallery without always joining to the `prompts` table. Prompts could theoretically be edited or reworded over time; the reflection should preserve the exact question the user was given at the time they wrote their answer.

**`clerk_id` as the universal user key.**
Clerk generates this identifier. It is verified server-side on every request via `await auth()`. The client never asserts its own identity. This is the single thread connecting user identity across all tables.

### Indexes

```sql
-- HNSW indexes for approximate nearest-neighbour search
-- prompts: card draw curation | reflections: future pattern surfacing upgrade
CREATE INDEX ON prompts     USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON reflections USING hnsw (embedding vector_cosine_ops);
```

---

## 12. Pattern Surfacing

Pattern surfacing is live. Users access it from `/patterns` after saving at least 3 reflections.

**How it works (`app/api/patterns/route.ts`):**

1. User triggers "See patterns" explicitly.
2. Retrieve all of the user's reflections — `prompt_text` + `rendered_text` for each.
3. If fewer than 3 reflections exist, return a 422 and show a holding state. Below this threshold Claude cannot distinguish genuine patterns from over-interpreting a single response.
4. Pass all reflection texts directly to Claude with a system prompt: identify 2–3 recurring themes, write each as a `{ theme, observation }` pair addressed in second person to the user. Be specific — quote their exact words.
5. Claude returns structured JSON; the UI renders each pattern as a card.
6. Rate limited to 5 requests per user per 24 hours (Upstash Redis).

**Why direct synthesis rather than embedding clustering:**
At demo scale (< ~50 reflections per user), sending all reflection texts directly to Claude produces higher-quality patterns than an embedding clustering step would. Clustering adds a round-trip to pgvector to pre-filter content that Claude could read in full in one pass. Direct synthesis is simpler, faster, and more accurate for small corpora.

**Reflection embeddings are stored** at save time and indexed with HNSW. They are not used for pattern surfacing today but are available for a future upgrade where corpus size justifies retrieval-augmented pre-filtering.

---

## 13. Analytics

**Decision:** Vercel Analytics + PostHog, over Google Analytics.

**Why not Google Analytics:**
- GA4 sets cookies, requiring a consent banner under GDPR
- Data is processed on Google's US servers — additional legal complexity for an EU-facing product
- The data model (sessions, bounce rate) is optimised for marketing, not product behaviour

**Vercel Analytics (`@vercel/analytics`):**
- Cookieless — no consent banner required
- Measures Core Web Vitals and page views
- Privacy-preserving by design: no IP storage, no cross-site tracking
- Zero configuration: add `<Analytics />` to the root layout, done

**PostHog (`posthog-js`):**
- Open source, EU data residency (`https://eu.i.posthog.com`)
- Event-based product analytics — measures what users actually do, not just what pages they visit
- Free up to 1 million events per month

**Key events tracked:**

| Event | When | Properties |
|---|---|---|
| `onboarding_completed` | User finishes the 3-question quiz | `tags`, `chapter`, `inner_life` |
| `tone_selected` | User clicks "Write it" with a tone selected | `tone`, `promptId` |
| `reflection_saved` | User saves a reflection to gallery | `tone`, `promptId` |
| `draw_again` | User refreshes the card draw | — |

**Implementation note:** PostHog initialisation is guarded by the presence of `NEXT_PUBLIC_POSTHOG_KEY`. If the environment variable is not set (local development without a PostHog account), the provider mounts silently and all `posthog?.capture()` calls are no-ops. No errors, no broken UI.

---

## 14. Security

### Access Control: Application-Level Auth via Clerk (Demo)

For the demo, access control is enforced at the application layer. Every protected API route calls `await auth()` from Clerk server-side to retrieve the authenticated `clerk_id`. Every query against `reflections` and `user_profiles` explicitly filters by that `clerk_id`. The client never asserts its own identity.

**Why Postgres Row-Level Security (RLS) was not implemented at this stage:**

RLS was evaluated and deliberately deferred. The primary reason is an architectural tension with our database driver: `@neondatabase/serverless` uses HTTP-based connections rather than persistent TCP connections. RLS requires setting a session variable (`SET LOCAL app.current_user_id = '...'`) and running the protected query on the same connection. With HTTP-based connections, this requires wrapping every protected query in a transaction — a non-trivial restructuring of the database client that introduces complexity disproportionate to the demo's threat model.

**When to implement RLS:** As the product scales — multiple developers, multiple services connecting to the same database, or a public launch — RLS should be added as a second line of defence. At that point, the correct approach is to use the pg-compatible Neon driver (persistent TCP), set `app.current_user_id` per transaction, and define policies on `reflections` and `user_profiles` that enforce `clerk_id` matching at the database level regardless of which service is querying.

### Why Application-Level Encryption Was Not Implemented

The reflections table holds highly personal data. Encrypting it at the application level before storage was considered and rejected for one reason: **it breaks RAG**.

Pattern surfacing requires vector similarity search over `reflections.embedding`. That embedding is a semantic fingerprint of the reflection content. If we encrypt the text but store the embedding unencrypted, an attacker with database access can use the embedding to approximate the original text — making the encryption partially cosmetic. A fully consistent encryption model would require encrypting both text and embedding, which makes vector search impossible.

The correct production approach — per-user encryption keys with embeddings stored in a separate, access-controlled store — is out of scope for this demo. The controls in place (Neon encryption at rest, Clerk-verified server-side auth, HTTPS) provide appropriate protection for demo scale.

### Encryption at Rest

Neon encrypts all data at rest with AES-256. This is transparent — no application code required.

### Rate Limiting: Upstash Redis + `@upstash/ratelimit`

All AI routes are rate-limited per authenticated user using Upstash Redis with a sliding window algorithm. Sliding window means limits are rolling over any 24-hour period — fairer than a fixed midnight reset for users across time zones.

| Route | Limit | Applied |
|---|---|---|
| `POST /api/reflect/save` | 20 saves per user per 24h | ✓ `reflectionLimiter` |
| `POST /api/patterns` | 5 requests per user per 24h | ✓ `patternLimiter` |
| Card draw | 50 draws per user per 24h | ✗ `drawLimiter` defined but not yet wired to the explore page |

Note: `drawLimiter` exists in `lib/ratelimit.ts` but is not currently applied. The `/explore` page is a Server Component — adding rate limiting there requires wiring it into the page or extracting the draw into an API route.

Upstash was chosen over a Postgres counter because Redis is atomic under concurrent requests — two simultaneous calls cannot both pass the same rate limit check. A Postgres counter with a `SELECT` then `UPDATE` pattern has a race condition window that Redis eliminates. Upstash free tier (10,000 commands/day) is sufficient for demo scale.

### HTTPS

Enforced by Vercel on all deployments. Required for Clerk auth and for the Web Speech API (browser enforces HTTPS for microphone access).

---

## 15. What Is Deferred

| Feature | Status | Reason |
|---|---|---|
| Voice input (primary) | Web Speech API placeholder | Chrome/Edge only; acceptable for demo. Native iOS would be the production path. |
| Scrapbook / visual mode | Post-MVP | Core hypothesis (do people reflect deeply?) must be validated before investing in the aesthetic layer |
| Friend matching | Post-MVP | Requires user base; meaningless at demo scale |
| Shareable card export | Nice-to-have | Core loop validated first |
| Production Clerk instance | Post-demo | Development instance configured. Production instance needed before public launch. |
| Per-user encryption keys | Post-demo | Requires rethinking the RAG architecture; out of scope for demo |
| Postgres Row-Level Security | Post-demo | Deferred due to HTTP driver incompatibility; revisit when switching to persistent TCP connections at scale |

---

## 16. Cost Summary (Demo Phase)

| Service | Cost |
|---|---|
| Vercel (hosting) | $0 — Hobby tier |
| Vercel Analytics | $0 — included in all Vercel plans |
| Clerk (auth) | $0 — free up to 50K Monthly Retained Users |
| Neon Postgres + pgvector | $0 — free tier |
| Upstash Redis (rate limiting) | $0 — free tier (10K commands/day) |
| OpenAI embeddings | ~$0.00002 per prompt (one-time seed cost) |
| Claude API (tone rendering) | ~$0.003 per reflection |
| Claude API (pattern surfacing) | ~$0.005 per synthesis (deferred) |
| PostHog (product analytics) | $0 — free up to 1M events/month |

Total variable cost per active user per session: **~$0.003**. Negligible at demo scale.

---

*Architecture by Rocky & Lucy — Gherkin, 2026*
