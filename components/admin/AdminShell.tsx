'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { XoralLogo } from '@/components/XoralLogo';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/titles', label: 'Titles' },
  { href: '/admin/characters', label: 'AI Stars' },
  { href: '/admin/creators', label: 'Creators' },
  { href: '/admin/hero', label: 'Hero Banner' },
  { href: '/admin/sections', label: 'Home Sections' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40">
        <div className="xoral-page flex h-14 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <XoralLogo size="sm" showWordmark />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Admin</span>
          </Link>
          <Link href="/" className="text-sm text-foreground/70 hover:text-foreground">
            View site
          </Link>
        </div>
      </header>
      <div className="xoral-page py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block rounded-lg px-3 py-2 text-sm font-medium smooth-transition',
                pathname === link.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:bg-card hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
