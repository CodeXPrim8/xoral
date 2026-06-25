'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { MediaStudio } from '@/components/community/MediaStudio';

export default function CreateShortPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />
      <main className="xoral-page-narrow py-8">
        <MediaStudio
          postKind="short"
          onPublished={() => router.push('/community/shorts')}
          onCancel={() => router.back()}
        />
      </main>
      <MobileNav />
    </div>
  );
}
