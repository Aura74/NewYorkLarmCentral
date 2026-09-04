/* Lars Résonance — service worker.
   Bump CACHE_VERSION on every css/js/html change or visitors keep old files.
   Strategy: navigations network-first (cache fallback), same-origin assets
   stale-while-revalidate, external images (Unsplash) cache-first with a size cap. */
const CACHE_VERSION = 'lr-v1';
const IMG_CACHE = 'lr-img-v1';
const IMG_CACHE_MAX = 60;

const PRECACHE_URLS = [
  './',
  './index.html',
  './privacy.html',
  './terms.html',
  './css/style.css',
  './css/fonts.css',
  './js/app.js',
  './js/data.js',
  './js/modules/env.js',
  './js/modules/i18n.js',
  './js/modules/theme.js',
  './js/modules/ui.js',
  './js/modules/scroll.js',
  './js/modules/hero.js',
  './js/modules/motion.js',
  './js/modules/collection.js',
  './js/modules/sliders.js',
  './js/modules/booking.js',
  './js/modules/form.js',
  './js/modules/ambient.js',
  './js/modules/settings.js',
  './js/modules/perf-probe.js',
  './js/modules/chat.js',
  './fonts/cormorant-garamond.woff2',
  './fonts/cormorant-garamond-italic.woff2',
  './fonts/dm-sans.woff2',
  './fonts/dm-sans-italic.woff2',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/apple-touch-icon.png',
  './img/favicon-32.png',
  './img/favicon.svg',
  './site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION && k !== IMG_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    // External images: cache-first with background refresh (opaque responses are fine)
    if (req.destination === 'image') {
      event.respondWith(
        caches.open(IMG_CACHE).then((cache) =>
          cache.match(req).then((cached) => {
            const network = fetch(req)
              .then((res) => {
                if (res && (res.status === 200 || res.type === 'opaque')) {
                  cache.put(req, res.clone());
                  trimCache(IMG_CACHE, IMG_CACHE_MAX);
                }
                return res;
              })
              .catch(() => cached);
            return cached || network;
          })
        )
      );
    }
    return; // other cross-origin (CDN scripts, weather API): leave to the browser
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
