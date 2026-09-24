const CACHE_NAME = "dennis-nazar-pwa-v3";

const APP_SHELL = [
  "/",
  "/book.html",
  "/checkout.html",
  "/library.html",
  "/track.html",
  "/privacy.html",
  "/terms.html",
  "/refunds.html",
  "/manifest.webmanifest",
  "/assets/dn-logo-white.png",
  "/assets/favicon.png",
  "/assets/book-1.webp",
  "/assets/book-2.webp",
  "/assets/book-3.webp",
  "/assets/dennis-nazar-hero-background.webp?v=20260925",
  "/assets/online-courses-coming-soon.webp?v=20260925",
  "/assets/coming-soon-cover.webp?v=20260925",
  "/assets/coming-soon-cover-04.webp?v=20260925",
  "/css/style.css?v=ui-final-20260924",
  "/js/pwa.js?v=3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept backend/private Supabase requests or admin routes.
  if (url.pathname.startsWith("/supabase/") || url.pathname.startsWith("/admin")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match("/")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
