'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Play, Square, TestTube, RotateCcw, Zap, Moon, X, ChevronDown } from 'lucide-react';

export default function NotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const notificationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);

      if ('periodicSync' in navigator) {
        setBackgroundMode(true);
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setIsEnabled(true);
        startNotifications();

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
      }
    } catch (error) {
      console.log('Permission request failed:', error);
    }
  };

  const startNotifications = () => {
    if (notificationInterval.current) {
      clearInterval(notificationInterval.current);
    }

    notificationInterval.current = setInterval(() => {
      sendNotification();
    }, 5000);

    setIsEnabled(true);
  };

  const stopNotifications = () => {
    if (notificationInterval.current) {
      clearInterval(notificationInterval.current);
      notificationInterval.current = null;
    }
    setIsEnabled(false);
  };

  const sendNotification = async () => {
    if (!isSupported || permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;

      const notifications = [
        "🛍️ New products just dropped!",
        "🔥 Limited time offers available!",
        "🎉 Special discount for you!",
        "📦 Your cart items are waiting!",
        "⭐ Featured product of the day!"
      ];

      const randomMessage = notifications[Math.floor(Math.random() * notifications.length)];

      await registration.showNotification('ATB Shop', {
        body: randomMessage,
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1024px-Instagram_icon.png',
        badge: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1024px-Instagram_icon.png',
        tag: 'shop-notification',
        requireInteraction: false,
        vibrate: [200, 100, 200],
      } as NotificationOptions);
    } catch (error) {
      console.log('Notification failed:', error);
    }
  };

  const sendTestNotification = () => {
    sendNotification();
  };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (notificationInterval.current) {
        clearInterval(notificationInterval.current);
      }
    };
  }, []);

  if (!isSupported) {
    return null;
  }

  // Minimized state - just show a small bell icon
  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleMinimize}
          className="bg-white border border-gray-200 rounded-full shadow-lg p-3 hover:bg-gray-50 transition-colors"
        >
          <Bell className={`w-5 h-5 ${isEnabled ? 'text-green-500' : 'text-gray-500'}`} />
        </button>
      </div>
    );
  }

  // Closed state - show small toggle button
  if (!isOpen) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleOpen}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg p-3 hover:from-purple-600 hover:to-pink-600 transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Open state - show full manager
  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-w-xs w-full mx-4">
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
        {permission === 'default' && (
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Enable notifications to get updates every 5 seconds
            </p>
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

        {permission === 'granted' && (
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

            <div className="grid grid-cols-2 gap-2">
              {!isEnabled ? (
                <button
                  onClick={startNotifications}
                  className="bg-green-500 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-green-600"
                >
                  <Play className="w-4 h-4" />
                  Start (5s)
                </button>
              ) : (
                <button
                  onClick={stopNotifications}
                  className="bg-red-500 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-red-600"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              )}

              <button
                onClick={sendTestNotification}
                className="bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-blue-600"
              >
                <TestTube className="w-4 h-4" />
                Test
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {isEnabled ? '🟢 Active every 5 seconds' : '⚫ Notifications stopped'}
              </span>
              <button
                onClick={closeManager}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {permission === 'denied' && (
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