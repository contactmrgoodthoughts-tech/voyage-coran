/* Voyage avec le Coran — service worker (fonctionnement hors ligne) */
const VERSION = 'vac-shell-__BUILD__';
const SHELL = [
  './', 'index.html', 'styles.css', 'tajweed.css', 'app.js', 'tajweed.js', 'fonts.css', 'manifest.webmanifest', 'data/quran.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/icon-maskable.png',
  __FONTS__
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('vac-shell-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Cache d'abord, puis mise à jour en arrière-plan
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || (e.request.mode === 'navigate' ? c.match('index.html') : Response.error());
  }));
});
