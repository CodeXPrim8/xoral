'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';

export default function AdminCreatorsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({
    slug: '',
    name: '',
    image_url: '/placeholder-user.jpg',
    followers: '0',
    specialization: '',
    published: true,
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = createClientIfConfigured();
    const { data } = await supabase?.from('cms_creators').select('*').order('sort_order');
    setRows(data ?? []);
  }

  async function saveCreator(event: React.FormEvent) {
    event.preventDefault();
    const supabase = createClientIfConfigured();
    if (!supabase) return;
    const { error } = await supabase.from('cms_creators').insert({ ...form, sort_order: rows.length });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Creator added');
    setForm({ slug: '', name: '', image_url: '/placeholder-user.jpg', followers: '0', specialization: '', published: true });
    load();
  }

  async function removeCreator(id: string) {
    if (!confirm('Delete creator?')) return;
    await createClientIfConfigured()?.from('cms_creators').delete().eq('id', id);
    load();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black">Creators</h1>
      <form onSubmit={saveCreator} className="glass-card border rounded-xl p-6 space-y-4 max-w-2xl">
        <h2 className="font-bold">Add creator</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <Input placeholder="Followers" value={form.followers} onChange={(e) => setForm({ ...form, followers: e.target.value })} />
          <Input placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
        </div>
        <ImageUpload label="Avatar" value={form.image_url} folder="creators" onChange={(url) => setForm({ ...form, image_url: url })} />
        <Button type="submit">Add creator</Button>
      </form>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="glass-card border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold">{row.name}</p>
              <p className="text-sm text-foreground/60">{row.specialization} · {row.followers} followers</p>
            </div>
            <button type="button" onClick={() => removeCreator(row.id)} className="text-destructive text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
