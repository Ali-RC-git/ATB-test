// Firebase configuration and initialization
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from 'firebase/messaging';

// Firebase configuration
// Replace these values with your Firebase project configuration
// Get these from: Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
  // VAPID key is required for web push notifications
  // Get this from: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "YOUR_VAPID_KEY"
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export const initializeFirebase = (): FirebaseApp | null => {
  if (typeof window === 'undefined') {
    // Server-side: Firebase can't be initialized
    return null;
  }

  if (app) {
    return app;
  }

  // Check if Firebase is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    try {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      return null;
    }
  }

  return app;
};

export const getFirebaseMessaging = (): Messaging | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (messaging) {
    return messaging;
  }

  if (!app) {
    app = initializeFirebase();
  }

  if (!app) {
    return null;
  }

  try {
    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error('❌ Firebase Messaging initialization error:', error);
    return null;
  }
};

// Get FCM registration token
export const getFCMToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const messagingInstance = getFirebaseMessaging();
  if (!messagingInstance) {
    console.error('Firebase Messaging not available');
    return null;
  }

  try {
    // Request notification permission if not already granted
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Get FCM token
    const token = await getToken(messagingInstance, {
      vapidKey: firebaseConfig.vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('✅ FCM Registration token:', token);
      return token;
    } else {
      console.warn('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    console.error('❌ An error occurred while retrieving token:', error);
    return null;
  }
};

// Listen for foreground messages (when app is open)
export const onMessageListener = (): Promise<MessagePayload> => {
  const messagingInstance = getFirebaseMessaging();
  if (!messagingInstance) {
    return Promise.reject('Firebase Messaging not available');
  }

  return new Promise((resolve) => {
    onMessage(messagingInstance, (payload) => {
      console.log('📨 Message received in foreground:', payload);
      resolve(payload);
    });
  });
};

// Export Firebase config for service worker
export const getFirebaseConfig = () => firebaseConfig;
