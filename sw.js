self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch', e => {
  // Minimal service worker just to make it installable
});
