'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentCard } from './ContentCard';
import type { ContentType } from '@/lib/types';

interface CarouselItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  rating?: number;
  type?: ContentType;
}

interface ContentCarouselProps {
  title: string;
  subtitle?: string;
  items: CarouselItem[];
  viewAllHref?: string;
}

export function ContentCarousel({ title, subtitle, items, viewAllHref }: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      const newScroll =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="space-y-3 md:space-y-4 xoral-carousel-bleed">
      {title && (
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-xs md:text-sm text-foreground/60 mt-1">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} className="text-xs md:text-sm text-foreground/70 hover:text-foreground smooth-transition font-semibold">
              View All
            </Link>
          )}
        </div>
      )}

      <div className="relative group">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute -left-6 md:-left-8 top-1/2 -translate-y-1/2 z-10 p-2 hover:bg-foreground/20 rounded-full smooth-transition opacity-0 group-hover:opacity-100 bg-gradient-to-r from-background to-transparent"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-2 md:gap-3 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-48 xl:w-52 2xl:w-56">
              <ContentCard {...item} />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute -right-6 md:-right-8 top-1/2 -translate-y-1/2 z-10 p-2 hover:bg-foreground/20 rounded-full smooth-transition opacity-0 group-hover:opacity-100 bg-gradient-to-l from-background to-transparent"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        )}
      </div>
    </section>
  );
}
