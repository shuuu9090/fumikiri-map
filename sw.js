// FUMIKIRI MAP service worker
// 方針:
//  - アプリ本体(同一オリジンのHTML/manifest/icon)は precache し、オフラインでも起動する
//  - Leaflet本体・地図タイル等のCDNは runtime cache(stale-while-revalidate 的に)
//  - 地名検索/踏切取得API(Nominatim/Overpass)は常に最新が欲しいのでキャッシュしない
const VERSION = 'fumikiri-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
];

// API はキャッシュ対象外(常にネットワーク)
const NO_CACHE_HOSTS = ['nominatim.openstreetmap.org', 'overpass-api.de'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return; // Overpass の POST 等はそのまま通す

  const url = new URL(req.url);
  if (NO_CACHE_HOSTS.includes(url.hostname)) return; // API はネットワーク直行

  const sameOrigin = url.origin === self.location.origin;
  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (sameOrigin && isHTML) {
    // HTML(ページ): network-first。オンライン時は常に最新、オフライン時のみキャッシュ
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
  } else if (sameOrigin) {
    // 静的アセット(icon/manifest等): cache-first
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
        return res;
      }))
    );
  } else {
    // CDN/タイル: network-first、失敗時はキャッシュ。成功時は runtime cache に保存
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
  }
});
