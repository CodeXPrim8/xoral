import { NextResponse } from 'next/server';
import { createClientIfConfigured } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/cms/server';
import { seedCmsFromStatic } from '@/lib/cms/seed';

export async function POST() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const supabase = await createClientIfConfigured();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const result = await seedCmsFromStatic(supabase);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Seed failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
