// Firebase Admin SDK initialization
// This is used on the server-side to send push notifications

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

let adminApp: App | null = null;
let adminMessaging: Messaging | null = null;

// Load service account from file (runtime only, not during build)
function loadServiceAccountFromFile(): any | null {
  if (typeof window !== 'undefined') {
    return null; // Client-side, can't load files
  }

  try {
    // Use dynamic import to avoid build-time analysis
    const fs = require('fs');
    const path = require('path');
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    // File doesn't exist or can't be read - this is OK
    return null;
  }
  
  return null;
}

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
    let serviceAccount: any = null;

    if (serviceAccountJson) {
      // Use JSON string from environment variable
      serviceAccount = JSON.parse(serviceAccountJson);
    } else if (serviceAccountPath) {
      // Use file path from environment
      try {
        const fs = require('fs');
        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
        serviceAccount = JSON.parse(fileContent);
      } catch (error) {
        console.error('❌ Failed to load service account from path:', serviceAccountPath);
        return null;
      }
    } else {
      // Try to load from default location (runtime only)
      serviceAccount = loadServiceAccountFromFile();
      if (!serviceAccount) {
        // No service account found - this is OK, will return null
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
