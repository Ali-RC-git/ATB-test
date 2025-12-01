// Service Worker for ATB Matchmaking PWA
// CACHING DISABLED FOR DEVELOPMENT - Uncomment to enable caching
// const CACHE_NAME = 'atb-matchmaking-v1';
// const urlsToCache = [
//   '/',
//   '/manifest.json',
//   '/icon-192.png',
//   '/icon-512.png'
// ];

// Install event - cache resources (DISABLED)
self.addEventListener("install", (event) => {
  // CACHING DISABLED - Always fetch from network
  // event.waitUntil(
  //   caches.open(CACHE_NAME)
  //     .then((cache) => {
  //       console.log('Opened cache');
  //       return cache.addAll(urlsToCache);
  //     })
  //     .then(() => self.skipWaiting())
  // );
  self.skipWaiting(); // Skip waiting without caching
  console.log("Service Worker installed (caching disabled)");
});

// Activate event - clean up old caches (DISABLED)
self.addEventListener("activate", (event) => {
  // CACHING DISABLED - Just claim clients without cache cleanup
  // event.waitUntil(
  //   caches.keys().then((cacheNames) => {
  //     return Promise.all(
  //       cacheNames.map((cacheName) => {
  //         if (cacheName !== CACHE_NAME) {
  //           console.log('Deleting old cache:', cacheName);
  //           return caches.delete(cacheName);
  //         }
  //       })
  //     );
  //   }).then(() => self.clients.claim())
  // );
  event.waitUntil(self.clients.claim());
  console.log("Service Worker activated (caching disabled)");
});

// Fetch event - serve from cache, fallback to network (DISABLED - Always fetch from network)
self.addEventListener("fetch", (event) => {
  // CACHING DISABLED - Always fetch from network for instant updates
  // event.respondWith(
  //   caches.match(event.request)
  //     .then((response) => {
  //       // Return cached version or fetch from network
  //       return response || fetch(event.request).then((response) => {
  //         // Don't cache non-GET requests or non-successful responses
  //         if (event.request.method !== 'GET' || !response || response.status !== 200) {
  //           return response;
  //         }
  //
  //         // Clone the response
  //         const responseToCache = response.clone();
  //
  //         caches.open(CACHE_NAME).then((cache) => {
  //           cache.put(event.request, responseToCache);
  //         });
  //
  //         return response;
  //       });
  //     })
  //     .catch(() => {
  //       // Return offline page if available
  //       if (event.request.destination === 'document') {
  //         return caches.match('/');
  //       }
  //     })
  // );

  // Always fetch from network - no caching
  event.respondWith(fetch(event.request));
});

// Push notification for matchmaking updates
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "New match or message from ATB Matchmaking!",
    icon: "https://ui-avatars.com/api/?name=ATB&background=8b5cf6&color=fff&size=192&bold=true&font-size=0.6",
    badge:
      "https://ui-avatars.com/api/?name=ATB&background=8b5cf6&color=fff&size=192&bold=true&font-size=0.6",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/",
      timestamp: Date.now(),
    },
    requireInteraction: true, // Keep notification visible
    actions: [
      {
        action: "open",
        title: "Open App",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "ATB Matchmaking", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes("/") && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window if app is closed
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});

// Periodic sync for background updates (experimental)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "background-notification") {
    event.waitUntil(sendBackgroundNotification());
  }
});

async function sendBackgroundNotification() {
  const clients = await self.clients.matchAll();
  if (clients.length === 0) {
    // App is closed, can send notification
    self.registration.showNotification("ATB Matchmaking", {
      body: "💜 New matches waiting for you! Come back to connect.",
      icon: "https://ui-avatars.com/api/?name=ATB&background=8b5cf6&color=fff&size=192&bold=true&font-size=0.6",
      tag: "background-notification",
    });
  }
}
