'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type TitleRow = {
  id: string;
  slug: string;
  title: string;
  genre: string;
  type: string;
  published: boolean;
};

export default function AdminTitlesPage() {
  const [titles, setTitles] = useState<TitleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClientIfConfigured();
      if (!supabase) return;
      const { data, error } = await supabase
        .from('cms_titles')
        .select('id, slug, title, genre, type, published')
        .order('title');
      if (error) {
        toast.error(error.message);
      } else {
        setTitles(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function removeTitle(id: string) {
    if (!confirm('Delete this title?')) return;
    const supabase = createClientIfConfigured();
    if (!supabase) return;
    const { error } = await supabase.from('cms_titles').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTitles((current) => current.filter((title) => title.id !== id));
    toast.success('Title deleted');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Titles</h1>
          <p className="text-foreground/60 mt-1">Movies and series on XORAL</p>
        </div>
        <Button asChild>
          <Link href="/admin/titles/new">Add title</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-foreground/60">Loading...</p>
      ) : titles.length === 0 ? (
        <div className="glass-card border rounded-xl p-8 text-center space-y-4">
          <p className="text-foreground/60">No titles yet. Import demo data or add your first title.</p>
          <Button asChild>
            <Link href="/admin/titles/new">Add title</Link>
          </Button>
        </div>
      ) : (
        <div className="glass-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-card/40">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Genre</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {titles.map((title) => (
                <tr key={title.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium">{title.title}</td>
                  <td className="px-4 py-3 text-foreground/70 capitalize">{title.type}</td>
                  <td className="px-4 py-3 text-foreground/70">{title.genre}</td>
                  <td className="px-4 py-3">{title.published ? 'Published' : 'Draft'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {title.type === 'series' && (
                      <Link href={`/admin/titles/${title.id}/episodes`} className="text-primary hover:underline">
                        Episodes
                      </Link>
                    )}
                    <Link href={`/admin/titles/${title.id}`} className="text-primary hover:underline">
                      Edit
                    </Link>
                    <button type="button" onClick={() => removeTitle(title.id)} className="text-destructive hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
