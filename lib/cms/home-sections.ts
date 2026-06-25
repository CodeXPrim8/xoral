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

  const { data: hero } = await supabase.from('cms_hero').select('title_slug').eq('id', 1).maybeSingle();

  if (!hero?.title_slug) {
    await supabase.from('cms_hero').upsert({
      id: 1,
      title_slug: options.slug,
    });
  }
}
