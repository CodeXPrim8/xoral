import type { SupabaseClient } from '@supabase/supabase-js';

type WireTitleOptions = {
  slug: string;
  type: string;
  isAiGenerated: boolean;
  published: boolean;
};

/** Add a newly created title to home carousels and hero when appropriate. */
export async function wireNewTitleToHome(
  supabase: SupabaseClient,
  titleId: string,
  options: WireTitleOptions
) {
  if (!options.published) return;

  const sectionIds = ['trending', 'next_watch'];
  if (options.type === 'ai' || options.isAiGenerated) {
    sectionIds.push('ai_originals');
  }

  for (const sectionId of sectionIds) {
    const { data: alreadyListed } = await supabase
      .from('cms_section_items')
      .select('title_id')
      .eq('section_id', sectionId)
      .eq('title_id', titleId)
      .maybeSingle();

    if (alreadyListed) continue;

    const { data: lastItem } = await supabase
      .from('cms_section_items')
      .select('sort_order')
      .eq('section_id', sectionId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const sort_order = (lastItem?.[0]?.sort_order ?? -1) + 1;

    await supabase.from('cms_section_items').insert({
      section_id: sectionId,
      title_id: titleId,
      sort_order,
      progress: sectionId === 'next_watch' ? 40 : null,
    });
  }

  const { count: heroCount } = await supabase
    .from('cms_hero')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (!heroCount) {
    const sort_order = 0;
    await supabase.from('cms_hero').insert({
      title_slug: options.slug,
      sort_order,
      is_active: true,
    });
  }
}
