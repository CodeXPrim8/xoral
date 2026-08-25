'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function scrollToPartyHash(hash: string) {
  const id = hash.replace(/^#/, '');
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  window.setTimeout(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

export function PartyHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) scrollToPartyHash(window.location.hash);
  }, [pathname]);

  useEffect(() => {
    const onHash = () => scrollToPartyHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('vendor') || params.get('seller');
    if (ref) {
      try {
        sessionStorage.setItem('xoral-party-ref', ref);
        sessionStorage.setItem('xoral-party-ref-locked', '1');
      } catch { /* ignore */ }
    }
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return null;
}
