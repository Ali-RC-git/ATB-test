// Firebase Admin SDK initialization
// This is used on the server-side to send push notifications

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

let adminApp: App | null = null;
let adminMessaging: Messaging | null = null;

// Initialize Firebase Admin
export function initializeFirebaseAdmin(): App | null {
  // Return existing app if already initialized
  if (adminApp) {
    return adminApp;
  }

  // Check if already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  // Get service account from environment or file
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  try {
    if (serviceAccountJson) {
      // Use JSON string from environment variable
      const serviceAccount = JSON.parse(serviceAccountJson);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else if (serviceAccountPath) {
      // Use file path
      const serviceAccount = require(serviceAccountPath);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // Try to load from default location
      try {
        const serviceAccount = require('../../serviceAccountKey.json');
        adminApp = initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (error) {
        console.error('❌ Firebase Admin: Service account not found');
        console.error('   Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH');
        console.error('   Or place serviceAccountKey.json in project root');
        return null;
      }
    }

    console.log('✅ Firebase Admin initialized successfully');
    return adminApp;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    return null;
  }
}

// Get Firebase Admin Messaging instance
export function getAdminMessaging(): Messaging | null {
  if (adminMessaging) {
    return adminMessaging;
  }

  if (!adminApp) {
    adminApp = initializeFirebaseAdmin();
  }

  if (!adminApp) {
    return null;
  }

  try {
    adminMessaging = getMessaging(adminApp);
    return adminMessaging;
  } catch (error) {
    console.error('❌ Firebase Admin Messaging initialization error:', error);
    return null;
  }
}
