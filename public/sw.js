// ✅ Minimal, conservative service worker — exists mainly to satisfy PWA
// "installability" (Add to Home Screen) requirements, which need a
// registered service worker with a fetch handler.
//
// Deliberately does almost no caching. This app has live pricing, checkout,
// and account state — a service worker that aggressively caches pages or JS
// bundles is a classic way to leave users stuck on a stale version after a
// deploy (broken chunk hashes, wrong prices shown, etc). So: cache ONLY the
// static PWA icons (which rarely change and are safe to reuse), and let
// everything else — HTML, API calls, JS/CSS bundles — go straight to the
// network exactly like a normal site would.
const CACHE_NAME = 'creo-static-v1';
const PRECACHE_URLS = ['/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isPrecachedIcon = PRECACHE_URLS.includes(url.pathname);
  if (!isPrecachedIcon) return; // let the browser handle everything else normally

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
