import { NextResponse } from 'next/server';
import { createClientIfConfigured } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/cms/server';
import {
  isDuplicatePrimaryKeyError,
  isLegacyHeroSchemaError,
  toLegacyHeroRow,
  type HeroFormPayload,
} from '@/lib/cms/hero-schema';

export async function POST(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const supabase = await createClientIfConfigured();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const body = await request.json();
  const payload: HeroFormPayload = {
    title_slug: body.title_slug ?? null,
    subtitle: body.subtitle ?? null,
    description: body.description ?? null,
    image_url: body.image_url,
    rating: body.rating ?? 16,
    category: body.category ?? 'Drama',
    updated_at: new Date().toISOString(),
  };

  const insertPayload = {
    ...payload,
    sort_order: body.sort_order ?? 0,
    is_active: body.is_active !== false,
  };

  let { data, error } = await supabase.from('cms_hero').insert(insertPayload).select('id').maybeSingle();

  if (isLegacyHeroSchemaError(error)) {
    ({ data, error } = await supabase
      .from('cms_hero')
      .upsert(toLegacyHeroRow(payload))
      .select('id')
      .maybeSingle());
  }

  if (isDuplicatePrimaryKeyError(error)) {
    const { data: maxRow } = await supabase
      .from('cms_hero')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextId = (maxRow?.id ?? 0) + 1;
    ({ data, error } = await supabase
      .from('cms_hero')
      .insert({ ...insertPayload, id: nextId })
      .select('id')
      .maybeSingle());
  }

  if (error) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  }

  return NextResponse.json({ id: data?.id });
}

export async function PATCH(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const supabase = await createClientIfConfigured();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const body = await request.json();
  const id = Number(body.id);
  if (!id) {
    return NextResponse.json({ error: 'Missing slide id' }, { status: 400 });
  }

  const payload: HeroFormPayload = {
    title_slug: body.title_slug ?? null,
    subtitle: body.subtitle ?? null,
    description: body.description ?? null,
    image_url: body.image_url,
    rating: body.rating ?? 16,
    category: body.category ?? 'Drama',
    updated_at: new Date().toISOString(),
  };

  let { error } = await supabase
    .from('cms_hero')
    .update({ ...payload, is_active: body.is_active !== false })
    .eq('id', id);

  if (isLegacyHeroSchemaError(error)) {
    ({ error } = await supabase.from('cms_hero').update(payload).eq('id', id));
  }

  if (error) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const supabase = await createClientIfConfigured();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get('id'));
  if (!id) {
    return NextResponse.json({ error: 'Missing slide id' }, { status: 400 });
  }

  const { error } = await supabase.from('cms_hero').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
