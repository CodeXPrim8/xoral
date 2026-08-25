const CACHE = 'xoral-party-v3'
const PRECACHE = ['/party', '/offline.html', '/icons/icon-192.png', '/icons/icon-512.png', '/manifest.webmanifest']
const SKIP_CACHE = /\/party\/(checkout|my|ticket|check-in)/

function isDevHost() {
  const host = self.location.hostname
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return true
  if (host.includes('trycloudflare.com')) return true
  if (/^192\.168\./.test(host) || /^10\./.test(host)) return true
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true
  return false
}

const DEV_HOST = isDevHost()

self.addEventListener('install', (event) => {
  if (DEV_HOST) {
    event.waitUntil(self.skipWaiting())
    return
  }
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (DEV_HOST) {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
        await self.registration.unregister()
        return
      }
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  if (DEV_HOST) return
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (shouldBypass(url, request)) return

  if (url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  event.respondWith(networkFirst(request))
})

function shouldBypass(url, request) {
  const path = url.pathname
  if (path.startsWith('/api/')) return true
  if (path.startsWith('/_next/')) return true
  if (path.includes('hot-update') || path.includes('__nextjs')) return true
  if (SKIP_CACHE.test(path)) return true
  if (request.headers.get('accept')?.includes('text/x-component')) return true
  return false
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE)
    cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok && response.type !== 'opaque') {
      const cache = await caches.open(CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return (await caches.match(request)) || (await caches.match('/offline.html')) || Response.error()
  }
}
