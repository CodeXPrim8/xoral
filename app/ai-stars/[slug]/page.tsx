import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { CharacterDetail } from '@/components/CharacterDetail';
import { getCatalog } from '@/lib/cms/server';

export default async function CharacterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const character = catalog.characters.find((item) => item.slug === slug);

  if (!character) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />
      <main className="xoral-page py-8">
        <CharacterDetail slug={slug} />
      </main>
      <MobileNav />
    </div>
  );
}
