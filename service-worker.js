const CACHE_NAME = 'tdr-4letter-v34-pwa-install-ready';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './cyber-bg.js',
  './app.js',
  './facility-data.js',
  './manifest.json',
  './qrcode.min.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/favicon.png',
  './icons/apple-touch-icon.png',
  './assets/castle_dark.jpg',
  './assets/castle_lit.jpg',
  './assets/logo_4l_official.png',
  './assets/logo_4l_octagon_pure.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // 1つのアセットの失敗で全体が中断しないよう堅牢にキャッシュ
      for (const url of ASSETS_TO_CACHE) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('Optional asset cache skipped:', url, err);
        }
      }
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            console.log('Deleting old cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // ネットワーク優先（最新を取得）、オフライン時のみキャッシュ
  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.status === 200 && response.type === 'basic') {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(event.request).then(cached => {
        if (cached) return cached;
        // ルート要求時は index.html にフォールバック
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
