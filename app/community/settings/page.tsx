'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { SafeImage } from '@/components/SafeImage';
import { useAuth } from '@/components/AuthProvider';
import { getProfileForUser, updateCommunityProfile } from '@/lib/user-data';
import { uploadCommunityMedia } from '@/lib/community/upload';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function CommunitySettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/placeholder-user.jpg');
  const [bannerUrl, setBannerUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?next=/community/settings');
      return;
    }

    getProfileForUser(user).then((profile) => {
      if (profile) {
        setDisplayName(profile.displayName);
        setAvatarUrl(profile.avatarUrl);
        setBio(profile.bio ?? '');
        setBannerUrl(profile.bannerUrl ?? '');
      }
      setLoading(false);
    });
  }, [user, authLoading, router]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateCommunityProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl,
        bannerUrl: bannerUrl || undefined,
      });
      toast.success('Profile updated');
      if (user) router.push(`/community/u/${user.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File, kind: 'avatar' | 'banner') {
    try {
      const url = isSupabaseConfigured()
        ? await uploadCommunityMedia(file, 'image')
        : URL.createObjectURL(file);
      if (kind === 'avatar') setAvatarUrl(url);
      else setBannerUrl(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="xoral-page-narrow py-24 text-center text-foreground/60">Loading…</main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="xoral-page-narrow py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Link href={user ? `/community/u/${user.id}` : '/community/posts'} className="text-foreground/60 hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Community Settings</h1>
            <p className="text-sm text-foreground/60">Edit your public profile</p>
          </div>
        </div>

        <section className="glass-card border rounded-xl p-6 space-y-6">
          <h2 className="font-semibold">Profile</h2>

          <div className="flex flex-wrap items-center gap-4">
            <SafeImage
              src={avatarUrl}
              alt="Avatar"
              fallbackSrc="/placeholder-user.jpg"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
            />
            <label className="glass-button px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">
              Change avatar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage(file, 'avatar');
                }}
              />
            </label>
            <label className="glass-card border px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-card/60">
              Change banner
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage(file, 'banner');
                }}
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-md border border-border bg-input/30 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell the XORAL community about yourself…"
              className="w-full rounded-md border border-border bg-input/30 px-3 py-2 text-sm resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="glass-button px-6 py-2 rounded-lg font-semibold inline-flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save profile
          </button>
        </section>

        {user && (
          <Link
            href={`/community/u/${user.id}`}
            className="block text-center text-sm text-primary hover:underline"
          >
            View your public profile
          </Link>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
