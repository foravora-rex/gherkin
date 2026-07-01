import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Gherkin",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <header className="px-8 py-6">
        <Link
          href="/"
          className="text-sm text-[#466353] hover:text-stone-700 transition-colors"
        >
          ← Back
        </Link>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-8 py-12 text-stone-700 leading-relaxed">
        <p className="text-xs uppercase tracking-widest text-[#466353] mb-4">
          Legal
        </p>
        <h1 className="text-3xl font-light text-stone-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#466353] mb-12">
          Last updated: July 2026 &mdash;{" "}
          <span className="italic">
            Note: this policy has not been reviewed by a lawyer. It represents
            our genuine intent, but should not be treated as legal advice.
          </span>
        </p>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#466353] mb-4">
            Who we are
          </h2>
          <p className="text-sm mb-3">
            Gherkin is a personal project operated by Lucy Sasvari, based in
            Germany. For any privacy-related questions, contact:{" "}
            <a
              href="mailto:lucysasvari@gmail.com"
              className="text-stone-900 underline underline-offset-2"
            >
              lucysasvari@gmail.com
            </a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#466353] mb-4">
            What we collect and why
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-stone-800 mb-1">
                Account information
              </p>
              <p>
                Your email address and name, collected at sign-up via Clerk.
                Used to identify your account and allow you to log in. Legal
                basis: contract performance.
              </p>
            </div>
            <div>
              <p className="font-medium text-stone-800 mb-1">
                Your reflections
              </p>
              <p>
                The answers you write in response to prompts. Stored in our
                database and used to surface patterns in who you are over time.
                Legal basis: contract performance and your explicit consent when
                you choose to reflect.
              </p>
            </div>
            <div>
              <p className="font-medium text-stone-800 mb-1">
                Semantic embeddings
              </p>
              <p>
                A numerical representation of your reflection text, used to
                power our recommendation engine (RAG). These vectors cannot be
                meaningfully reversed into your original text. Legal basis:
                legitimate interest in providing the core feature.
              </p>
            </div>
            <div>
              <p className="font-medium text-stone-800 mb-1">
                Onboarding preferences
              </p>
              <p>
                Your answers during onboarding (e.g. topics of interest). Used
                to personalise your experience. Legal basis: contract
                performance.
              </p>
            </div>
            <div>
              <p className="font-medium text-stone-800 mb-1">
                Image search queries
              </p>
              <p>
                When you search for an image to attach to a reflection, the
                text you type is sent to four external image APIs (TMDB,
                Spotify, AniList, Unsplash) to retrieve results. These
                queries are not stored by us, but are processed by each
                provider under their own terms. If you select an image, its
                URL and attribution metadata are stored alongside your
                reflection. Legal basis: contract performance.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#466353] mb-4">
            Who we share your data with
          </h2>
          <div className="space-y-4 text-sm">
            <p>
              We use a small number of third-party services to run Gherkin. All
              are processors acting on our behalf.
            </p>
            <ul className="space-y-3 list-none pl-0">
              <li>
                <span className="font-medium text-stone-800">Clerk</span> — authentication and account management (US)
              </li>
              <li>
                <span className="font-medium text-stone-800">Neon</span> — database hosting, EU region (AWS eu-central-1, Frankfurt)
              </li>
              <li>
                <span className="font-medium text-stone-800">Vercel</span> — application hosting (US)
              </li>
              <li>
                <span className="font-medium text-stone-800">Anthropic</span> — AI text generation for tone rendering (US)
              </li>
              <li>
                <span className="font-medium text-stone-800">OpenAI</span> — semantic embeddings only, no reflection text stored (US)
              </li>
              <li>
                <span className="font-medium text-stone-800">Upstash</span> — rate limiting, request counts only (US)
              </li>
              <li>
                <span className="font-medium text-stone-800">PostHog</span> — product analytics, EU data residency (eu.posthog.com). Tracks anonymised usage events (e.g. which tone was selected, whether a reflection was saved). No reflection content is sent. Only activated for signed-in users.
              </li>
              <li>
                <span className="font-medium text-stone-800">Vercel Analytics</span> — cookieless page view analytics. No personal data, no cross-site tracking, no cookies.
              </li>
              <li>
                <span className="font-medium text-stone-800">TMDB</span> — image search for films, TV shows, and actors. Your search query is sent to their API. No account data is shared.
              </li>
              <li>
                <span className="font-medium text-stone-800">Spotify</span> — image search for artists. Your search query is sent to their API using client credentials (not linked to any Spotify account). No account data is shared.
              </li>
              <li>
                <span className="font-medium text-stone-800">AniList</span> — image search for anime characters and titles. Public API; no authentication required. Your search query is sent to their GraphQL endpoint.
              </li>
              <li>
                <span className="font-medium text-stone-800">Unsplash</span> — image search for mood and aesthetic photos. Your search query is sent to their API. If you select an Unsplash photo, photographer attribution is stored alongside your reflection and displayed as required by Unsplash&apos;s guidelines.
              </li>
            </ul>
            <p>
              Some of these services are based in the United States. Data
              transfers are covered by Standard Contractual Clauses (SCCs) or
              equivalent safeguards where required by GDPR.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#466353] mb-4">
            Your rights
          </h2>
          <div className="text-sm space-y-3">
            <p>Under GDPR, you have the right to:</p>
            <ul className="space-y-2 pl-4 list-disc">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>
                Request deletion of your data (&ldquo;right to be
                forgotten&rdquo;)
              </li>
              <li>
                Request a portable copy of your data in a common format
              </li>
              <li>Object to processing based on legitimate interest</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{" "}
              <a
                href="mailto:lucysasvari@gmail.com"
                className="text-stone-900 underline underline-offset-2"
              >
                lucysasvari@gmail.com
              </a>
              . We will respond within 30 days.
            </p>
            <p>
              You also have the right to lodge a complaint with the German data
              protection supervisory authority, the{" "}
              <span className="font-medium text-stone-800">
                Bundesbeauftragter für den Datenschutz und die
                Informationsfreiheit (BfDI)
              </span>
              .
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#466353] mb-4">
            Data retention
          </h2>
          <p className="text-sm">
            We retain your data for as long as your account is active. If you
            delete your account, we will delete your reflections, embeddings,
            and preferences within 30 days. Account data held by Clerk follows
            their own retention policy.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#466353] mb-4">
            Governing law
          </h2>
          <p className="text-sm">
            This policy is governed by the laws of the Federal Republic of
            Germany and the General Data Protection Regulation (GDPR).
          </p>
        </section>
      </main>
    </div>
  );
}
