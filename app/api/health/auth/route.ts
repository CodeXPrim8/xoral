import { NextResponse } from 'next/server';
import { createClientIfConfigured } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      databaseReady: false,
      message: 'Supabase env vars are missing.',
    });
  }

  const supabase = await createClientIfConfigured();
  if (!supabase) {
    return NextResponse.json({
      configured: false,
      databaseReady: false,
      message: 'Could not create Supabase client.',
    });
  }

  const { error } = await supabase.from('profiles').select('id').limit(1);

  const databaseReady = !error || error.code !== 'PGRST205';

  return NextResponse.json({
    configured: true,
    databaseReady,
    message: databaseReady
      ? 'Registration is ready.'
      : 'Auth works but database schema is missing. Run supabase/schema.sql in the Supabase SQL Editor.',
  });
}
