import { createClientIfConfigured } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  fetchCatalogFromCms,
  finalizeCatalogSnapshot,
  getStaticCatalog,
  mergeCatalogSnapshots,
  type CatalogSnapshot,
} from './catalog';
import { unstable_noStore as noStore } from 'next/cache';

export async function getCatalog(): Promise<CatalogSnapshot> {
  noStore();
  const staticCatalog = getStaticCatalog();

  if (!isSupabaseConfigured()) {
    return staticCatalog;
  }

  const supabase = await createClientIfConfigured();
  if (!supabase) {
    return staticCatalog;
  }

  const cmsCatalog = await fetchCatalogFromCms(supabase);
  if (!cmsCatalog) {
    return staticCatalog;
  }

  return finalizeCatalogSnapshot(mergeCatalogSnapshots(staticCatalog, cmsCatalog));
}

export async function isAdminUser() {
  if (!isSupabaseConfigured()) return false;

  const supabase = await createClientIfConfigured();
  if (!supabase) return false;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return false;

  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return data?.role === 'admin';
}
