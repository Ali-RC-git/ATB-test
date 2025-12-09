// Push Notification Service for ATB Matchmaking
// This service handles background notifications that work even when app is closed
// Now integrated with Firebase Cloud Messaging (FCM) for Google push notifications

import { 
  initializeFirebase, 
  getFCMToken, 
  onMessageListener,
  getFirebaseMessaging 
} from '../lib/firebase';

export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private fcmToken: string | null = null;
  private fcmInitialized: boolean = false;

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

    // Initialize Firebase Cloud Messaging
    try {
      initializeFirebase();
      const messaging = getFirebaseMessaging();
      if (messaging) {
        this.fcmInitialized = true;
        console.log('✅ Firebase Cloud Messaging initialized');
        
        // Set up foreground message listener
        this.setupForegroundMessageListener();
      }
    } catch (error) {
      console.warn('Firebase initialization failed, continuing with basic notifications:', error);
      this.fcmInitialized = false;
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
      
      // No automatic background notifications - only FCM push notifications from backend
      
      return true;
    } catch (error) {
      console.error('Failed to initialize push service:', error);
      // Still return true for iOS/Mac - basic notifications can work
      return (isIOSDevice || isMacDevice);
    }
  }

  // Set up listener for foreground FCM messages
  private setupForegroundMessageListener(): void {
    if (!this.fcmInitialized) return;

    onMessageListener()
      .then((payload) => {
        console.log('📨 FCM Message received in foreground:', payload);
        
        // Show notification for foreground messages
        const notificationTitle = payload.notification?.title || 'ATB Matchmaking';
        const notificationBody = payload.notification?.body || 'You have a new notification';
        const notificationIcon = payload.notification?.icon || '/heart.png';
        
        if (this.registration) {
          this.registration.showNotification(notificationTitle, {
            body: notificationBody,
            icon: notificationIcon,
            badge: '/heart.png',
            vibrate: [200, 100, 200],
            data: {
              ...payload.data,
              url: payload.data?.url || payload.fcmOptions?.link || '/',
            },
            tag: 'fcm-foreground-notification',
          } as NotificationOptions);
        } else if (Notification.permission === 'granted') {
          new Notification(notificationTitle, {
            body: notificationBody,
            icon: '/heart.png',
          });
        }
      })
      .catch((error) => {
        console.error('Error in FCM message listener:', error);
      });
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
      
      // Initialize Firebase and get FCM token if available
      if (this.fcmInitialized || getFirebaseMessaging()) {
        try {
          this.fcmToken = await getFCMToken();
          if (this.fcmToken) {
            console.log('✅ FCM Token obtained:', this.fcmToken);
            // Automatically register token with backend
            await this.sendTokenToServer(this.fcmToken);
          }
        } catch (error) {
          console.warn('Failed to get FCM token:', error);
        }
      }
      
      // For iOS/Mac Safari, notifications work through service worker when app is installed
      if (isIOSDevice || (isMacDevice && isSafariBrowser)) {
        console.log('📱 iOS/Mac Safari: Notifications will work when app is added to home screen');
        
        // Try to initialize service worker if available
        if ('serviceWorker' in navigator) {
          try {
            this.registration = await navigator.serviceWorker.ready;
            // No automatic background notifications - only FCM push notifications
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
        console.log('✅ Already subscribed to push notifications');
        return this.subscription;
      }

      // If FCM is initialized, FCM handles the subscription automatically
      // The FCM token is what you need for sending push notifications
      if (this.fcmInitialized && this.fcmToken) {
        console.log('✅ Using FCM for push notifications');
        return null; // FCM handles subscription internally
      }

      // Fallback: Try to create standard push subscription
      // Note: This requires a VAPID key for production
      try {
        this.subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
        });
        console.log('✅ Standard push subscription created:', this.subscription);
        return this.subscription;
      } catch (error) {
        // If subscription fails, we'll use service worker notifications
        // which work without VAPID keys
        console.log('Push subscription not supported, using service worker notifications');
        return null;
      }
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      // Fallback: Use service worker notifications
      return null;
    }
  }

  // Get FCM token (for sending to backend server)
  async getFCMToken(): Promise<string | null> {
    if (!this.fcmInitialized) {
      // Try to initialize Firebase
      initializeFirebase();
      const messaging = getFirebaseMessaging();
      if (messaging) {
        this.fcmInitialized = true;
        this.setupForegroundMessageListener();
      }
    }

    if (this.fcmToken) {
      return this.fcmToken;
    }

    try {
      this.fcmToken = await getFCMToken();
      return this.fcmToken;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  // Send FCM token to your backend server
  // Automatically registers the token so it can receive push notifications
  async sendTokenToServer(token: string, userId?: string): Promise<void> {
    try {
      const deviceInfo = typeof window !== 'undefined' 
        ? `${navigator.userAgent} - ${navigator.platform}`
        : 'Unknown device';

      const response = await fetch('/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          userId: userId,
          deviceInfo: deviceInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ FCM token registered successfully', {
          tokenCount: data.tokenCount,
        });
      } else {
        const error = await response.json();
        console.error('Failed to register FCM token:', error.error);
      }
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  }


  // Removed automatic background notification checker
  // Notifications are now only sent via FCM push notifications from the backend

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
        icon: '/heart.png',
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
      icon: '/heart.png',
      badge: '/heart.png',
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
          icon: '/heart.png',
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
      icon: '/heart.png',
      badge: '/heart.png',
      tag: 'push-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: {
        url: '/',
        timestamp: Date.now(),
      },
    } as NotificationOptions);
  }

  // Stop method (no longer needed for automatic notifications, but kept for compatibility)
  stop(): void {
    // No automatic notifications to stop - all notifications are FCM push from backend
  }

  // Get subscription info
  async getSubscription(): Promise<PushSubscription | null> {
    return this.subscription;
  }

  // Check if FCM is initialized
  isFCMInitialized(): boolean {
    return this.fcmInitialized;
  }

  // Get current FCM token
  getCurrentFCMToken(): string | null {
    return this.fcmToken;
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();

