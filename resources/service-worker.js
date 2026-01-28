const CACHE_NAME = 'nulchat-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './css/base.css',
  './css/layout.css',
  './css/responsive.css',
  './css/variables.css',
  './css/components.css',
  './css/modules/dashboard.css',
  './js/app/index.js',
  './assets/fonts/nothing-font-5x7.ttf',
  './assets/icons/NulIconN.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignoramos peticiones a Firestore para no interferir con la DB en tiempo real
  if (event.request.url.includes('firestore.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});