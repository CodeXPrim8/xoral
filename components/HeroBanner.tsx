'use client';

import Link from 'next/link';
import { Info, Play } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface HeroBannerProps {
  slug: string;
  title: string;
  description: string;
  rating: number;
  category: string;
  image: string;
  subtitle?: string;
}

export function HeroBanner({ slug, title, description, rating, image, subtitle }: HeroBannerProps) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full h-[100vh] md:h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <SafeImage src={image} alt={title} fallbackSrc="/posters/xoral-hero.svg" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background from-0% via-background/70 via-40% to-transparent to-100%" />
        </div>

        <div className="relative w-full h-full flex items-center">
          <div className="w-full md:w-1/2 px-6 md:px-12 lg:px-16 py-12 md:py-0 flex flex-col justify-center space-y-3 md:space-y-6">
            {subtitle && (
              <p className="text-base md:text-lg font-semibold text-foreground">{subtitle}</p>
            )}

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight" style={{ color: '#F4D03F' }}>
              {title}
            </h1>

            <p className="text-sm md:text-base text-foreground leading-relaxed max-w-xl line-clamp-4">
              {description}
            </p>

            <div className="flex items-center gap-3 pt-4 md:pt-6">
              <Link
                href={`/watch/${slug}`}
                className="flex items-center justify-center gap-2 bg-white text-background px-8 md:px-10 py-2.5 md:py-3 rounded text-sm md:text-base font-bold hover:bg-white/80 smooth-transition"
              >
                <Play className="w-5 h-5 fill-current" />
                Play
              </Link>
              <Link
                href={`/title/${slug}`}
                className="flex items-center justify-center gap-2 bg-foreground/40 hover:bg-foreground/50 text-foreground px-8 md:px-10 py-2.5 md:py-3 rounded text-sm md:text-base font-bold smooth-transition"
              >
                <Info className="w-5 h-5" />
                More Info
              </Link>
            </div>
          </div>

          <div className="absolute bottom-8 md:bottom-12 right-6 md:right-12 lg:right-16 text-foreground font-bold text-2xl md:text-3xl border-2 border-foreground px-4 md:px-5 py-2 md:py-3">
            {rating}+
          </div>
        </div>
      </div>
    </section>
  );
}
