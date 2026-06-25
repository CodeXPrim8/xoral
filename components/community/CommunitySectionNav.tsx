'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';

const sections = [
  { href: '/community/posts', label: 'Post' },
  { href: '/community/shorts', label: 'Shorts' },
] as const;

export function CommunitySectionNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between border-b border-border/40 px-4">
      <div className="flex items-center justify-center gap-1 flex-1">
        {sections.map((section) => {
          const active = pathname.startsWith(section.href);
          return (
            <Link
              key={section.href}
              href={section.href}
              className={`relative px-5 py-3 text-sm font-semibold smooth-transition ${
                active ? 'text-foreground' : 'text-foreground/50 hover:text-foreground/80'
              }`}
            >
              {section.label}
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
      <Link
        href="/community/settings"
        className="p-2 text-foreground/60 hover:text-foreground smooth-transition"
        title="Community settings"
      >
        <Settings className="w-5 h-5" />
      </Link>
    </div>
  );
}
