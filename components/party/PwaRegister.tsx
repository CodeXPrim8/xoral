'use client';

import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function PwaRegister() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((key) => key.startsWith('xoral-party') && key !== 'xoral-party-v3')
            .map((key) => caches.delete(key)),
        );
      }

      if (!('serviceWorker' in navigator)) return;

      const secure =
        location.protocol === 'https:' ||
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1';

      if (process.env.NODE_ENV !== 'production') {
        try {
          if (sessionStorage.getItem('xoral-sw-killed') === '1') return;
        } catch { /* ignore */ }
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.unregister()));
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter((key) => key.startsWith('xoral-party')).map((key) => caches.delete(key)));
        }
        try {
          sessionStorage.setItem('xoral-sw-killed', '1');
        } catch { /* ignore */ }
        return;
      }

      if (!secure || cancelled) return;
      await navigator.serviceWorker.register('/sw.js', { scope: '/party' }).catch(() => undefined);
    }

    void boot();

    if (isStandalone() || localStorage.getItem('xoral-pwa-dismiss') === '1') {
      return () => {
        cancelled = true;
      };
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    if (isIos()) setHidden(false);

    return () => {
      cancelled = true;
      window.removeEventListener('beforeinstallprompt', onPrompt);
    };
  }, []);

  useEffect(() => {
    if (deferred) setShowIos(false);
    else if (!hidden && isIos() && !isStandalone()) setShowIos(true);
  }, [deferred, hidden]);

  function dismiss() {
    localStorage.setItem('xoral-pwa-dismiss', '1');
    setHidden(true);
    setDeferred(null);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setHidden(true);
  }

  if (hidden || (!deferred && !showIos)) return null;

  return (
    <div className="xp-pwa-banner" role="dialog" aria-label="Install Xoral Party">
      <p>
        {showIos ? (
          <>
            Add to Home Screen — tap <Share className="inline w-3.5 h-3.5 align-text-bottom" aria-hidden /> then <strong>Add to Home Screen</strong>.
          </>
        ) : (
          <>Install Xoral Party for a full-screen app on this device.</>
        )}
      </p>
      <div className="xp-pwa-actions">
        {deferred && (
          <button type="button" className="xp-btn xp-btn-primary xp-pwa-install" onClick={() => void install()}>
            <Download className="w-4 h-4" /> Install
          </button>
        )}
        <button type="button" className="xp-icon-btn" onClick={dismiss} aria-label="Dismiss install prompt">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
