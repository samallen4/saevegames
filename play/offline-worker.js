const scope = new URL(self.registration.scope);
const prefix = "blocksmith-web:" + scope.pathname + ":";
const cacheName = prefix + "9f511beee038e6339c08";
const assets = [
  "index.html", "index.js", "index.wasm", "index.pck", "offline.js",
  "index.audio.worklet.js", "index.audio.position.worklet.js",
  "index.icon.png", "index.apple-touch-icon.png", "index.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(prefix) && key !== cacheName)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== scope.origin ||
      !url.pathname.startsWith(scope.pathname)) return;

  const path = url.pathname.slice(scope.pathname.length) || "index.html";
  if (!assets.includes(path)) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return (await cache.match(path)) || fetch(event.request);
  })());
});
