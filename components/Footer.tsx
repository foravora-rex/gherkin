import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 px-8 flex flex-col items-center gap-3">
      <p className="text-xs text-stone-300">Private by default. Yours alone.</p>
      <nav className="flex gap-6">
        <Link
          href="/privacy"
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Terms of Service
        </Link>
      </nav>
    </footer>
  );
}
