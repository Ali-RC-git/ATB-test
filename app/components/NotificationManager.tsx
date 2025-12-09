'use client';

import { useState, useEffect } from 'react';
import { Bell, TestTube, RotateCcw, Zap, Moon, X, ChevronDown } from 'lucide-react';
import { pushNotificationService } from './PushNotificationService';

export default function NotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    const initNotifications = async () => {
      // Check if notifications are supported (works on iOS, Mac, Android, Desktop)
      if ('Notification' in window) {
        setIsSupported(true);
        setPermission(Notification.permission);

        // Check for service worker support (required for background notifications)
        if ('serviceWorker' in navigator) {
          if ('periodicSync' in navigator) {
            setBackgroundMode(true);
          }

          // Initialize push notification service
          const initialized = await pushNotificationService.initialize();
          if (initialized) {
            // Check for FCM token (Firebase Cloud Messaging)
            const fcmToken = await pushNotificationService.getFCMToken();
            // Also check for standard push subscription
            const subscription = await pushNotificationService.getSubscription();
            // Push is enabled if we have FCM token, subscription, or permission is granted
            setPushEnabled(!!fcmToken || !!subscription || Notification.permission === 'granted');

            if (fcmToken) {
              console.log('✅ FCM Token available:', fcmToken.substring(0, 20) + '...');
              // Automatically register token with backend
              await pushNotificationService.sendTokenToServer(fcmToken);
            }
          }
        } else {
          // iOS/Mac Safari without service worker - basic notifications still work
          setPushEnabled(Notification.permission === 'granted');
        }
      }
    };

    initNotifications();
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    try {
      // Request notification permission
      const result = await pushNotificationService.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setIsEnabled(true);

        // Check for FCM token after permission is granted
        const fcmToken = await pushNotificationService.getFCMToken();
        const subscription = await pushNotificationService.getSubscription();
        setPushEnabled(!!fcmToken || !!subscription || true);

        if (fcmToken) {
          console.log('✅ FCM Token obtained:', fcmToken.substring(0, 20) + '...');
          // Automatically register token with backend
          await pushNotificationService.sendTokenToServer(fcmToken);
        }

        // No automatic notifications - only manual via send button

        // Enable background notifications
        if (backgroundMode && 'periodicSync' in navigator) {
          try {
            // @ts-ignore
            await navigator.periodicSync.register('background-notification', {
              minInterval: 24 * 60 * 60 * 1000,
            });
          } catch (error) {
            console.log('Periodic sync not supported:', error);
          }
        }

        console.log('✅ Notifications enabled - will work even when app is closed');

        // Ensure background notifications are started in service worker
        // iOS needs shorter intervals and more frequent pings
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
            const interval = isIOSDevice ? 30000 : 60000; // iOS: 30s, others: 60s

            if (registration.active) {
              registration.active.postMessage({
                type: 'START_BACKGROUND_NOTIFICATIONS',
                interval: interval,
              });
              console.log('✅ Background notifications started (iOS: ' + isIOSDevice + ')');
            }

            // iOS: Set up keep-alive ping to prevent service worker suspension
            if (isIOSDevice) {
              setInterval(async () => {
                if (registration.active) {
                  registration.active.postMessage({
                    type: 'KEEP_ALIVE',
                  });
                }
              }, 20000); // Ping every 20 seconds on iOS
            }
          } catch (error) {
            console.log('Failed to start background notifications:', error);
          }
        }
      }
    } catch (error) {
      console.log('Permission request failed:', error);
    }
  };

  const sendTestNotification = async () => {
    // Send a test notification via FCM (Firebase Cloud Messaging)
    // This will be sent through the backend API
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '🔔 Test Notification',
          body: 'This is a test notification sent via Firebase Cloud Messaging!',
          data: {
            url: '/',
            type: 'test',
            timestamp: Date.now().toString(),
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('✅ Test notification sent:', data);
      } else {
        console.error('❌ Failed to send test notification:', data);
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  };

  // Removed automatic background notifications
  // Notifications are now only sent manually via the send button using FCM

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const closeManager = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Cleanup on unmount (no intervals to clean up anymore)
  useEffect(() => {
    return () => {
      // No automatic intervals - notifications are only sent manually
    };
  }, []);

  // Always show the button, even if notifications aren't supported yet
  // This ensures users can see and interact with the notification feature

  // Minimized state - just show a small bell icon
  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-[9999]">
        <button
          onClick={toggleMinimize}
          className="bg-white border border-gray-200 rounded-full shadow-xl p-3 hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
          aria-label="Open notification settings"
          title="Notification Settings"
        >
          <Bell className={`w-5 h-5 ${isEnabled ? 'text-green-500' : 'text-gray-500'}`} />
        </button>
      </div>
    );
  }

  // Closed state - show small toggle button
  if (!isOpen) {
    return (
      <div className="fixed top-4 right-4 z-[9999]">
        <button
          onClick={toggleOpen}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-xl p-3 hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-110 active:scale-95"
          aria-label="Open notification settings"
          title="Notification Settings"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Open state - show full manager
  return (
    <div className="fixed top-4 right-4 z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl max-w-xs w-full mx-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-900" />
          <h3 className="font-bold text-gray-900">Notifications</h3>
          {isEnabled && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMinimize}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={closeManager}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!isSupported && (
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Notifications are not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.
            </p>
            <button
              onClick={closeManager}
              className="w-full bg-gray-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        )}

        {isSupported && permission === 'default' && (
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Enable notifications to get updates even when the app is closed, just like Instagram, Facebook, or WhatsApp.
            </p>
            {/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <strong>📱 iOS/Mac Note:</strong> For best results, add this app to your home screen. Notifications work on iOS and Mac Safari when the app is installed.
              </div>
            )}
            {backgroundMode && (
              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                <Zap className="w-3 h-3" />
                Background mode available
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={closeManager}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={requestPermission}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors hover:from-purple-600 hover:to-pink-600"
              >
                Enable
              </button>
            </div>
          </div>
        )}

        {isSupported && permission === 'granted' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-green-600 text-sm font-medium flex items-center gap-1">
                <Bell className="w-4 h-4" />
                Notifications enabled
              </p>
              {backgroundMode && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Moon className="w-3 h-3" />
                  Background
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                Notifications are enabled. You'll receive push notifications when sent from the backend.
              </p>

              <button
                onClick={sendTestNotification}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:from-purple-600 hover:to-pink-600"
              >
                <TestTube className="w-4 h-4" />
                Send Test Notification (FCM)
              </button>

              {pushEnabled && (
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Firebase Cloud Messaging (FCM) enabled - Ready to receive push notifications
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>💡 Notifications are sent manually from the backend via Firebase Cloud Messaging.</p>
                <p className="mt-1">Use the "Send Push Notification" button on the page to send notifications to all devices.</p>
              </div>
            </div>
          </div>
        )}

        {isSupported && permission === 'denied' && (
          <div className="space-y-3">
            <p className="text-red-600 text-sm">
              Notifications are blocked in your browser settings.
            </p>
            <p className="text-gray-500 text-xs">
              Please enable notifications in your browser settings and reload the page.
            </p>
            <div className="flex gap-2">
              <button
                onClick={closeManager}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-blue-600"
              >
                <RotateCcw className="w-4 h-4" />
                Reload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}