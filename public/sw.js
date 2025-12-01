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
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return (
          response ||
          fetch(event.request).then((response) => {
            // Don't cache non-GET requests or non-successful responses
            if (
              event.request.method !== "GET" ||
              !response ||
              response.status !== 200
            ) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
        );
      })
      .catch(() => {
        // Return offline page if available
        if (event.request.destination === "document") {
          return caches.match("/");
        }
      })
  );
});

// Push notification for matchmaking updates
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "New match or message from ATB Matchmaking!",
    icon: "https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB",
    badge: "https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB",
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

// Periodic sync for background updates (experimental)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "background-notification") {
    event.waitUntil(sendBackgroundNotification());
  }
});

async function sendBackgroundNotification() {
  try {
    const iosDevice = isIOS();
    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    // iOS-specific: More lenient check (iOS may not report clients correctly)
    // For iOS, send notification if no visible clients OR if it's been a while
    let shouldSend = false;

    if (iosDevice) {
      // iOS: Send if no clients OR if all clients are hidden
      const hasVisibleClients = clients.some((client) => {
        return client.visibilityState === "visible";
      });
      shouldSend = !hasVisibleClients || clients.length === 0;
    } else {
      // Other platforms: Only send if app is truly closed
      const hasVisibleClients = clients.some((client) => {
        if (client.visibilityState === "visible") {
          return true;
        }
        if ("focused" in client && client.focused) {
          return true;
        }
        return false;
      });
      shouldSend = !hasVisibleClients || clients.length === 0;
    }

    if (shouldSend) {
      // App is closed or in background, send notification
      const notifications = [
        "💜 New matches waiting for you! Come back to connect.",
        "💬 You have unread messages from counselors.",
        "⭐ Someone viewed your profile while you were away.",
        "🎯 New connection requests are waiting!",
        "🔥 Don't miss out on potential matches!",
        "✨ You have new activity on your profile!",
        "💼 A counselor is interested in connecting with you.",
        "📨 New message from a potential match!",
        "🌟 Your profile got a new like!",
      ];

      const randomMessage =
        notifications[Math.floor(Math.random() * notifications.length)];

      // Send notification - this works even when app is closed
      await self.registration.showNotification("ATB Matchmaking", {
        body: randomMessage,
        icon: "https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB",
        badge: "https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB",
        tag: "background-notification-" + Date.now(), // Unique tag to allow multiple notifications
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: {
          url: "/",
          timestamp: Date.now(),
        },
      });

      console.log(
        "📱 Background notification sent (app closed/background) - " +
          randomMessage
      );
    } else {
      console.log(
        "ℹ️ App is open and visible, skipping background notification"
      );
    }
  } catch (error) {
    console.error("Error sending background notification:", error);
    // Even if there's an error, try to send a simple notification
    try {
      await self.registration.showNotification("ATB Matchmaking", {
        body: "💜 New activity waiting for you!",
        icon: "https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB",
        tag: "background-error",
      });
    } catch (e) {
      console.error("Failed to send fallback notification:", e);
    }
  }
}

// Background sync for periodic notifications (works when app is closed)
// Works on iOS, Mac, Android, and Desktop
self.addEventListener("sync", (event) => {
  if (
    event.tag === "background-sync" ||
    event.tag === "background-notification-sync"
  ) {
    event.waitUntil(sendBackgroundNotification());
  }
});

// Message handler from client to start background notifications
let backgroundNotificationInterval = null;
let lastNotificationTime = 0;
const MIN_NOTIFICATION_INTERVAL = 30000; // Minimum 30 seconds between notifications

// Detect if running on iOS
function isIOS() {
  return /iPhone|iPad|iPod/.test(self.navigator.userAgent);
}

self.addEventListener("message", (event) => {
  if (!event.data) return;

  // iOS: Keep service worker alive with ping messages
  if (event.data.type === "KEEP_ALIVE") {
    console.log("💓 Keep-alive ping received (iOS)");
    // Respond to keep service worker active
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: "ALIVE" });
    }
    return;
  }

  if (event.data.type === "START_BACKGROUND_NOTIFICATIONS") {
    const interval = event.data.interval || (isIOS() ? 30000 : 60000); // iOS: 30s, others: 60s

    // Clear existing interval if any
    if (backgroundNotificationInterval) {
      clearInterval(backgroundNotificationInterval);
    }

    // Start periodic background notification checking
    // This runs in the service worker, so it works even when app is closed
    backgroundNotificationInterval = setInterval(async () => {
      const now = Date.now();
      // Throttle notifications (especially important for iOS)
      if (now - lastNotificationTime >= MIN_NOTIFICATION_INTERVAL) {
        await sendBackgroundNotification();
        lastNotificationTime = now;
      }
    }, interval);

    console.log(
      "✅ Background notifications started in service worker (interval: " +
        interval +
        "ms, iOS: " +
        isIOS() +
        ")"
    );

    // Send immediate test notification
    sendBackgroundNotification();
    lastNotificationTime = Date.now();
  }

  if (event.data.type === "STOP_BACKGROUND_NOTIFICATIONS") {
    if (backgroundNotificationInterval) {
      clearInterval(backgroundNotificationInterval);
      backgroundNotificationInterval = null;
      console.log("⏹️ Background notifications stopped");
    }
  }

  if (event.data.type === "TEST_BACKGROUND_NOTIFICATION") {
    event.waitUntil(sendBackgroundNotification());
  }
});

// Auto-start background notifications when service worker activates
// This ensures notifications work even if client doesn't send message
// Note: This runs in the service worker, so it continues even when app is closed
// iOS-specific: Uses shorter intervals and more aggressive checking
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const iosDevice = isIOS();
      console.log(
        "✅ Service Worker activated - background notifications ready (iOS: " +
          iosDevice +
          ")"
      );

      // Wait a bit for service worker to be ready
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Start background notification checker
      // This interval runs in service worker context, so it works when app is closed
      if (!backgroundNotificationInterval) {
        console.log(
          "🔄 Starting background notification checker in service worker"
        );

        // iOS needs more frequent checks due to service worker suspension
        const checkInterval = iosDevice ? 30000 : 60000; // iOS: 30s, others: 60s

        // Initial check after shorter delay for iOS
        setTimeout(
          async () => {
            await sendBackgroundNotification();
            lastNotificationTime = Date.now();
          },
          iosDevice ? 10000 : 15000
        );

        // Then check periodically
        backgroundNotificationInterval = setInterval(async () => {
          const now = Date.now();
          // Throttle to prevent too many notifications
          if (now - lastNotificationTime >= MIN_NOTIFICATION_INTERVAL) {
            await sendBackgroundNotification();
            lastNotificationTime = now;
          }
        }, checkInterval);
      }
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
