// Minimal service worker for PWA support
const CACHE_NAME = 'ortiz-insurance-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests (no caching in dev)
  return;
});
