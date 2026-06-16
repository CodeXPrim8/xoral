import Link from 'next/link';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
        <p className="text-primary text-sm font-semibold uppercase tracking-widest">404</p>
        <h1 className="text-4xl md:text-5xl font-black">This page isn&apos;t on XORAL</h1>
        <p className="text-foreground/60 text-lg">
          The title or AI Star you&apos;re looking for doesn&apos;t exist in our catalog yet.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link href="/" className="glass-button px-6 py-3 rounded-lg font-semibold">
            Back to Home
          </Link>
          <Link href="/search" className="glass-card border px-6 py-3 rounded-lg font-semibold hover:bg-card/60 smooth-transition">
            Search XORAL
          </Link>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
