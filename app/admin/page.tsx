'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { seedCmsFromStatic } from '@/lib/cms/seed';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(false);

  async function importDemoData() {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase is not configured.');
      return;
    }

    const supabase = createClientIfConfigured();
    if (!supabase) {
      toast.error('Unable to connect to Supabase.');
      return;
    }

    setLoading(true);
    try {
      const result = await seedCmsFromStatic(supabase);
      toast.success(`Imported ${result.titles} titles, ${result.characters} AI Stars, ${result.creators} creators`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">XORAL Admin</h1>
        <p className="text-foreground/60 mt-2">
          Manage movies, AI Stars, creators, hero banner, and home page sections from one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { href: '/admin/titles', title: 'Titles', desc: 'Add movies & series, upload posters and video URLs' },
          { href: '/admin/characters', title: 'AI Stars', desc: 'Manage cast profiles and avatars' },
          { href: '/admin/creators', title: 'Creators', desc: 'Edit featured creators on the home page' },
          { href: '/admin/hero', title: 'Hero Banner', desc: 'Set the main spotlight title on the home page' },
          { href: '/admin/sections', title: 'Home Sections', desc: 'Choose what appears in each carousel row' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="glass-card border rounded-xl p-6 hover:bg-card/60 smooth-transition"
          >
            <h2 className="text-xl font-bold">{card.title}</h2>
            <p className="text-sm text-foreground/60 mt-2">{card.desc}</p>
          </Link>
        ))}
      </div>

      <div className="glass-card border rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold">First-time setup</h2>
        <p className="text-sm text-foreground/60">
          Import the current demo catalog into Supabase so you can edit it from here. Run{' '}
          <code className="text-xs bg-card px-1 py-0.5 rounded">supabase/cms-schema.sql</code> first if you have not already.
        </p>
        <Button onClick={importDemoData} disabled={loading}>
          {loading ? 'Importing...' : 'Import demo catalog'}
        </Button>
      </div>
    </div>
  );
}
