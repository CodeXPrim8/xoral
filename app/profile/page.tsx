'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { Edit, LogOut, Settings, Shield } from 'lucide-react';
import { SafeImage } from '@/components/SafeImage';
import { useAuth } from '@/components/AuthProvider';
import { getProfileForUser, getProfileStatsForUser, signOut } from '@/lib/user-data';

function formatMemberSince(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<{
    email: string;
    displayName: string;
    avatarUrl: string;
    plan: string;
    role: string;
    memberSince?: string;
  } | null>(null);
  const [stats, setStats] = useState({ titlesSaved: 0, titlesWatched: 0, communityPosts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login?next=/profile');
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const [profileData, profileStats] = await Promise.all([
        getProfileForUser(user),
        getProfileStatsForUser(user.id),
      ]);
      if (cancelled) return;
      if (profileData) setProfile(profileData);
      setStats(profileStats);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading, router]);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="xoral-page-narrow py-24 text-center text-foreground/60">Loading your profile...</main>
        <MobileNav />
      </div>
    );
  }

  const email = profile?.email ?? user.email ?? '';
  const displayName = profile?.displayName ?? user.email?.split('@')[0] ?? 'Member';
  const avatar = profile?.avatarUrl ?? '/placeholder-user.jpg';
  const plan = profile?.plan ?? 'Free';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="xoral-page-narrow py-12 space-y-8">
        <div className="glass-card border rounded-2xl p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative">
              <SafeImage
                src={avatar}
                alt="User Avatar"
                fallbackSrc="/placeholder-user.jpg"
                className="w-32 h-32 rounded-2xl object-cover border-4 border-primary/30"
              />
              <button type="button" className="absolute bottom-2 right-2 p-2 glass-button rounded-full" aria-label="Edit avatar">
                <Edit className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{displayName}</h1>
              <p className="text-foreground/60 mb-4">{email}</p>
              <div className="flex gap-3 flex-wrap">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 glass-button px-6 py-2 rounded-lg font-semibold"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Titles Saved', value: stats.titlesSaved },
            { label: 'Titles Watched', value: stats.titlesWatched },
            { label: 'Community Posts', value: stats.communityPosts },
          ].map((stat) => (
            <div key={stat.label} className="glass-card border rounded-xl p-4 text-center space-y-2">
              <p className="text-3xl font-bold text-accent">{stat.value}</p>
              <p className="text-sm text-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="glass-card border rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Account
          </h2>

          <div className="space-y-4 divide-y divide-border/30">
            {[
              { label: 'Display Name', value: displayName },
              { label: 'Email Address', value: email },
              { label: 'Plan', value: plan },
              { label: 'Member Since', value: formatMemberSince(profile?.memberSince) },
            ].map((item) => (
              <div key={item.label} className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">{item.label}</p>
                  <p className="text-foreground font-semibold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card border-2 border-destructive/30 rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Sign Out</h2>
          <p className="text-foreground/60">End your session on this device.</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-destructive text-destructive rounded-lg font-semibold hover:bg-destructive/10 smooth-transition"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
