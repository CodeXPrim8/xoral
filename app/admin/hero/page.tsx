'use client';

import { useEffect, useState } from 'react';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';

export default function AdminHeroPage() {
  const [titles, setTitles] = useState<{ slug: string; title: string }[]>([]);
  const [form, setForm] = useState({
    title_slug: '',
    subtitle: '',
    description: '',
    image_url: '/posters/xoral-hero.svg',
    rating: 16,
    category: 'Drama',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClientIfConfigured();
    supabase?.from('cms_titles').select('slug, title').order('title').then(({ data }) => setTitles(data ?? []));
    supabase?.from('cms_hero').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({
          title_slug: data.title_slug ?? '',
          subtitle: data.subtitle ?? '',
          description: data.description ?? '',
          image_url: data.image_url,
          rating: data.rating,
          category: data.category,
        });
      }
    });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const { error } = await createClientIfConfigured()
      ?.from('cms_hero')
      .upsert({ id: 1, ...form, updated_at: new Date().toISOString() });
    if (error) toast.error(error.message);
    else toast.success('Hero banner saved');
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-black">Hero banner</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Featured title</label>
          <select
            value={form.title_slug}
            onChange={(e) => setForm({ ...form, title_slug: e.target.value })}
            className="w-full h-9 rounded-md border border-border bg-input/30 px-3 text-sm"
          >
            <option value="">Select title</option>
            {titles.map((title) => (
              <option key={title.slug} value={title.slug}>{title.title}</option>
            ))}
          </select>
        </div>
        <ImageUpload label="Hero image" value={form.image_url} folder="hero" onChange={(url) => setForm({ ...form, image_url: url })} />
        <Input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full min-h-24 rounded-md border border-border bg-input/30 px-3 py-2 text-sm"
          placeholder="Description override (optional)"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input type="number" placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
          <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save hero'}</Button>
      </form>
    </div>
  );
}
