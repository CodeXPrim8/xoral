'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClientIfConfigured } from '@/lib/supabase/client';

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
      setLoading(false);
      return;
    }

    let active = true;

    void supabase.auth.stopAutoRefresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      const nextUserId = session?.user?.id ?? null;

      if (event === 'TOKEN_REFRESHED') {
        return;
      }

      if (event === 'SIGNED_OUT') {
        userIdRef.current = null;
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        if (nextUserId !== userIdRef.current) {
          userIdRef.current = nextUserId;
          setUser(session.user);
        }
        setLoading(false);
        return;
      }

      if (event === 'INITIAL_SESSION') {
        userIdRef.current = null;
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
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
