// «Газарзүйч аялагч»-ийн service worker: нэг удаа нээсний дараа интернэтгүй ажиллана.
// Тоглоомын файл (index.html) интернэттэй бол үргэлж шинээр татагдана, үгүй бол хадгалсныг ашиглана.
const CACHE = 'aylagch-v2';
const FILES = ['./', './index.html', './three.min.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Google Fonts: хадгалсныг эхэлж
  if (url.origin !== location.origin) {
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; })));
    return;
  }
  // хуудас: сүлжээ эхэлж (шинэ хувилбар), болохгүй бол хадгалсан
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith(fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  // бусад файл: хадгалсныг эхэлж
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
