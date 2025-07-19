const CACHE_STATIC_NAME = "gamitas-static-v1";
const CACHE_DYNAMIC_NAME = "gamitas-dynamic-v1";

// An array of all the files that make up the "app shell" - the basic HTML, CSS, JS, and images needed to run.
const APP_SHELL_URLS = [
  "/",
  "/index.html",
  "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css",
  "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js",
  "https://cdn-icons-png.flaticon.com/512/3468/3468379.png",
  "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
  "https://cdn-icons-png.flaticon.com/512/904/904772.png",
  "https://cdn-icons-png.flaticon.com/512/3602/3602123.png",
  "https://cdn-icons-png.flaticon.com/512/1574/1574671.png",
  "https://cdn-icons-png.flaticon.com/512/992/992648.png",
  "https://cdn-icons-png.flaticon.com/512/8351/8351110.png",
  "https://cdn-icons-png.flaticon.com/512/3652/3652191.png",
  "https://cdn-icons-png.flaticon.com/512/3063/3063823.png",
  "https://cdn-icons-png.flaticon.com/512/2991/2991108.png",
  "https://cdn-icons-png.flaticon.com/512/2942/2942788.png",
  "https://cdn-icons-png.flaticon.com/512/993/993771.png",
  "https://cdn-icons-png.flaticon.com/512/25/25694.png",
];

/**
 * The 'install' event is fired when the service worker is first installed.
 * We cache all the essential files (the app shell) for offline use.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log("[Service Worker] Precaching App Shell");
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

/**
 * The 'activate' event is fired after installation.
 * It's the perfect place to clean up old, unused caches.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

/**
 * The 'fetch' event intercepts all network requests from the app.
 * We can decide how to respond: from the cache, from the network, or a combination.
 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Strategy for API calls: Network first, fallback to cache.
  // This ensures the user gets the freshest data if online, but still sees something if offline.
  if (
    url.hostname === "opensheet.elk.sh" || // Tetap tangani permintaan Google Sheets API
    event.request.url.includes(
      "https://script.google.com/macros/s/AKfycbw2BF-XhU-19kSKn5Wpi3ZE7rrhwsT3YqB6XUx1uYvX1XymdZjbjaF1VbMXIdsTMPGV/exec"
    ) // URL Web App Anda
  ) {
    event.respondWith(
      // Tambahkan pengecekan metode GET disini
      (event.request.method === "GET"
        ? caches
            .match(event.request)
            .then((cachedResponse) => cachedResponse || fetch(event.request))
        : fetch(event.request)
      )
        .then((networkResponse) => {
          // If we get a response, cache it in our dynamic cache and return it.
          return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
            cache.put(event.request.url, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // If the network request fails (user is offline), try to get it from the cache.
          return caches.match(event.request.url);
        })
    );
  } else {
    // Strategy for all other requests: Cache first, fallback to network.
    // This is ideal for static assets that don't change often.
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchRes) => {
            return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
              cache.put(event.request.url, fetchRes.clone());
              return fetchRes;
            });
          })
        );
      })
    );
  }
});
