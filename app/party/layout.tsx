import type { Metadata, Viewport } from 'next';
import { MOCK_EVENT } from '@/lib/party/mock-event';
import { PartyNav } from '@/components/party/PartyNav';
import { PartyFooter } from '@/components/party/PartyFooter';
import { FloatingCharacter } from '@/components/party/FloatingCharacter';
import { PartyHashScroll } from '@/components/party/PartyHashScroll';
import { PwaRegister } from '@/components/party/PwaRegister';
import './party.css';

export const metadata: Metadata = {
  title: 'Xoral Party — One Party. Two Worlds.',
  description: MOCK_EVENT.subtagline,
  applicationName: 'Xoral Party',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Xoral Party',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: `${MOCK_EVENT.name} ${MOCK_EVENT.volume}`,
    description: `${MOCK_EVENT.tagline} · 30 September 2026 · ${MOCK_EVENT.venue}, ${MOCK_EVENT.address} · ${MOCK_EVENT.city}`,
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050308',
  interactiveWidget: 'resizes-content',
};

export default function PartyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="xp-root">
      <PartyHashScroll />
      <PwaRegister />
      <PartyNav />
      <FloatingCharacter />
      <main>{children}</main>
      <PartyFooter />
    </div>
  );
}
