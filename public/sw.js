// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Fetch handling - no caching
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// Push notification with more persistent options
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New update from ATB Shop!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    requireInteraction: true, // Keep notification visible
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ATB Shop', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if app is closed
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Periodic sync for background updates (experimental)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'background-notification') {
    event.waitUntil(sendBackgroundNotification());
  }
});

async function sendBackgroundNotification() {
  const clients = await self.clients.matchAll();
  if (clients.length === 0) {
    // App is closed, can send notification
    self.registration.showNotification('ATB Shop', {
      body: '📢 We miss you! Come back for new products.',
      icon: '/icon-192.png',
      tag: 'background-notification'
    });
  }
}

// public/sw.js
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New update from ATB Shop!',
    icon: 'https://icon-sets.iconify.design/mdi/shopping/192.png',
    badge: 'https://icon-sets.iconify.design/mdi/shopping/192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ATB Shop', options)
  );
});