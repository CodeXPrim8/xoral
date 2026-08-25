import Link from 'next/link';

const columns = [
  {
    title: 'Night',
    links: [
      { href: '/party/tickets', label: 'Tickets' },
      { href: '/party#event', label: 'Events' },
      { href: '/party/gallery', label: 'Gallery' },
      { href: '/party#universe', label: 'Xoral Universe' },
    ],
  },
  {
    title: 'Info',
    links: [
      { href: '/party/faq', label: 'FAQ' },
      { href: '/party/contact', label: 'Contact' },
      { href: '/party/crew', label: 'Join the movement' },
      { href: '/party/my', label: 'My Xoral' },
      { href: '/party/sales', label: 'Sales team' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/party/terms', label: 'Terms' },
      { href: '/party/privacy', label: 'Privacy' },
      { href: '/party/refund', label: 'Refund Policy' },
    ],
  },
];

export function PartyFooter() {
  return (
    <footer className="border-t border-white/10 pt-16 pb-[calc(var(--xp-sticky-h)+2.5rem)]">
      <div className="xp-wrap grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="xp-display text-2xl tracking-[0.18em]">XORAL PARTY</p>
          <p className="mt-3 text-white/70 max-w-sm">30 September 2026 · Ambiance, Ikeja. One party. Two worlds.</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/50">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a>
            <a href="https://x.com" target="_blank" rel="noreferrer">X</a>
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="xp-kicker mb-4">{col.title}</p>
            <ul className="space-y-2 text-sm text-white/70">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white inline-block py-2 min-h-11">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="xp-wrap mt-14 text-xs tracking-[0.22em] uppercase text-white/40">
        A Xoral Studios Experience
      </p>
    </footer>
  );
}
