'use client';

import { useEffect, useRef, useState } from 'react';
import type { CommunityPost } from '@/lib/types';
import { CommunityMediaPlayer } from './CommunityMediaPlayer';

/** Only loads community media when the card scrolls near the viewport (saves mobile bandwidth). */
export function LazyCommunityMedia({ post }: { post: CommunityPost }) {
  const ref = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px', threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      <CommunityMediaPlayer post={post} active={nearViewport} shouldLoad={nearViewport} />
    </div>
  );
}
