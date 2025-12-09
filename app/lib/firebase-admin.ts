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

  try {
    let serviceAccount: any = null;

    // Priority 1: Environment variable (for production/Vercel)
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      try {
        console.log('🔧 Loading service account from environment variable');
        serviceAccount = JSON.parse(serviceAccountJson);
        console.log('✅ Service account loaded from FIREBASE_SERVICE_ACCOUNT_JSON');
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', parseError);
        // Continue to try file method
      }
    }

    // Priority 2: Load from file (for local development)
    if (!serviceAccount) {
      const fs = require('fs');
      const path = require('path');
      const serviceAccountPath = path.join(process.cwd(), 'app', 'lib', 'serviceAccountKey.json');

      if (fs.existsSync(serviceAccountPath)) {
        console.log('🔧 Loading service account from file:', serviceAccountPath);
        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
        serviceAccount = JSON.parse(fileContent);
        console.log('✅ Service account loaded from file');
      } else {
        console.error('❌ Service account file not found at:', serviceAccountPath);
        console.log('💡 For production, set FIREBASE_SERVICE_ACCOUNT_JSON environment variable');
        console.log('💡 For local development, place serviceAccountKey.json in app/lib folder');
        return null;
      }
    }

    // Initialize with the service account
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });

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
