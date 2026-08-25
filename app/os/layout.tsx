import type { Viewport } from 'next';
import '../party/party.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
  interactiveWidget: 'resizes-content',
};

export default function OsLayout({ children }: { children: React.ReactNode }) {
  return <div className="cx-os-page">{children}</div>;
}
