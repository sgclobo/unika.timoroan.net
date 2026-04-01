const CACHE_VERSION = "v2";
const STATIC_CACHE = `unika-online-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `unika-online-runtime-${CACHE_VERSION}`;
const OFFLINE_FALLBACK_URL = "/offline.html";
const APP_SHELL_URL = "/";

const PRECACHE_URLS = [
  APP_SHELL_URL,
  OFFLINE_FALLBACK_URL,
  "/assets/images/site.webmanifest",
  "/assets/images/web-app-manifest-192x192.png",
  "/assets/images/web-app-manifest-512x512.png",
  "/assets/images/apple-touch-icon.png",
  "/assets/images/favicon-96x96.png",
];

async function precacheCore() {
  const cache = await caches.open(STATIC_CACHE);
  await Promise.allSettled(
    PRECACHE_URLS.map(async (url) => {
      const request = new Request(url, { cache: "reload" });
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(url, response);
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    precacheCore().then(() => {
      self.skipWaiting();
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  return cached || networkPromise || caches.match(OFFLINE_FALLBACK_URL);
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return (
      (await caches.match(APP_SHELL_URL)) || caches.match(OFFLINE_FALLBACK_URL)
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  const assetRequest =
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font";

  if (assetRequest) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        })
        .catch(() => caches.match(OFFLINE_FALLBACK_URL));
    }),
  );
});
