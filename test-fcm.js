/**
 * Firebase Cloud Messaging Test Script
 * 
 * This script sends a test push notification to your app.
 * 
 * Setup:
 * 1. Install: npm install firebase-admin
 * 2. Get service account key from Firebase Console
 * 3. Save it as serviceAccountKey.json (add to .gitignore!)
 * 4. Replace FCM_TOKEN below with your token from browser console
 * 5. Run: node test-fcm.js
 */

const admin = require('firebase-admin');

// Check if service account file exists
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
  console.error('❌ Error: serviceAccountKey.json not found!');
  console.error('📝 Steps to fix:');
  console.error('   1. Go to Firebase Console → Project Settings → Service Accounts');
  console.error('   2. Click "Generate new private key"');
  console.error('   3. Save the file as "serviceAccountKey.json" in the project root');
  console.error('   4. Add "serviceAccountKey.json" to .gitignore');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

// ⚠️ REPLACE THIS WITH YOUR FCM TOKEN FROM BROWSER CONSOLE
const FCM_TOKEN = process.env.FCM_TOKEN || 'YOUR_FCM_TOKEN_HERE';

if (FCM_TOKEN === 'YOUR_FCM_TOKEN_HERE') {
  console.error('❌ Error: FCM_TOKEN not set!');
  console.error('📝 How to get your FCM token:');
  console.error('   1. Open your app in browser');
  console.error('   2. Open browser console (F12)');
  console.error('   3. Click notification bell icon → Enable notifications');
  console.error('   4. Look for "✅ FCM Registration token:" in console');
  console.error('   5. Copy the token and either:');
  console.error('      - Replace YOUR_FCM_TOKEN_HERE in this file, OR');
  console.error('      - Run: FCM_TOKEN=your_token_here node test-fcm.js');
  process.exit(1);
}

async function sendTestNotification() {
  const message = {
    notification: {
      title: '🎉 Test Notification from Firebase!',
      body: 'This is a test notification sent from a Node.js script. If you see this, FCM is working! 🚀',
    },
    data: {
      url: '/',
      timestamp: Date.now().toString(),
      type: 'test',
      message: 'Test notification sent successfully',
    },
    token: FCM_TOKEN,
    // Optional: Add web push notification options
    webpush: {
      notification: {
        icon: '/heart.png',
        badge: '/heart.png',
        requireInteraction: false,
      },
    },
  };

  try {
    console.log('📤 Sending test notification...');
    console.log('   Token:', FCM_TOKEN.substring(0, 20) + '...');
    
    const response = await admin.messaging().send(message);
    
    console.log('✅ Successfully sent message!');
    console.log('   Message ID:', response);
    console.log('📱 Check your browser for the notification!');
    console.log('');
    console.log('💡 Tips:');
    console.log('   - If app is open: Notification appears immediately');
    console.log('   - If app is closed: Check system notifications');
    console.log('   - If no notification: Check browser notification settings');
    
  } catch (error) {
    console.error('❌ Error sending message:', error.code);
    console.error('   Message:', error.message);
    console.error('');
    
    // Provide helpful error messages
    if (error.code === 'messaging/invalid-registration-token') {
      console.error('⚠️  Invalid FCM token!');
      console.error('   - Make sure you copied the complete token');
      console.error('   - Token should be very long (100+ characters)');
      console.error('   - Get a new token from browser console');
    } else if (error.code === 'messaging/registration-token-not-registered') {
      console.error('⚠️  Token not registered!');
      console.error('   - User may have revoked notification permission');
      console.error('   - Get a new token by re-enabling notifications');
    } else if (error.code === 'messaging/invalid-argument') {
      console.error('⚠️  Invalid argument!');
      console.error('   - Check that your message format is correct');
    } else {
      console.error('   Full error:', error);
    }
    
    process.exit(1);
  }
}

// Run the test
console.log('🧪 Firebase Cloud Messaging Test');
console.log('================================\n');
sendTestNotification()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
