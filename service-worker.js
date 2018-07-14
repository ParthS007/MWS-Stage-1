const staticCacheName = 'restaurant-static-v1';
const dynamicCacheName = 'restaurant-dynamic-v1';

const cssFiles = [
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'css/styles.css'
];

const jsFiles = [
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js'
];

const imgFiles = [
  './img/1.jpg',
  './img/2.jpg',
  './img/3.jpg',
  './img/4.jpg',
  './img/5.jpg',
  './img/6.jpg',
  './img/7.jpg',
  './img/8.jpg',
  './img/9.jpg',
  './img/10.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(staticCacheName)
      .then((cache) => {
        cache.addAll([
          '/',
          cssFiles,
          jsFiles,
          imgFiles
        ]);
      }).catch(() => {
        console.log('Error caching static assets!');
      })
  );
});

self.addEventListener('activate', (event) => {
  if (self.clients && clients.claim) {
    clients.claim();
  }
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName.startsWith('mws-stage1-') && cacheName !== staticCacheName;
        })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
        .then((fetchResponse) => {
          return caches.open(dynamicCacheName)
            .then((cache) => {
              cache.put(event.request.url, fetchResponse.clone());
              return fetchResponse;
            });
        });
    })
  );
});
