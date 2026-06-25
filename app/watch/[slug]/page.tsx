import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { WatchPlayer } from '@/components/WatchPlayer';
import { findTitleInCatalog } from '@/lib/cms/catalog';
import { getCatalog } from '@/lib/cms/server';

export const dynamic = 'force-dynamic';

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug).trim();
  const catalog = await getCatalog();
  const title = findTitleInCatalog(catalog, slug);

  if (!title) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<p className="text-foreground/60">Loading player…</p>}>
          <WatchPlayer slug={slug} />
        </Suspense>
      </main>
      <MobileNav />
    </div>
  );
}
