'use client';

import { ContentCard } from './ContentCard';
import type { ContentType } from '@/lib/types';

interface GridItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  rating?: number;
  type?: ContentType;
}

interface FeaturedGridProps {
  title: string;
  items: GridItem[];
}

export function FeaturedGrid({ title, items }: FeaturedGridProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
        {items.map((item) => (
          <ContentCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}
