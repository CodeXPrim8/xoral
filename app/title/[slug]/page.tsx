import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { TitleDetail } from '@/components/TitleDetail';
import { getTitleBySlug } from '@/lib/catalog';

export default async function TitlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = getTitleBySlug(slug);

  if (!title) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TitleDetail slug={slug} />
      </main>
      <MobileNav />
    </div>
  );
}
