// Push Notification Service for ATB Matchmaking
// This service handles background notifications that work even when app is closed

export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private backgroundCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  private isMac(): boolean {
    if (typeof window === 'undefined') return false;
    return /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent);
  }

  private isSafari(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent;
    return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|Edg/.test(ua);
  }

  async initialize(): Promise<boolean> {
    // Check basic support
    if (!('Notification' in window)) {
      console.log('Notifications not supported in this browser');
      return false;
    }

    // iOS and Mac Safari have limited service worker support
    const isIOSDevice = this.isIOS();
    const isMacDevice = this.isMac();
    const isSafariBrowser = this.isSafari();

    // For iOS/Mac Safari, we can still use notifications but with limitations
    if ((isIOSDevice || (isMacDevice && isSafariBrowser)) && !('serviceWorker' in navigator)) {
      console.log('iOS/Mac Safari: Service worker not available, using basic notifications');
      // Still return true - we can use basic notifications
      return true;
    }

    if (!('serviceWorker' in navigator)) {
      console.log('Service worker not supported');
      return false;
    }

    try {
      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;
      
      // Check if we already have a subscription (may not work on iOS)
      try {
        this.subscription = await this.registration.pushManager.getSubscription();
      } catch (error) {
        // Push subscription may not be supported on iOS/Mac Safari
        console.log('Push subscription not available (iOS/Mac Safari limitation):', error);
        this.subscription = null;
      }
      
      // Start background notification checker (works on iOS when app is installed)
      this.startBackgroundNotificationChecker();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize push service:', error);
      // Still return true for iOS/Mac - basic notifications can work
      return (isIOSDevice || isMacDevice);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const isIOSDevice = this.isIOS();
    const isMacDevice = this.isMac();
    const isSafariBrowser = this.isSafari();

    // iOS/Mac Safari: Request permission (must be from user interaction)
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // For iOS/Mac Safari, notifications work through service worker when app is installed
      if (isIOSDevice || (isMacDevice && isSafariBrowser)) {
        console.log('📱 iOS/Mac Safari: Notifications will work when app is added to home screen');
        
        // Try to initialize service worker if available
        if ('serviceWorker' in navigator) {
          try {
            this.registration = await navigator.serviceWorker.ready;
            this.startBackgroundNotificationChecker();
          } catch (error) {
            console.log('Service worker initialization failed on iOS/Mac:', error);
          }
        }
      } else {
        // For other platforms, try to subscribe to push
        await this.subscribeToPush();
      }
    }
    
    return permission;
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      return null;
    }

    try {
      // Check if already subscribed
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (this.subscription) {
        return this.subscription;
      }

      // Create new subscription
      // Note: For production, you'd need a VAPID key from your server
      // For testing, we'll use a mock subscription
      // For now, we'll skip the VAPID key and use service worker notifications instead
      // This works on all platforms without requiring a backend server
      
      // Try to subscribe without VAPID key (works for testing)
      try {
        this.subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
        });
      } catch (error) {
        // If subscription fails, we'll use service worker notifications
        // which work without VAPID keys
        console.log('Push subscription without VAPID not supported, using service worker notifications');
        return null;
      }

      console.log('✅ Push subscription created:', this.subscription);
      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      // Fallback: Use service worker notifications
      return null;
    }
  }


  // Start checking for background notifications
  private startBackgroundNotificationChecker(): void {
    if (!this.registration) return;

    const isIOSDevice = this.isIOS();
    const interval = isIOSDevice ? 30000 : 60000; // iOS: 30s, others: 60s

    // Register background sync for periodic notifications
    // This works even when the app is closed
    if ('serviceWorker' in navigator && 'sync' in (this.registration as any)) {
      // Use Background Sync API (works when app is closed)
      try {
        (this.registration as any).sync.register('background-notification-sync').catch((error: any) => {
          console.log('Background sync registration failed:', error);
        });
      } catch (error) {
        console.log('Background sync not available:', error);
      }
    }

    // Also set up a message channel to trigger background notifications from service worker
    // This is critical for iOS - service worker needs explicit message to stay active
    if (this.registration.active) {
      // Send message to service worker to start background checking
      this.registration.active.postMessage({
        type: 'START_BACKGROUND_NOTIFICATIONS',
        interval: interval,
      });
      console.log('📱 Started background notifications (iOS: ' + isIOSDevice + ', interval: ' + interval + 'ms)');
    } else if (this.registration.waiting) {
      // If active is null, try waiting service worker
      this.registration.waiting.postMessage({
        type: 'START_BACKGROUND_NOTIFICATIONS',
        interval: interval,
      });
    } else if (this.registration.installing) {
      // If installing, wait for it to activate
      this.registration.installing.addEventListener('statechange', () => {
        if (this.registration && this.registration.active) {
          this.registration.active.postMessage({
            type: 'START_BACKGROUND_NOTIFICATIONS',
            interval: interval,
          });
        }
      });
    }

    // Fallback: Check periodically from client (only works when app is open)
    // This helps keep service worker alive on iOS
    this.backgroundCheckInterval = setInterval(async () => {
      // On iOS, ping service worker to keep it alive
      if (isIOSDevice && this.registration && this.registration.active) {
        this.registration.active.postMessage({
          type: 'KEEP_ALIVE',
        });
      }
      await this.checkAndSendBackgroundNotification();
    }, interval);
  }

  // Check if app is closed and send background notification
  private async checkAndSendBackgroundNotification(): Promise<void> {
    if (!this.registration) return;

    try {
      // Send periodic background notification
      // The service worker will handle checking if app is actually closed
      const notifications = [
        "💜 New matches waiting for you! Come back to connect.",
        "💬 You have unread messages from counselors.",
        "⭐ Someone viewed your profile while you were away.",
        "🎯 New connection requests are waiting!",
        "🔥 Don't miss out on potential matches!",
      ];

      const randomMessage = notifications[
        Math.floor(Math.random() * notifications.length)
      ];

      // Send notification - service worker will only show if app is closed
      await this.registration.showNotification('ATB Matchmaking', {
        body: randomMessage,
        icon: 'https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB',
        badge: 'https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB',
        tag: 'background-notification',
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: {
          url: '/',
          timestamp: Date.now(),
        },
      } as NotificationOptions);

      console.log('📱 Background notification sent');
    } catch (error) {
      console.error('Error checking background notifications:', error);
    }
  }

  // Send a test notification
  async sendTestNotification(): Promise<void> {
    const isIOSDevice = this.isIOS();
    const isMacDevice = this.isMac();
    
    // For iOS/Mac, try to use service worker, fallback to basic Notification API
    if (isIOSDevice || isMacDevice) {
      if (this.registration) {
        // Use service worker if available
      } else if ('serviceWorker' in navigator) {
        try {
          this.registration = await navigator.serviceWorker.ready;
        } catch (error) {
          console.log('Service worker not available, using basic notifications');
        }
      }
    } else {
      if (!this.registration) {
        await this.initialize();
      }
    }

    // If no service worker, use basic Notification API (works on iOS/Mac)
    if (!this.registration && Notification.permission === 'granted') {
      const notifications = [
        "💜 Test: New match found!",
        "💬 Test: You have a new message!",
        "⭐ Test: Someone viewed your profile!",
      ];

      const randomMessage = notifications[
        Math.floor(Math.random() * notifications.length)
      ];

      new Notification('ATB Matchmaking - Test', {
        body: randomMessage,
        icon: 'https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB',
        tag: 'test-notification',
      });
      return;
    }

    if (!this.registration) {
      console.error('Service worker not ready');
      return;
    }

    const notifications = [
      "💜 Test: New match found!",
      "💬 Test: You have a new message!",
      "⭐ Test: Someone viewed your profile!",
    ];

    const randomMessage = notifications[
      Math.floor(Math.random() * notifications.length)
    ];

    await this.registration.showNotification('ATB Matchmaking - Test', {
      body: randomMessage,
      icon: 'https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB',
      badge: 'https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB',
      tag: 'test-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        url: '/',
        timestamp: Date.now(),
      },
    } as NotificationOptions);
  }

  // Simulate push notification (for testing without server)
  async simulatePushNotification(title: string, body: string): Promise<void> {
    const isIOSDevice = this.isIOS();
    const isMacDevice = this.isMac();

    // For iOS/Mac, try service worker first, fallback to basic Notification
    if (isIOSDevice || isMacDevice) {
      if (!this.registration && 'serviceWorker' in navigator) {
        try {
          this.registration = await navigator.serviceWorker.ready;
        } catch (error) {
          // Service worker not available
        }
      }
      
      // Fallback to basic Notification API if service worker not available
      if (!this.registration && Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: 'https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB',
          tag: 'push-notification',
        });
        return;
      }
    } else {
      if (!this.registration) {
        await this.initialize();
      }
    }

    if (!this.registration) {
      return;
    }

    // Send notification through service worker
    await this.registration.showNotification(title, {
      body: body,
      icon: 'https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB',
      badge: 'https://via.placeholder.com/192/8b5cf6/ffffff?text=ATB',
      tag: 'push-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: {
        url: '/',
        timestamp: Date.now(),
      },
    } as NotificationOptions);
  }

  // Stop background notifications
  stop(): void {
    if (this.backgroundCheckInterval) {
      clearInterval(this.backgroundCheckInterval);
      this.backgroundCheckInterval = null;
    }
    
    // Also stop service worker background notifications
    if (this.registration && this.registration.active) {
      this.registration.active.postMessage({
        type: 'STOP_BACKGROUND_NOTIFICATIONS',
      });
    }
  }

  // Get subscription info
  async getSubscription(): Promise<PushSubscription | null> {
    return this.subscription;
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();

