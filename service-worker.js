const SURUM = "hemsire-akademi-v1.2.0";
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
      .then(function () {
        return self.clients.matchAll().then(function (liste) {
          liste.forEach(function (c) { c.postMessage({ tip: "yeni-surum", surum: SURUM }); });
        });
      })
  );
});

self.addEventListener("message", function (e) {
  if (e.data && e.data.tip === "skip-waiting") self.skipWaiting();
});

/* gezinme: önce ağ, çevrimdışıysa önbellek */
function ağOnce(istek) {
  return fetch(istek).then(function (yanit) {
    if (yanit && yanit.status === 200) {
      const kopya = yanit.clone();
      caches.open(SURUM).then(function (c) { c.put(istek, kopya); });
    }
    return yanit;
  }).catch(function () {
    return caches.match(istek).then(function (o) {
      return o || caches.match("./index.html");
    });
  });
}

/* diğer dosyalar: hemen önbellekten ver, arka planda tazele */
function onceTazele(istek) {
  return caches.match(istek).then(function (o) {
    const ag = fetch(istek).then(function (yanit) {
      if (yanit && yanit.status === 200 && yanit.type === "basic") {
        const kopya = yanit.clone();
        caches.open(SURUM).then(function (c) { c.put(istek, kopya); });
      }
      return yanit;
    }).catch(function () { return o; });
    return o || ag;
  });
}

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  const ayni = new URL(e.request.url).origin === self.location.origin;
  if (!ayni) return;
  if (e.request.mode === "navigate") { e.respondWith(ağOnce(e.request)); return; }
  e.respondWith(onceTazele(e.request));
});
