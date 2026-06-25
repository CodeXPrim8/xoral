type SupabaseError = { code?: string; message?: string } | null;

/** True when cms_hero is still on the legacy single-row schema. */
export function isLegacyHeroSchemaError(error: SupabaseError): boolean {
  if (!error) return false;
  const message = error.message ?? '';
  return (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    message.includes('sort_order') ||
    message.includes('is_active') ||
    message.includes('cms_hero_id_check')
  );
}

export type HeroFormPayload = {
  title_slug: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  rating: number;
  category: string;
  updated_at: string;
};

export function isDuplicatePrimaryKeyError(error: SupabaseError): boolean {
  if (!error) return false;
  return error.code === '23505' || (error.message ?? '').includes('cms_hero_pkey');
}

export function toLegacyHeroRow(payload: HeroFormPayload, id = 1) {
  return { id, ...payload };
}
