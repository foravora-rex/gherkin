import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ExplorePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <p className="text-xs uppercase tracking-widest text-stone-300 mb-6">
        Your gallery
      </p>
      <h2 className="text-3xl font-light text-stone-900 mb-4">
        Explore today&apos;s prompt.
      </h2>
      <p className="text-sm text-stone-400">
        Coming soon.
      </p>
    </div>
  );
}
