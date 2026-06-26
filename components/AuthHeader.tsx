import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export default function AuthHeader() {
  return (
    <header className="flex justify-between items-center px-8 py-6">
      <Link href="/" className="text-sm font-light text-stone-900 tracking-tight">
        Gherkin
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="/explore" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          Explore
        </Link>
        <Link href="/gallery" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          My gallery
        </Link>
        <Link href="/quiz/preferences" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          Preferences
        </Link>
        <UserButton />
      </nav>
    </header>
  );
}
