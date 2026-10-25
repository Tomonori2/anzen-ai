// Service Worker＝アプリを裏で支える小さなプログラム。
// 一度開いたファイルを保存しておき、電波が悪くても画面が開けるようにする。
const CACHE_NAME = "anzen-ai-v6";
const FILES = [
  "./index.html",
  "./knowledge.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // AI(Gemini)への通信はキャッシュせず、そのまま通す
  if (e.request.url.includes("generativelanguage")) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
