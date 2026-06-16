'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { migrateLocalStorageToSupabase } from '@/lib/user-data';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClientIfConfigured();
    if (!supabase) {
      setUser(null);
      setLoading(false);
      return;
    }
    const { data: { user: sessionUser } } = await supabase.auth.getUser();
    setUser(sessionUser);
    setLoading(false);
    if (sessionUser) {
      await migrateLocalStorageToSupabase();
    }
  }, []);

  useEffect(() => {
    refresh();
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => subscription.unsubscribe();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useIsLoggedIn() {
  const { user, loading } = useAuth();
  if (!isSupabaseConfigured()) return { loggedIn: true, loading: false };
  return { loggedIn: Boolean(user), loading };
}
