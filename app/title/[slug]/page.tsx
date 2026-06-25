import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { TitleDetail } from '@/components/TitleDetail';
import { findTitleInCatalog } from '@/lib/cms/catalog';
import { getCatalog } from '@/lib/cms/server';

export const dynamic = 'force-dynamic';

export default async function TitlePage({ params }: { params: Promise<{ slug: string }> }) {
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
      <main className="xoral-page py-8">
        <TitleDetail slug={slug} />
      </main>
      <MobileNav />
    </div>
  );
}
