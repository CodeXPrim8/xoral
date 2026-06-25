'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { isLegacyHeroSchemaError } from '@/lib/cms/hero-schema';
import { toast } from 'sonner';

type HeroSlide = {
  id: number;
  title_slug: string;
  subtitle: string;
  description: string;
  image_url: string;
  rating: number;
  category: string;
  sort_order: number;
  is_active: boolean;
};

const emptyForm = {
  title_slug: '',
  subtitle: '',
  description: '',
  image_url: '/posters/xoral-hero.svg',
  rating: 16,
  category: 'Drama',
  is_active: true,
};

export default function AdminHeroPage() {
  const [titles, setTitles] = useState<{ slug: string; title: string }[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [legacySchema, setLegacySchema] = useState(false);

  const loadSlides = useCallback(async () => {
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    let { data, error } = await supabase.from('cms_hero').select('*').order('sort_order').order('id');
    if (isLegacyHeroSchemaError(error)) {
      setLegacySchema(true);
      ({ data, error } = await supabase.from('cms_hero').select('*').order('id'));
    } else {
      setLegacySchema(false);
    }

    if (error) {
      toast.error(error.message);
      return;
    }
    setSlides((data as HeroSlide[]) ?? []);
  }, []);

  useEffect(() => {
    const supabase = createClientIfConfigured();
    supabase?.from('cms_titles').select('slug, title').order('title').then(({ data }) => setTitles(data ?? []));
    void loadSlides();
  }, [loadSlides]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(slide: HeroSlide) {
    setEditingId(slide.id);
    setForm({
      title_slug: slide.title_slug ?? '',
      subtitle: slide.subtitle ?? '',
      description: slide.description ?? '',
      image_url: slide.image_url,
      rating: slide.rating,
      category: slide.category,
      is_active: slide.is_active !== false,
    });
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const sort_order = slides.length > 0 ? Math.max(...slides.map((slide) => slide.sort_order ?? 0)) + 1 : 0;
    const body = {
      id: editingId ?? undefined,
      title_slug: form.title_slug || null,
      subtitle: form.subtitle || null,
      description: form.description || null,
      image_url: form.image_url,
      rating: form.rating,
      category: form.category,
      is_active: form.is_active,
      sort_order,
    };

    const response = await fetch('/api/admin/hero', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(result.error ?? 'Could not save hero slide');
    } else {
      toast.success(editingId ? 'Hero slide updated' : legacySchema ? 'Hero banner saved' : 'Hero slide added');
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    await loadSlides();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this hero slide?')) return;
    const response = await fetch(`/api/admin/hero?id=${id}`, { method: 'DELETE' });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) toast.error(result.error ?? 'Could not delete slide');
    else {
      toast.success('Hero slide deleted');
      await loadSlides();
    }
  }

  async function moveSlide(id: number, direction: 'up' | 'down') {
    const index = slides.findIndex((slide) => slide.id === id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= slides.length) return;

    const current = slides[index];
    const swap = slides[swapIndex];
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const { error: firstError } = await supabase
      .from('cms_hero')
      .update({ sort_order: swap.sort_order, updated_at: new Date().toISOString() })
      .eq('id', current.id);
    const { error: secondError } = await supabase
      .from('cms_hero')
      .update({ sort_order: current.sort_order, updated_at: new Date().toISOString() })
      .eq('id', swap.id);

    if (firstError || secondError) toast.error(firstError?.message ?? secondError?.message ?? 'Could not reorder');
    else await loadSlides();
  }

  async function toggleActive(slide: HeroSlide) {
    const response = await fetch('/api/admin/hero', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: slide.id,
        title_slug: slide.title_slug,
        subtitle: slide.subtitle,
        description: slide.description,
        image_url: slide.image_url,
        rating: slide.rating,
        category: slide.category,
        is_active: slide.is_active === false,
      }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) toast.error(result.error ?? 'Could not update slide');
    else await loadSlides();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Hero banners</h1>
          <p className="text-sm text-foreground/60 mt-1">
            Add multiple slides. The home page shuffles and rotates through active slides.
            {legacySchema && (
              <span className="block mt-1 text-amber-400/90">
                Legacy hero table detected — run RUN-IN-SUPABASE-hero-slides.sql for multiple slides. If saves fail with RLS, also run RUN-IN-SUPABASE-hero-rls.sql.
              </span>
            )}
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add slide
        </Button>
      </div>

      <div className="space-y-3">
        {slides.length === 0 ? (
          <div className="glass-card border rounded-xl p-8 text-center text-foreground/60">
            No hero slides yet. Add your first spotlight banner.
          </div>
        ) : (
          slides.map((slide, index) => {
            const linkedTitle = titles.find((title) => title.slug === slide.title_slug);
            return (
              <div key={slide.id} className="glass-card border rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                <img
                  src={slide.image_url}
                  alt=""
                  className="w-full sm:w-40 h-24 object-cover rounded-lg border border-border"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold truncate">{linkedTitle?.title ?? 'Untitled slide'}</h2>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        slide.is_active !== false ? 'bg-primary/20 text-primary' : 'bg-foreground/10 text-foreground/50'
                      }`}
                    >
                      {slide.is_active !== false ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  {slide.subtitle && <p className="text-sm text-foreground/70">{slide.subtitle}</p>}
                  <p className="text-xs text-foreground/50">
                    Order {(slide.sort_order ?? 0) + 1} · {slide.category} · {slide.rating}+
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => moveSlide(slide.id, 'up')} disabled={index === 0}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => moveSlide(slide.id, 'down')}
                    disabled={index === slides.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => toggleActive(slide)}>
                    {slide.is_active !== false ? 'Hide' : 'Show'}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => openEdit(slide)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleDelete(slide.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">{editingId ? 'Edit slide' : 'New slide'}</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium">Featured title</label>
            <select
              value={form.title_slug}
              onChange={(e) => setForm({ ...form, title_slug: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-input/30 px-3 text-sm"
            >
              <option value="">Select title</option>
              {titles.map((title) => (
                <option key={title.slug} value={title.slug}>
                  {title.title}
                </option>
              ))}
            </select>
          </div>
          <ImageUpload
            label="Hero image"
            value={form.image_url}
            folder="hero"
            onChange={(url) => setForm({ ...form, image_url: url })}
          />
          <Input
            placeholder="Subtitle"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full min-h-24 rounded-md border border-border bg-input/30 px-3 py-2 text-sm"
            placeholder="Description override (optional)"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              type="number"
              placeholder="Rating"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            />
            <Input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Show on home page
          </label>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add slide'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
