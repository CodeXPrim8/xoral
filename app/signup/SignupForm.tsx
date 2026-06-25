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
import { registerUser } from '@/lib/auth/register';
import { isSupabaseConfigured } from '@/lib/supabase/config';
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

const signupSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Display name must be at least 2 characters').max(40),
    email: z.string().trim().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[a-z]/, 'Include at least one lowercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState('');
  const pendingNavigation = useRef(false);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (pendingNavigation.current) {
        toast.success('Welcome to XORAL');
        pendingNavigation.current = false;
      }
      router.replace('/');
    }
  }, [authLoading, user, router]);

  async function handleSubmit(values: SignupValues) {
    setError('');

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Add env vars to enable accounts.');
      return;
    }

    const result = await registerUser({
      email: values.email,
      password: values.password,
      displayName: values.displayName,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      toast.success('Account created. Check your email to verify, then sign in.');
      router.replace('/login?registered=1');
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
              <h1 className="text-3xl font-black">Join XORAL</h1>
              <p className="text-foreground/60 mt-2">
                Create your free account and save your watchlist across devices.
              </p>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="you@email.com" {...field} />
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
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
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
                {form.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
          <p className="text-sm text-center text-foreground/60">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
