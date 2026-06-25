'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { migrateLocalStorageToSupabase } from '@/lib/user-data';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { XoralLogo } from '@/components/XoralLogo';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const justRegistered = searchParams.get('registered') === '1';
  const [error, setError] = useState('');
  const pendingNavigation = useRef(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!authLoading && user?.id) {
      if (pendingNavigation.current) {
        toast.success('Welcome back to XORAL');
        pendingNavigation.current = false;
        void migrateLocalStorageToSupabase();
      }
      router.replace('/');
    }
  }, [authLoading, user?.id, router]);

  async function handleSubmit(values: LoginValues) {
    setError('');

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Add env vars to enable accounts.');
      return;
    }

    const supabase = createClientIfConfigured();
    if (!supabase) {
      setError('Unable to connect to Supabase. Please check environment variables.');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword(values);
    if (signInError) {
      setError(
        signInError.message === 'Failed to fetch'
          ? 'Could not reach XORAL accounts. Check your connection and try again.'
          : signInError.message
      );
      return;
    }

    pendingNavigation.current = true;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />
      <main className="xoral-page-narrow py-16">
        <div className="glass-card border rounded-2xl p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <XoralLogo size="lg" glow />
            <div>
              <h1 className="text-3xl font-black">Sign in to XORAL</h1>
              <p className="text-foreground/60 mt-2">
                Access your list, follows, and community posts across devices.
              </p>
            </div>
          </div>
          {justRegistered && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground/90">
              Account created. Check your email for a verification link, then sign in below.
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || authLoading}
                className="w-full h-11 font-bold"
              >
                {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </Form>
          <p className="text-sm text-center text-foreground/60">
            New to XORAL?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
