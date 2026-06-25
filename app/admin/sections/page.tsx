'use client';

import { useEffect, useState } from 'react';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'next_watch', label: 'Your Next Watch' },
  { id: 'trending', label: 'Trending Now' },
  { id: 'ai_originals', label: 'AI Generated Originals' },
];

export default function AdminSectionsPage() {
  const [titles, setTitles] = useState<{ id: string; title: string }[]>([]);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClientIfConfigured();
      if (!supabase) return;
      const { data: titleRows } = await supabase.from('cms_titles').select('id, title').order('title');
      setTitles(titleRows ?? []);

      const next: Record<string, string[]> = {};
      for (const section of SECTIONS) {
        const { data } = await supabase
          .from('cms_section_items')
          .select('title_id')
          .eq('section_id', section.id)
          .order('sort_order');
        next[section.id] = data?.map((row) => row.title_id) ?? [];
      }
      setSelected(next);
    }
    load();
  }, []);

  function toggle(sectionId: string, titleId: string) {
    setSelected((current) => {
      const list = current[sectionId] ?? [];
      return {
        ...current,
        [sectionId]: list.includes(titleId)
          ? list.filter((id) => id !== titleId)
          : [...list, titleId],
      };
    });
  }

  async function saveSection(sectionId: string) {
    setSaving(true);
    const supabase = createClientIfConfigured();
    if (!supabase) return;
    await supabase.from('cms_section_items').delete().eq('section_id', sectionId);
    const rows = (selected[sectionId] ?? []).map((title_id, index) => ({
      section_id: sectionId,
      title_id,
      sort_order: index,
      progress: sectionId === 'next_watch' ? 40 : null,
    }));
    if (rows.length) {
      const { error } = await supabase.from('cms_section_items').insert(rows);
      if (error) toast.error(error.message);
      else toast.success('Section saved');
    }
    setSaving(false);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black">Home sections</h1>
      {SECTIONS.map((section) => (
        <div key={section.id} className="glass-card border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">{section.label}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {titles.map((title) => (
              <label key={title.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(selected[section.id] ?? []).includes(title.id)}
                  onChange={() => toggle(section.id, title.id)}
                />
                {title.title}
              </label>
            ))}
          </div>
          <Button type="button" disabled={saving} onClick={() => saveSection(section.id)}>
            Save {section.label}
          </Button>
        </div>
      ))}
    </div>
  );
}
