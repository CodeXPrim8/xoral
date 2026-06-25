'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { VideoUpload } from '@/components/admin/VideoUpload';
import { CONTENT_GENRES } from '@/lib/cms/genres';
import { wireNewTitleToHome } from '@/lib/cms/home-sections';
import { slugifyTitle } from '@/lib/cms/slug';
import { toast } from 'sonner';

type TitleFormProps = {
  titleId?: string;
};

export function TitleForm({ titleId }: TitleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(titleId));
  const [saving, setSaving] = useState(false);
  const [characters, setCharacters] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [form, setForm] = useState({
    slug: '',
    title: '',
    image_url: '/placeholder.jpg',
    rating: 8,
    type: 'movie',
    description: '',
    genre: 'Drama',
    maturity_rating: 13,
    is_ai_generated: false,
    subtitle: '',
    trailer_url: '',
    video_url: '',
    published: true,
    cast_ids: [] as string[],
  });

  const isSeries = form.type === 'series';

  useEffect(() => {
    async function load() {
      const supabase = createClientIfConfigured();
      if (!supabase) return;

      const { data: characterRows } = await supabase
        .from('cms_characters')
        .select('id, slug, name')
        .order('name');
      setCharacters(characterRows ?? []);

      if (!titleId) {
        setLoading(false);
        return;
      }

      const { data: row, error } = await supabase
        .from('cms_titles')
        .select('*, cms_title_cast(character_id)')
        .eq('id', titleId)
        .single();

      if (error || !row) {
        toast.error('Title not found');
        setLoading(false);
        return;
      }

      setForm({
        slug: row.slug,
        title: row.title,
        image_url: row.image_url,
        rating: Number(row.rating),
        type: row.type,
        description: row.description,
        genre: row.genre,
        maturity_rating: row.maturity_rating,
        is_ai_generated: row.is_ai_generated,
        subtitle: row.subtitle ?? '',
        trailer_url: row.trailer_url ?? '',
        video_url: row.video_url ?? '',
        published: row.published,
        cast_ids: row.cms_title_cast?.map((c: { character_id: string }) => c.character_id) ?? [],
      });
      setLoading(false);
    }

    load();
  }, [titleId]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleCast(characterId: string) {
    setForm((current) => ({
      ...current,
      cast_ids: current.cast_ids.includes(characterId)
        ? current.cast_ids.filter((id) => id !== characterId)
        : [...current.cast_ids, characterId],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const supabase = createClientIfConfigured();
    if (!supabase) {
      toast.error('Supabase not configured');
      setSaving(false);
      return;
    }

    const payload = {
      slug: slugifyTitle(form.slug || form.title),
      title: form.title.trim(),
      image_url: form.image_url,
      rating: form.rating,
      type: form.type,
      description: form.description,
      genre: form.genre,
      maturity_rating: form.maturity_rating,
      is_ai_generated: form.is_ai_generated,
      subtitle: form.subtitle || null,
      trailer_url: isSeries ? form.trailer_url || null : form.trailer_url || null,
      video_url: isSeries ? null : form.video_url || null,
      published: form.published,
      updated_at: new Date().toISOString(),
    };

    try {
      let id = titleId;
      if (titleId) {
        const { error } = await supabase.from('cms_titles').update(payload).eq('id', titleId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('cms_titles').insert(payload).select('id').single();
        if (error) throw error;
        id = data.id;

        if (form.published) {
          await wireNewTitleToHome(supabase, id, {
            slug: payload.slug,
            type: payload.type,
            isAiGenerated: payload.is_ai_generated,
            published: payload.published,
          });
        }
      }

      await supabase.from('cms_title_cast').delete().eq('title_id', id);
      if (form.cast_ids.length) {
        const { error } = await supabase.from('cms_title_cast').insert(
          form.cast_ids.map((character_id) => ({ title_id: id, character_id }))
        );
        if (error) throw error;
      }

      toast.success(titleId ? 'Title updated' : 'Title created');

      if (isSeries && id) {
        router.push(`/admin/titles/${id}/episodes`);
      } else {
        router.push('/admin/titles');
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-foreground/60">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((current) => ({
                ...current,
                title,
                ...(!titleId && !current.slug.trim() ? { slug: slugifyTitle(title) } : {}),
              }));
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Slug (URL)</label>
          <Input
            value={form.slug}
            onChange={(e) => update('slug', slugifyTitle(e.target.value))}
            placeholder="my-new-movie"
            required
          />
        </div>
      </div>

      <ImageUpload
        label="Poster image"
        value={form.image_url}
        folder="posters"
        onChange={(url) => update('image_url', url)}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="w-full min-h-28 rounded-md border border-border bg-input/30 px-3 py-2 text-sm"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Content type</label>
          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-input/30 px-3 text-sm"
          >
            <option value="movie">Movie (full film)</option>
            <option value="series">Series (seasons & episodes)</option>
            <option value="ai">AI Original</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Genre</label>
          <select
            value={form.genre}
            onChange={(e) => update('genre', e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-input/30 px-3 text-sm"
          >
            {CONTENT_GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Rating (0-10)</label>
          <Input
            type="number"
            step="0.1"
            value={form.rating}
            onChange={(e) => update('rating', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Maturity rating</label>
          <Input
            type="number"
            value={form.maturity_rating}
            onChange={(e) => update('maturity_rating', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Subtitle (optional)</label>
          <Input value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)} />
        </div>
      </div>

      {isSeries ? (
        <div className="glass-card border rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium">Series video</p>
          <p className="text-xs text-foreground/60">
            Upload episodes per season after saving. You can set a show-level trailer for the hero banner.
          </p>
          <VideoUpload
            label="Show trailer (optional)"
            folder="trailers"
            value={form.trailer_url}
            onChange={(url) => update('trailer_url', url)}
          />
          {titleId && (
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/titles/${titleId}/episodes`}>Manage seasons & episodes</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <VideoUpload
            label="Full movie video"
            folder="movies"
            value={form.video_url}
            onChange={(url) => update('video_url', url)}
            hint="Upload to XORAL (MP4/WebM, up to 500MB) or paste a streaming URL."
          />
          <VideoUpload
            label="Trailer (optional)"
            folder="trailers"
            value={form.trailer_url}
            onChange={(url) => update('trailer_url', url)}
          />
        </>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Cast (AI Stars)</label>
        <div className="grid gap-2 md:grid-cols-2">
          {characters.map((character) => (
            <label key={character.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.cast_ids.includes(character.id)}
                onChange={() => toggleCast(character.id)}
              />
              {character.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_ai_generated}
            onChange={(e) => update('is_ai_generated', e.target.checked)}
          />
          AI Generated Original
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update('published', e.target.checked)}
          />
          Published
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : titleId ? 'Save changes' : 'Create title'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/titles">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
