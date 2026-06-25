'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { PublicProfileView } from '@/components/community/PublicProfileView';
import { getPublicProfile } from '@/lib/user-data';
import { useAuth } from '@/components/AuthProvider';
import type { PublicProfile } from '@/lib/types';

export default function CommunityUserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicProfile(userId)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />
      <main className="xoral-page-narrow py-8">
        {loading ? (
          <p className="text-center text-foreground/60 py-24">Loading profile…</p>
        ) : !profile ? (
          <p className="text-center text-foreground/60 py-24">Profile not found.</p>
        ) : (
          <PublicProfileView profile={profile} isOwner={user?.id === profile.id} />
        )}
      </main>
      <MobileNav />
    </div>
  );
}
