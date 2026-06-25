import { SeriesManager } from '@/components/admin/SeriesManager';
import { createClientIfConfigured } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function TitleEpisodesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClientIfConfigured();
  if (!supabase) notFound();

  const { data: title } = await supabase
    .from('cms_titles')
    .select('id, title, type')
    .eq('id', id)
    .maybeSingle();

  if (!title || title.type !== 'series') {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Episodes</h1>
      <SeriesManager titleId={title.id} showTitle={title.title} />
    </div>
  );
}
