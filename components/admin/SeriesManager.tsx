'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoUpload } from '@/components/admin/VideoUpload';
import { toast } from 'sonner';

type SeasonRow = {
  id: string;
  season_number: number;
  title: string | null;
  description: string | null;
};

type EpisodeRow = {
  id: string;
  season_id: string;
  episode_number: number;
  title: string;
  description: string;
  video_url: string | null;
  trailer_url: string | null;
  duration_minutes: number | null;
  published: boolean;
};

type SeriesManagerProps = {
  titleId: string;
  showTitle: string;
};

function isSeasonsTableMissing(message: string) {
  return message.includes('cms_seasons') || message.includes('PGRST205');
}

export function SeriesManager({ titleId, showTitle }: SeriesManagerProps) {
  const [seasons, setSeasons] = useState<SeasonRow[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [newSeasonNumber, setNewSeasonNumber] = useState(1);

  const load = useCallback(async () => {
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const { data: seasonRows, error: seasonError } = await supabase
      .from('cms_seasons')
      .select('*')
      .eq('title_id', titleId)
      .order('season_number');

    if (seasonError) {
      if (isSeasonsTableMissing(seasonError.message)) {
        setSchemaMissing(true);
      } else {
        toast.error(seasonError.message);
      }
      setLoading(false);
      return;
    }

    setSchemaMissing(false);

    const seasonList = seasonRows ?? [];
    setSeasons(seasonList);

    if (seasonList.length) {
      const { data: episodeRows, error: episodeError } = await supabase
        .from('cms_episodes')
        .select('*')
        .in(
          'season_id',
          seasonList.map((s) => s.id)
        )
        .order('episode_number');

      if (episodeError) toast.error(episodeError.message);
      else setEpisodes(episodeRows ?? []);
    } else {
      setEpisodes([]);
    }

    setLoading(false);
  }, [titleId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (seasons.length) {
      setNewSeasonNumber(Math.max(...seasons.map((s) => s.season_number)) + 1);
    }
  }, [seasons]);

  async function addSeason() {
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const { data, error } = await supabase
      .from('cms_seasons')
      .insert({
        title_id: titleId,
        season_number: newSeasonNumber,
        title: `Season ${newSeasonNumber}`,
      })
      .select('*')
      .single();

    if (error) {
      if (isSeasonsTableMissing(error.message)) {
        setSchemaMissing(true);
        toast.error('Run supabase/episodes-schema.sql in Supabase SQL Editor first.');
      } else {
        toast.error(error.message);
      }
      return;
    }

    setSeasons((current) => [...current, data].sort((a, b) => a.season_number - b.season_number));
    setExpandedSeason(data.id);
    toast.success(`Season ${newSeasonNumber} added`);
    setNewSeasonNumber((n) => n + 1);
  }

  async function addEpisode(seasonId: string) {
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const seasonEpisodes = episodes.filter((e) => e.season_id === seasonId);
    const nextNum = seasonEpisodes.length
      ? Math.max(...seasonEpisodes.map((e) => e.episode_number)) + 1
      : 1;

    const { data, error } = await supabase
      .from('cms_episodes')
      .insert({
        season_id: seasonId,
        episode_number: nextNum,
        title: `Episode ${nextNum}`,
        description: '',
        published: true,
      })
      .select('*')
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    setEpisodes((current) => [...current, data]);
    toast.success(`Episode ${nextNum} added`);
  }

  function updateEpisodeLocal(id: string, patch: Partial<EpisodeRow>) {
    setEpisodes((current) => current.map((ep) => (ep.id === id ? { ...ep, ...patch } : ep)));
  }

  async function saveEpisode(episode: EpisodeRow) {
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const { error } = await supabase
      .from('cms_episodes')
      .update({
        title: episode.title.trim(),
        description: episode.description,
        video_url: episode.video_url || null,
        trailer_url: episode.trailer_url || null,
        duration_minutes: episode.duration_minutes,
        published: episode.published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', episode.id);

    if (error) toast.error(error.message);
    else toast.success(`Saved ${episode.title}`);
  }

  async function deleteEpisode(id: string) {
    if (!confirm('Delete this episode?')) return;
    const supabase = createClientIfConfigured();
    if (!supabase) return;
    const { error } = await supabase.from('cms_episodes').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      setEpisodes((current) => current.filter((e) => e.id !== id));
      toast.success('Episode deleted');
    }
  }

  async function deleteSeason(id: string) {
    if (!confirm('Delete this season and all its episodes?')) return;
    const supabase = createClientIfConfigured();
    if (!supabase) return;
    const { error } = await supabase.from('cms_seasons').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      setSeasons((current) => current.filter((s) => s.id !== id));
      setEpisodes((current) => current.filter((e) => e.season_id !== id));
      toast.success('Season deleted');
    }
  }

  if (loading) return <p className="text-foreground/60">Loading seasons…</p>;

  if (schemaMissing) {
    return (
      <div className="glass-card border border-primary/40 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-primary">Database setup required</h2>
        <p className="text-sm text-foreground/80">
          The <code className="text-xs bg-card px-1 py-0.5 rounded">cms_seasons</code> table does not exist yet.
          Seasons and episodes need an extra SQL script in Supabase.
        </p>
        <ol className="text-sm text-foreground/70 list-decimal list-inside space-y-2">
          <li>
            Open{' '}
            <a
              href="https://supabase.com/dashboard/project/jgopulswoleqsvjegllb/sql/new"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Supabase SQL Editor
            </a>
          </li>
          <li>
            Paste the full contents of <code className="text-xs bg-card px-1 py-0.5 rounded">supabase/episodes-schema.sql</code>{' '}
            (or re-run the seasons section at the bottom of <code className="text-xs bg-card px-1 py-0.5 rounded">cms-schema.sql</code>)
          </li>
          <li>Click <strong>Run</strong>, then refresh this page</li>
        </ol>
        <Button type="button" variant="outline" onClick={() => void load()}>
          I ran the SQL — retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Seasons & episodes</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Upload each episode for <span className="font-medium text-foreground">{showTitle}</span>
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link href={`/admin/titles/${titleId}`}>← Back to title</Link>
        </Button>
      </div>

      <div className="glass-card border rounded-xl p-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">New season number</label>
          <Input
            type="number"
            min={1}
            value={newSeasonNumber}
            onChange={(e) => setNewSeasonNumber(Number(e.target.value))}
            className="w-32"
          />
        </div>
        <Button type="button" onClick={addSeason}>
          Add season
        </Button>
      </div>

      {seasons.length === 0 ? (
        <p className="text-foreground/60 text-sm">No seasons yet. Add Season 1 to upload episodes.</p>
      ) : (
        <div className="space-y-4">
          {seasons.map((season) => {
            const seasonEpisodes = episodes
              .filter((e) => e.season_id === season.id)
              .sort((a, b) => a.episode_number - b.episode_number);
            const open = expandedSeason === season.id;

            return (
              <div key={season.id} className="glass-card border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-card/40 border-b border-border">
                  <button
                    type="button"
                    onClick={() => setExpandedSeason(open ? null : season.id)}
                    className="text-left font-semibold flex-1"
                  >
                    Season {season.season_number}
                    <span className="text-foreground/50 font-normal ml-2">
                      ({seasonEpisodes.length} episode{seasonEpisodes.length === 1 ? '' : 's'})
                    </span>
                  </button>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => addEpisode(season.id)}>
                      Add episode
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => deleteSeason(season.id)}>
                      Delete season
                    </Button>
                  </div>
                </div>

                {open && (
                  <div className="p-4 space-y-6">
                    {seasonEpisodes.length === 0 ? (
                      <p className="text-sm text-foreground/60">No episodes in this season yet.</p>
                    ) : (
                      seasonEpisodes.map((episode) => (
                        <div key={episode.id} className="border border-border/60 rounded-lg p-4 space-y-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-foreground/70">Episode #</label>
                              <Input
                                type="number"
                                min={1}
                                value={episode.episode_number}
                                onChange={(e) =>
                                  updateEpisodeLocal(episode.id, { episode_number: Number(e.target.value) })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-foreground/70">Episode title</label>
                              <Input
                                value={episode.title}
                                onChange={(e) => updateEpisodeLocal(episode.id, { title: e.target.value })}
                              />
                            </div>
                          </div>
                          <textarea
                            value={episode.description}
                            onChange={(e) => updateEpisodeLocal(episode.id, { description: e.target.value })}
                            className="w-full min-h-20 rounded-md border border-border bg-input/30 px-3 py-2 text-sm"
                            placeholder="Episode description"
                          />
                          <VideoUpload
                            label="Episode video"
                            folder="episodes"
                            value={episode.video_url ?? ''}
                            onChange={(url) => updateEpisodeLocal(episode.id, { video_url: url })}
                            hint="Upload MP4/WebM to XORAL storage or paste a streaming URL."
                          />
                          <VideoUpload
                            label="Episode trailer (optional)"
                            folder="trailers"
                            value={episode.trailer_url ?? ''}
                            onChange={(url) => updateEpisodeLocal(episode.id, { trailer_url: url })}
                          />
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={episode.published}
                              onChange={(e) => updateEpisodeLocal(episode.id, { published: e.target.checked })}
                            />
                            Published
                          </label>
                          <div className="flex gap-2">
                            <Button type="button" size="sm" onClick={() => saveEpisode(episode)}>
                              Save episode
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => deleteEpisode(episode.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
