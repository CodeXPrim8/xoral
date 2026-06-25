'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminCharactersPage() {
  const [rows, setRows] = useState<{ id: string; name: string; profession: string; published: boolean }[]>([]);

  useEffect(() => {
    createClientIfConfigured()
      ?.from('cms_characters')
      .select('id, name, profession, published')
      .order('name')
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setRows(data ?? []);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">AI Stars</h1>
        <Button asChild><Link href="/admin/characters/new">Add AI Star</Link></Button>
      </div>
      <div className="glass-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-card/40">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Profession</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Edit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/50">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">{row.profession}</td>
                <td className="px-4 py-3">{row.published ? 'Published' : 'Draft'}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/characters/${row.id}`} className="text-primary hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
