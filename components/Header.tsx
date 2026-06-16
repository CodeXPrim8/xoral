'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getNotifications, markNotificationsRead } from '@/lib/user-data';
import { useAuth } from '@/components/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { Notification } from '@/lib/types';

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getNotifications().then(setNotifications);
  }, [pathname, user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const showAuth = isSupabaseConfigured();
  const initial = user?.email?.[0]?.toUpperCase() ?? 'G';

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm smooth-transition ${
        pathname === href ? 'text-foreground font-semibold' : 'text-foreground/70 hover:text-foreground'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-background/95 border-b border-border">
      <div className="w-full px-6 sm:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <span className="text-primary text-2xl font-black tracking-tight">XORAL</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-8">
            {navLink('/', 'Home')}
            {navLink('/movies', 'Movies')}
            {navLink('/search', 'Search')}
            {navLink('/ai-stars', 'AI Stars')}
            {navLink('/library', 'My List')}
            {navLink('/community', 'Community')}
          </nav>

          <div className="flex items-center gap-4 ml-auto">
            <Link href="/search" className="p-2 hover:opacity-70 smooth-transition hidden sm:block">
              <Search className="w-5 h-5 text-foreground" />
            </Link>
            {showAuth && !loading && !user && (
              <Link href="/login" className="text-sm font-semibold text-primary hover:opacity-80 smooth-transition">
                Sign In
              </Link>
            )}
            <div className="relative" ref={panelRef}>
              <button
                type="button"
                onClick={async () => {
                  setShowNotifications((open) => !open);
                  if (!showNotifications) {
                    const next = await markNotificationsRead();
                    setNotifications(next);
                  }
                }}
                className="p-2 hover:opacity-70 smooth-transition relative"
              >
                <Bell className="w-5 h-5 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-card border rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-semibold text-sm">Notifications</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="px-4 py-3 border-b border-border/50 text-sm">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-foreground/60 text-xs mt-1">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {showAuth && user ? (
              <Link
                href="/profile"
                className="flex items-center justify-center w-8 h-8 rounded bg-primary text-primary-foreground text-xs font-bold hover:opacity-70 smooth-transition"
              >
                {initial}
              </Link>
            ) : (
              <Link
                href={showAuth ? '/login' : '/profile'}
                className="flex items-center justify-center w-8 h-8 rounded bg-primary text-primary-foreground text-xs font-bold hover:opacity-70 smooth-transition"
              >
                {initial}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
