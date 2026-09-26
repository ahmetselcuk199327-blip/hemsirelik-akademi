const SURUM = "hemsire-akademi-v1";
const DOSYALAR = [
  "./", "./index.html", "./veri.js", "./oyun.js",
  "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(SURUM).then(function (c) {
      return Promise.all(DOSYALAR.map(function (d) {
        return c.add(d).catch(function () { });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (anahtarlar) {
      return Promise.all(anahtarlar.map(function (a) {
        return a === SURUM ? null : caches.delete(a);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (onbellek) {
      const ag = fetch(e.request).then(function (yanit) {
        if (yanit && yanit.status === 200 && yanit.type === "basic") {
          const kopya = yanit.clone();
          caches.open(SURUM).then(function (c) { c.put(e.request, kopya); });
        }
        return yanit;
      }).catch(function () {
        return onbellek || caches.match("./index.html");
      });
      return onbellek || ag;
    })
  );
});
