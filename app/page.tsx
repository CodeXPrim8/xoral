'use client';

import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { HeroBanner } from '@/components/HeroBanner';
import { ContentCarousel } from '@/components/ContentCarousel';
import { FeaturedGrid } from '@/components/FeaturedGrid';
import { MeetTheCast } from '@/components/CharacterDetail';
import { SafeImage } from '@/components/SafeImage';
import { trendingMovies, continueWatching, aiMovies, heroContent, creators } from '@/lib/data';
import { useEffect, useState } from 'react';
import { isCreatorFollowed, toggleCreatorFollow, requireAuthForAction } from '@/lib/user-data';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { toast } from 'sonner';

export default function Page() {
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const followed = await Promise.all(
        creators.map(async (creator) => ((await isCreatorFollowed(creator.id)) ? creator.id : null))
      );
      setFollowedCreators(followed.filter(Boolean) as string[]);
    }
    load();
  }, []);

  return (
    <div className="bg-background text-foreground">
      <Header />

      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <HeroBanner {...heroContent} />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6 pb-24 md:pb-8">
        <ContentCarousel
          title="Your Next Watch"
          items={continueWatching}
          viewAllHref="/library"
        />

        <ContentCarousel
          title="Trending Now"
          subtitle="What everyone is watching right now"
          items={trendingMovies}
          viewAllHref="/movies"
        />

        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">AI Generated Originals</h2>
            <p className="text-foreground/60">Experience cinema created by artificial intelligence on XORAL</p>
          </div>
          <ContentCarousel items={aiMovies} title="" viewAllHref="/ai-stars" />
        </section>

        <MeetTheCast />

        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Featured Creators</h2>
            <p className="text-foreground/60">Follow the visionaries behind your favorite XORAL content</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {creators.map((creator) => {
              const isFollowed = followedCreators.includes(creator.id);
              return (
                <div
                  key={creator.id}
                  className="glass-card p-4 rounded-xl border text-center hover:bg-card/60 smooth-transition"
                >
                  <SafeImage
                    src={creator.image}
                    alt={creator.name}
                    fallbackSrc="/placeholder-user.jpg"
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-primary/30"
                  />
                  <h3 className="font-bold text-foreground">{creator.name}</h3>
                  <p className="text-xs text-foreground/60 mt-1">{creator.specialization}</p>
                  <p className="text-sm text-accent mt-1">{creator.followers}</p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (isSupabaseConfigured()) {
                        const allowed = await requireAuthForAction('/');
                        if (!allowed) {
                          toast.info('Sign in to follow creators on XORAL');
                          return;
                        }
                      }
                      const next = await toggleCreatorFollow(creator.id);
                      setFollowedCreators(next.creators);
                    }}
                    className="mt-3 w-full glass-button py-2 rounded-lg text-sm font-semibold"
                  >
                    {isFollowed ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <FeaturedGrid title="More to Explore" items={trendingMovies.slice(0, 8)} />
      </main>

      <MobileNav />
    </div>
  );
}
