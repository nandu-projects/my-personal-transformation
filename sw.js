// Cleanup Service Worker: Unregisters itself and purges any stale WebView cache
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Always fetch fresh network/local assets, never serve stale cached scripts
  event.respondWith(fetch(event.request));
});
