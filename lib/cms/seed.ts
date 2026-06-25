import { allTitles, creators, heroContent, continueWatching, trendingMovies, aiMovies } from '@/lib/data';
import { characters } from '@/lib/characters';
import type { SupabaseClient } from '@supabase/supabase-js';

function formatDbError(error: { message?: string; details?: string; hint?: string; code?: string }) {
  return [error.message, error.details, error.hint, error.code ? `(${error.code})` : null]
    .filter(Boolean)
    .join(' — ');
}

function firstRow<T>(rows: T[] | null | undefined, label: string): T {
  const row = rows?.[0];
  if (!row) {
    throw new Error(`${label}: no row returned. Check admin role and cms-schema.sql.`);
  }
  return row;
}

export async function seedCmsFromStatic(supabase: SupabaseClient) {
  const characterIdBySlug = new Map<string, string>();

  for (const character of characters) {
    const { data, error } = await supabase
      .from('cms_characters')
      .upsert(
        {
          slug: character.slug,
          name: character.name,
          gender: character.gender,
          age: character.age ?? null,
          nationality: character.nationality,
          height: character.height,
          eyes: character.eyes,
          hair: character.hair,
          personality: character.personality,
          style: character.style,
          voice: character.voice,
          profession: character.profession,
          skin_color: character.skinColor,
          description: character.description,
          image_url: character.image,
          published: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      )
      .select('id, slug');

    if (error) throw new Error(`AI Star "${character.name}": ${formatDbError(error)}`);
    const row = firstRow(data, `AI Star "${character.name}"`);
    characterIdBySlug.set(row.slug, row.id);
  }

  const titleIdBySlug = new Map<string, string>();

  for (const title of allTitles) {
    const { data, error } = await supabase
      .from('cms_titles')
      .upsert(
        {
          slug: title.slug,
          title: title.title,
          image_url: title.image,
          rating: title.rating,
          type: title.type,
          description: title.description,
          genre: title.genre,
          maturity_rating: title.maturityRating,
          is_ai_generated: title.isAiGenerated,
          subtitle: title.subtitle ?? null,
          published: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      )
      .select('id, slug');

    if (error) throw new Error(`Title "${title.title}": ${formatDbError(error)}`);
    const row = firstRow(data, `Title "${title.title}"`);
    titleIdBySlug.set(row.slug, row.id);

    const { error: deleteCastError } = await supabase.from('cms_title_cast').delete().eq('title_id', row.id);
    if (deleteCastError) throw new Error(`Cast reset for "${title.title}": ${formatDbError(deleteCastError)}`);

    const castRows = title.cast
      .map((slug) => characterIdBySlug.get(slug))
      .filter(Boolean)
      .map((characterId) => ({ title_id: row.id, character_id: characterId }));

    if (castRows.length) {
      const { error: castError } = await supabase.from('cms_title_cast').insert(castRows);
      if (castError) throw new Error(`Cast for "${title.title}": ${formatDbError(castError)}`);
    }
  }

  for (const [index, creator] of creators.entries()) {
    const { error } = await supabase.from('cms_creators').upsert(
      {
        slug: creator.id,
        name: creator.name,
        image_url: creator.image,
        followers: creator.followers,
        specialization: creator.specialization,
        sort_order: index,
        published: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );
    if (error) throw new Error(`Creator "${creator.name}": ${formatDbError(error)}`);
  }

  const heroSlides = [
    {
      title_slug: heroContent.slug,
      subtitle: heroContent.subtitle ?? null,
      description: heroContent.description,
      image_url: heroContent.image,
      rating: heroContent.rating,
      category: heroContent.category,
      sort_order: 0,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    ...trendingMovies.slice(0, 2).map((title, index) => ({
      title_slug: title.slug,
      subtitle: title.subtitle ?? null,
      description: title.description,
      image_url: title.image,
      rating: title.maturityRating,
      category: title.genre,
      sort_order: index + 1,
      is_active: true,
      updated_at: new Date().toISOString(),
    })),
  ];

  const { error: heroDeleteError } = await supabase.from('cms_hero').delete().neq('id', 0);
  if (heroDeleteError) throw new Error(`Hero banner reset: ${formatDbError(heroDeleteError)}`);

  const { error: heroError } = await supabase.from('cms_hero').insert(heroSlides);
  if (heroError) throw new Error(`Hero banner: ${formatDbError(heroError)}`);

  async function seedSection(sectionId: string, items: typeof allTitles, withProgress = false) {
    const { error: deleteError } = await supabase.from('cms_section_items').delete().eq('section_id', sectionId);
    if (deleteError) throw new Error(`Section "${sectionId}": ${formatDbError(deleteError)}`);

    const rows = items
      .map((item, index) => {
        const titleId = titleIdBySlug.get(item.slug);
        if (!titleId) return null;
        const cw = withProgress
          ? continueWatching.find((entry) => entry.slug === item.slug)
          : null;
        return {
          section_id: sectionId,
          title_id: titleId,
          sort_order: index,
          progress: cw?.progress ?? null,
          episode_label: cw?.episodeLabel ?? null,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (rows.length) {
      const { error } = await supabase.from('cms_section_items').insert(rows);
      if (error) throw new Error(`Section "${sectionId}": ${formatDbError(error)}`);
    }
  }

  await seedSection('next_watch', continueWatching, true);
  await seedSection('trending', trendingMovies);
  await seedSection('ai_originals', aiMovies);

  return {
    characters: characters.length,
    titles: allTitles.length,
    creators: creators.length,
  };
}
