import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import BubbleField from "@/components/BubbleField";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    const rows = await sql`
      SELECT 1 FROM user_profiles
      WHERE clerk_id = ${userId} AND cardinality(tags) > 0
      LIMIT 1
    `;
    redirect(rows.length > 0 ? '/explore' : '/quiz');
  }

  return (
    <div className="relative isolate flex-1 flex flex-col overflow-hidden">
      <BubbleField />
      <header className="flex justify-end items-center px-8 py-6">
        <div className="flex gap-4">
          <SignInButton>
            <button className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="text-sm bg-[#85A16A] text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
              Get started
            </button>
          </SignUpButton>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-[#466353] mb-8">
          A gallery of self
        </p>

        <h1 className="text-6xl font-light tracking-tight text-stone-900 mb-6">
          Gherkin
        </h1>

        <p className="text-lg text-stone-500 mb-3 leading-relaxed">
          A gherkin is just a cucumber that went through something.
        </p>
        <p className="text-base text-[#466353] mb-12 leading-relaxed">
          Why you like something is more intriguing than what you like.
        </p>

        <div className="flex flex-col gap-2 mb-12 text-base text-stone-600 leading-relaxed">
          <p>Reflect on questions you&apos;ve never been asked.</p>
          <p>Build a permanent gallery of who you are.</p>
          <p>Discover the patterns.</p>
        </div>

        <SignUpButton>
          <button className="bg-[#85A16A] text-white px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity">
            Begin
          </button>
        </SignUpButton>
      </main>
    </div>
  );
}
