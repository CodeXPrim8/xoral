'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { Edit, LogOut, Settings } from 'lucide-react';
import { SafeImage } from '@/components/SafeImage';
import { useAuth } from '@/components/AuthProvider';
import { getProfile, signOut } from '@/lib/user-data';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    email: string;
    displayName: string;
    avatarUrl: string;
    plan: string;
  } | null>(null);

  useEffect(() => {
    if (isSupabaseConfigured() && user) {
      getProfile().then(setProfile);
    } else if (!isSupabaseConfigured()) {
      setProfile({
        email: 'guest@xoral.app',
        displayName: 'Guest',
        avatarUrl: '/creators/cr1.svg',
        plan: 'Free',
      });
    }
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.push('/');
    router.refresh();
  }

  const email = profile?.email ?? user?.email ?? 'guest@xoral.app';
  const displayName = profile?.displayName ?? 'Welcome Back';
  const avatar = profile?.avatarUrl ?? '/creators/cr1.svg';
  const plan = profile?.plan ?? 'Free';

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="glass-card border rounded-2xl p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative">
              <SafeImage
                src={avatar}
                alt="User Avatar"
                fallbackSrc="/placeholder-user.jpg"
                className="w-32 h-32 rounded-2xl object-cover border-4 border-primary/30"
              />
              <button type="button" className="absolute bottom-2 right-2 p-2 glass-button rounded-full">
                <Edit className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">{displayName}</h1>
              <p className="text-foreground/60 mb-4">{email}</p>
              <div className="flex gap-3 flex-wrap">
                <button type="button" className="glass-button px-6 py-2 rounded-lg font-semibold">
                  Edit Profile
                </button>
                <button type="button" className="glass-card px-6 py-2 rounded-lg font-semibold border hover:bg-card/50 smooth-transition">
                  Preferences
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Hours Watched', value: '124' },
            { label: 'Titles Saved', value: '42' },
            { label: 'Community Posts', value: '18' },
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
            Account Settings
          </h2>

          <div className="space-y-4 divide-y divide-border/30">
            {[
              { label: 'Email Address', value: email },
              { label: 'Subscription Plan', value: plan },
              { label: 'Billing Cycle', value: plan === 'Free' ? '—' : 'Monthly' },
              { label: 'Next Billing Date', value: plan === 'Free' ? '—' : 'July 15, 2026' },
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

        <div className="glass-card border rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Preferences</h2>

          <div className="space-y-4 divide-y divide-border/30">
            {[
              { label: 'Autoplay Next Episode', checked: true },
              { label: 'HD Streaming', checked: true },
              { label: 'Email Notifications', checked: false },
              { label: 'Data Usage Optimization', checked: true },
            ].map((pref) => (
              <div key={pref.label} className="py-4 flex items-center justify-between">
                <span className="text-foreground">{pref.label}</span>
                <input
                  type="checkbox"
                  defaultChecked={pref.checked}
                  className="w-5 h-5 accent-accent cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card border-2 border-destructive/30 rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Danger Zone</h2>
          <p className="text-foreground/60">These actions cannot be undone</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" className="flex-1 px-4 py-3 border-2 border-destructive/30 text-destructive rounded-lg font-semibold hover:bg-destructive/10 smooth-transition">
              Change Password
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-destructive text-destructive rounded-lg font-semibold hover:bg-destructive/10 smooth-transition"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
