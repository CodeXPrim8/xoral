'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';
import type { ContentType } from '@/lib/types';
import { SafeImage } from './SafeImage';

interface ContentCardProps {
  id: string;
  slug?: string;
  title: string;
  image: string;
  rating?: number;
  type?: ContentType;
  isAiGenerated?: boolean;
  href?: string;
}

export function ContentCard({
  slug,
  title,
  image,
  rating,
  type = 'movie',
  isAiGenerated = false,
  href,
}: ContentCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const linkHref = href ?? (slug ? `/title/${slug}` : undefined);

  const cardContent = (
    <div
      className="group relative h-full overflow-hidden rounded cursor-pointer bg-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-[9/12] overflow-hidden bg-card">
        <SafeImage
          src={image}
          alt={title}
          fallbackSrc="/placeholder.jpg"
          className="w-full h-full object-cover smooth-transition group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isAiGenerated && <div className="xoral-badge">AI</div>}
          {type === 'series' && <div className="xoral-badge">Series</div>}
        </div>
      </div>

      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent p-3 flex flex-col justify-end">
          <div className="space-y-2">
            <h3 className="font-bold text-foreground text-sm line-clamp-2">{title}</h3>
            {rating && (
              <p className="text-xs text-foreground/70 flex items-center gap-1">
                ★ {rating}/10
              </p>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (slug) router.push(`/watch/${slug}`);
              }}
              className="w-full glass-button py-1.5 px-2 rounded text-xs font-bold flex items-center justify-center gap-1"
            >
              <Play className="w-3 h-3" />
              Play
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (!linkHref) {
    return cardContent;
  }

  return <Link href={linkHref}>{cardContent}</Link>;
}
