'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { migrateLocalStorageToSupabase } from '@/lib/user-data';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClientIfConfigured();
    if (!supabase) {
      const t = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(t);
    }

    let active = true;

    function apply(nextUser: User | null, stopLoading = true) {
      window.setTimeout(() => {
        if (!active) return;
        userIdRef.current = nextUser?.id ?? null;
        setUser(nextUser);
        if (stopLoading) setLoading(false);
      }, 0);
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      apply(nextUser);
      if (nextUser) void migrateLocalStorageToSupabase();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'TOKEN_REFRESHED') return;

      const nextUser = session?.user ?? null;
      const nextUserId = nextUser?.id ?? null;

      if (event === 'SIGNED_OUT') {
        apply(null);
        return;
      }

      if (nextUserId !== userIdRef.current) {
        apply(nextUser);
        if (nextUser) void migrateLocalStorageToSupabase();
        return;
      }

      window.setTimeout(() => {
        if (active) setLoading(false);
      }, 0);
    });

    function onVisible() {
      if (document.visibilityState !== 'visible') return;
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (!active) return;
        const nextUser = session?.user ?? null;
        const nextUserId = nextUser?.id ?? null;
        if (nextUserId !== userIdRef.current) apply(nextUser, false);
      });
    }

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisible);
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useIsLoggedIn() {
  const { user, loading } = useAuth();
  return { loggedIn: Boolean(user), loading };
}
