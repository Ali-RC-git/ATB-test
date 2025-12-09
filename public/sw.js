// Service Worker for ATB Matchmaking PWA
const CACHE_NAME = "atb-matchmaking-v1";
const urlsToCache = ["/", "/manifest.json", "/icon.svg"];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
  console.log("Service Worker installed (caching enabled)");
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
  console.log("Service Worker activated (caching enabled)");
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Return offline page if available for document requests
            if (event.request.destination === "document") {
              return caches.match("/").then((cachedResponse) => {
                return (
                  cachedResponse || new Response("Offline", { status: 503 })
                );
              });
            }
            // For other requests, return a proper error response
            return new Response("Network error", { status: 503 });
          });
      })
      .catch(() => {
        // Fallback: return offline page or error response
        if (event.request.destination === "document") {
          return caches.match("/").then((cachedResponse) => {
            return cachedResponse || new Response("Offline", { status: 503 });
          });
        }
        return new Response("Network error", { status: 503 });
      })
  );
});

// Push notification for matchmaking updates
// Handles both FCM (Firebase Cloud Messaging) and standard push notifications
self.addEventListener("push", (event) => {
  console.log("📨 Push event received:", event);

  if (!event.data) {
    console.warn("Push event has no data");
    return;
  }

  let notificationData;
  let notificationTitle = "ATB Matchmaking";
  let notificationBody = "New match or message from ATB Matchmaking!";
  let notificationIcon = "/heart.png";
  let notificationUrl = "/";

  try {
    // Parse push data
    const data = event.data.json();
    console.log("📦 Parsed push data:", data);

    // Handle FCM format (Firebase Cloud Messaging)
    if (data.notification) {
      // FCM notification format
      notificationTitle = data.notification.title || notificationTitle;
      notificationBody = data.notification.body || notificationBody;
      notificationIcon = data.notification.icon || notificationIcon;
      notificationData = data.data || {};
      notificationUrl = data.data?.url || data.fcmOptions?.link || "/";
    } else if (data.data) {
      // FCM data-only message format
      notificationTitle = data.data.title || notificationTitle;
      notificationBody =
        data.data.body || data.data.message || notificationBody;
      notificationIcon = data.data.icon || notificationIcon;
      notificationData = data.data;
      notificationUrl = data.data.url || "/";
    } else {
      // Standard push notification format (backward compatibility)
      notificationTitle = data.title || notificationTitle;
      notificationBody = data.body || notificationBody;
      notificationIcon = data.icon || notificationIcon;
      notificationData = data;
      notificationUrl = data.url || "/";
    }
  } catch (error) {
    // If JSON parsing fails, try text
    try {
      const text = event.data.text();
      notificationBody = text || notificationBody;
      console.log("📝 Push data as text:", text);
    } catch (e) {
      console.error("❌ Error parsing push data:", e);
    }
  }

  const options = {
    body: notificationBody,
    icon: notificationIcon,
    badge: "/heart.png",
    vibrate: [200, 100, 200],
    data: {
      url: notificationUrl,
      timestamp: Date.now(),
      ...notificationData,
    },
    requireInteraction: false,
    tag: "atb-matchmaking-notification",
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
    self.registration
      .showNotification(notificationTitle, options)
      .then(() => {
        console.log("✅ Notification shown:", notificationTitle);
      })
      .catch((error) => {
        console.error("❌ Error showing notification:", error);
      })
  );
});

// Handle notification clicks (works on all platforms including iOS/Mac)
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
        // Open new window if app is closed (works on iOS/Mac when app is installed)
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});

// Removed automatic background notifications
// Only FCM push notifications from backend are handled via the "push" event listener above

// Message handler from client (minimal - only for FCM push notifications)
// Automatic background notifications removed - only FCM push notifications are used
self.addEventListener("message", (event) => {
  if (!event.data) return;

  // Keep service worker alive if needed
  if (event.data.type === "KEEP_ALIVE") {
    console.log("💓 Keep-alive ping received");
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: "ALIVE" });
    }
    return;
  }

  // All notifications are now sent via FCM push from the backend
  // No automatic intervals or background notifications
});

// Service worker activation - ready to receive FCM push notifications
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      console.log(
        "✅ Service Worker activated - Ready for FCM push notifications"
      );
      // No automatic background notifications - only FCM push from backend
    })()
  );
});

// iOS-specific: Handle fetch events to keep service worker alive
// iOS suspends service workers aggressively, so we need to keep it active
self.addEventListener("fetch", (event) => {
  // For iOS, we want to keep the service worker active
  // The existing fetch handler already handles caching
  // This is just to ensure iOS keeps the service worker alive
  if (isIOS()) {
    // Log fetch to keep service worker active (iOS optimization)
    console.log("📡 Fetch event (keeping service worker alive on iOS)");
  }
});
