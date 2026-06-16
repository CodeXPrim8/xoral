import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { WatchPlayer } from '@/components/WatchPlayer';
import { getTitleBySlug } from '@/lib/catalog';

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = getTitleBySlug(slug);

  if (!title) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WatchPlayer slug={slug} />
      </main>
      <MobileNav />
    </div>
  );
}
