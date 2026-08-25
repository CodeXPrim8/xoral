'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SoundToggle } from '@/components/party/SoundToggle';
import { scrollToPartyHash } from '@/components/party/PartyHashScroll';

const links = [
  { href: '/party#tickets', label: 'Tickets' },
  { href: '/party#event', label: 'Event' },
  { href: '/party/gallery', label: 'Gallery' },
  { href: '/party#universe', label: 'Universe' },
  { href: '/party/faq', label: 'FAQ' },
];

export function PartyNav() {
  const pathname = usePathname();
  const checkout = pathname.startsWith('/party/checkout');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function onLinkClick(href: string) {
    setOpen(false);
    if (href.includes('#')) {
      scrollToPartyHash(href.split('#')[1]);
    }
  }

  if (checkout) {
    return (
      <header className="xp-nav bg-black/70 backdrop-blur-xl">
        <div className="xp-wrap xp-nav-inner">
          <Link href="/party" className="xp-display text-lg tracking-[0.2em]">
            XORAL PARTY
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className={`xp-nav pointer-events-none ${scrolled || open ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : ''}`}>
      <div className="xp-wrap xp-nav-inner pointer-events-auto">
        <Link href="/party" className="xp-display text-[0.95rem] sm:text-base md:text-xl tracking-[0.12em] md:tracking-[0.18em] shrink-0">
          XORAL PARTY
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => onLinkClick(link.href)} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
          <SoundToggle compact />
          <Link href="/party/tickets" className="xp-btn xp-btn-primary !w-auto !py-2.5 !px-5 !text-xs">
            Get Tickets
          </Link>
        </nav>
        <div className="flex md:hidden items-center gap-1">
          <SoundToggle compact />
          <button
            type="button"
            className="xp-icon-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden fixed inset-x-0 bottom-0 top-[calc(3.15rem+env(safe-area-inset-top,0px))] z-[60] bg-black/95 overflow-y-auto px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pointer-events-auto">
          <nav className="flex flex-col gap-1 pt-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-4 text-lg border-b border-white/10"
                onClick={() => onLinkClick(link.href)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/party/tickets" className="xp-btn xp-btn-primary mt-6" onClick={() => setOpen(false)}>
              Get Tickets
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
