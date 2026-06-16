'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { migrateLocalStorageToSupabase } from '@/lib/user-data';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Add env vars to enable accounts.');
      setLoading(false);
      return;
    }

    const supabase = createClientIfConfigured()!;
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    await migrateLocalStorageToSupabase();
    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="glass-card border rounded-2xl p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-black">Sign in to XORAL</h1>
            <p className="text-foreground/60 mt-2">Access your list, follows, and community posts across devices.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 bg-input/50 border border-border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 bg-input/50 border border-border rounded-lg px-4 py-2"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full glass-button py-3 rounded-lg font-bold">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-sm text-center text-foreground/60">
            New to XORAL?{' '}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
