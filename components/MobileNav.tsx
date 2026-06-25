'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, LayoutGrid, Search, Users } from 'lucide-react';

type NavItem = {
  href: string;
  icon: typeof LayoutGrid;
  label: string | null;
  matchPrefix?: string;
};

const navItems: NavItem[] = [
  { href: '/browse', icon: LayoutGrid, label: 'Browse', matchPrefix: '/browse' },
  { href: '/search', icon: Search, label: null },
  { href: '/library', icon: Bookmark, label: 'My List' },
  { href: '/community/posts', icon: Users, label: 'Community', matchPrefix: '/community' },
];

function isActive(pathname: string, href: string, matchPrefix?: string) {
  if (matchPrefix) {
    return pathname === href || pathname.startsWith(matchPrefix) || pathname === '/movies';
  }
  return pathname === href;
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label, matchPrefix }) => {
          const active = isActive(pathname, href, matchPrefix);
          const iconOnly = label === null;

          return (
            <Link
              key={href}
              href={href}
              aria-label={iconOnly ? 'Search' : label ?? undefined}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full smooth-transition ${
                active ? 'text-primary' : 'text-foreground/60 hover:text-foreground/80'
              }`}
            >
              <Icon className={iconOnly ? 'w-6 h-6' : 'w-5 h-5'} strokeWidth={active ? 2.5 : 2} />
              {!iconOnly && <span className="text-[11px] font-medium leading-none">{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
