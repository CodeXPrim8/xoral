import { createClientIfConfigured } from '@/lib/supabase/client';

import { isSupabaseConfigured } from '@/lib/supabase/config';



export type RegisterInput = {

  email: string;

  password: string;

  displayName?: string;

  redirectTo?: string;

};



export type RegisterResult =

  | { ok: true; needsEmailConfirmation: false }

  | { ok: true; needsEmailConfirmation: true }

  | { ok: false; error: string };



export function getAuthCallbackUrl(nextPath = '/') {

  if (typeof window === 'undefined') return undefined;

  const next = encodeURIComponent(nextPath);

  return `${window.location.origin}/auth/callback?next=${next}`;

}



function formatAuthError(error: { message?: string; name?: string; status?: number }) {

  if (error.name === 'AuthRetryableFetchError' || error.message === 'Failed to fetch') {

    return 'Could not reach XORAL accounts. This often happens when Supabase email confirmation is on but email sending is limited. Turn off Confirm email in Supabase → Authentication → Providers → Email, then try again.';

  }

  if (error.status === 429 || error.message?.includes('rate limit')) {

    return 'Too many signup attempts. Wait an hour or disable email confirmation in Supabase, then try again.';

  }

  return error.message ?? 'Sign up failed. Please try again.';

}



async function ensureUserProfile(

  supabase: NonNullable<ReturnType<typeof createClientIfConfigured>>,

  userId: string,

  displayName?: string,

  email?: string | null

) {

  const name = displayName?.trim() || email?.split('@')[0] || 'Member';

  const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();



  if (!existing) {

    await supabase.from('profiles').insert({ id: userId, display_name: name });

    return;

  }



  if (displayName?.trim()) {

    await supabase.from('profiles').update({ display_name: displayName.trim() }).eq('id', userId);

  }

}



export async function registerUser(input: RegisterInput): Promise<RegisterResult> {

  if (!isSupabaseConfigured()) {

    return { ok: false, error: 'Supabase is not configured. Add env vars to enable accounts.' };

  }



  const supabase = createClientIfConfigured();

  if (!supabase) {

    return { ok: false, error: 'Unable to connect to Supabase. Please check environment variables.' };

  }



  const displayName = input.displayName?.trim();



  try {

    const { error, data } = await supabase.auth.signUp({

      email: input.email,

      password: input.password,

      options: {

        emailRedirectTo: getAuthCallbackUrl('/'),

        data: displayName ? { display_name: displayName } : undefined,

      },

    });

    if (error) {

      return { ok: false, error: formatAuthError(error) };

    }



    if (data.user) {

      try {

        await ensureUserProfile(supabase, data.user.id, displayName, input.email);

      } catch {

        // Profile trigger may already create the row; don't fail signup.

      }

    }



    if (data.session) {

      return { ok: true, needsEmailConfirmation: false };

    }



    return { ok: true, needsEmailConfirmation: true };

  } catch (err) {

    const message = err instanceof Error ? err.message : 'Sign up failed';

    return { ok: false, error: formatAuthError({ message }) };

  }

}


