'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';

type CharacterFormProps = { characterId?: string };

export function CharacterForm({ characterId }: CharacterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(characterId));
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    slug: '',
    name: '',
    gender: 'female',
    age: '',
    nationality: '',
    height: '',
    eyes: '',
    hair: '',
    personality: '',
    style: '',
    voice: '',
    profession: '',
    skin_color: '',
    description: '',
    image_url: '/placeholder-user.jpg',
    published: true,
  });

  useEffect(() => {
    async function load() {
      if (!characterId) {
        setLoading(false);
        return;
      }
      const supabase = createClientIfConfigured();
      if (!supabase) return;
      const { data, error } = await supabase.from('cms_characters').select('*').eq('id', characterId).single();
      if (error || !data) {
        toast.error('Character not found');
        setLoading(false);
        return;
      }
      setForm({
        slug: data.slug,
        name: data.name,
        gender: data.gender,
        age: data.age?.toString() ?? '',
        nationality: data.nationality,
        height: data.height,
        eyes: data.eyes,
        hair: data.hair,
        personality: data.personality,
        style: data.style,
        voice: data.voice,
        profession: data.profession,
        skin_color: data.skin_color,
        description: data.description,
        image_url: data.image_url,
        published: data.published,
      });
      setLoading(false);
    }
    load();
  }, [characterId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const payload = {
      ...form,
      age: form.age ? Number(form.age) : null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (characterId) {
        const { error } = await supabase.from('cms_characters').update(payload).eq('id', characterId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cms_characters').insert(payload);
        if (error) throw error;
      }
      toast.success('AI Star saved');
      router.push('/admin/characters');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-foreground/60">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Slug</label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </div>
      </div>
      <ImageUpload label="Avatar" value={form.image_url} folder="avatars" onChange={(url) => setForm({ ...form, image_url: url })} />
      <div className="space-y-2">
        <label className="text-sm font-medium">Profession</label>
        <Input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full min-h-24 rounded-md border border-border bg-input/30 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(['nationality', 'height', 'eyes', 'hair', 'personality', 'style', 'voice', 'skin_color'] as const).map((field) => (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium capitalize">{field.replace('_', ' ')}</label>
            <Input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
          </div>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        Published
      </label>
      <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save AI Star'}</Button>
    </form>
  );
}
