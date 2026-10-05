const V = 'pp-v10';
const PRE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(PRE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'pp-products' && k !== 'pp-static').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // app shell: network first so updates land, cache fallback so it opens offline
    e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
  } else if (u.hostname.endsWith('openfoodfacts.org') && u.pathname.includes('/api/v2/product/')) {
    // scanned products: cache so a rescanned product works offline
    e.respondWith(caches.open('pp-products').then(async c => { try { const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res; } catch (err) { const m = await c.match(r); if (m) return m; throw err; } }));
  } else if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com' || u.hostname === 'cdn.jsdelivr.net') {
    // fonts + scanner library: cache first
    e.respondWith(caches.open('pp-static').then(async c => { const m = await c.match(r); if (m) return m; const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res; }));
  }
});
