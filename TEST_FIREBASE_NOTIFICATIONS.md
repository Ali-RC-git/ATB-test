# How to Test Firebase Cloud Messaging (FCM) Notifications

This guide will walk you through testing Firebase push notifications in your ATB Matchmaking app.

## Prerequisites

1. ✅ Firebase project created and configured
2. ✅ Environment variables set in `.env.local`
3. ✅ App running (`npm run dev`)
4. ✅ Notification permission granted in browser

## Step 1: Get Your FCM Token

The FCM token is unique to each browser/device and is required to send push notifications.

### Method A: From Browser Console (Easiest)

1. **Open your app** in the browser (e.g., `http://localhost:3000`)
2. **Open Developer Tools** (F12 or Right-click → Inspect)
3. **Go to Console tab**
4. **Click the notification bell icon** in the top-right corner
5. **Click "Enable"** to grant notification permission
6. **Look in the console** for a message like:
   ```
   ✅ FCM Registration token: [long-token-string]
   ✅ FCM Token available: [first-20-chars]...
   ```

7. **Copy the full token** - you'll need it for testing

### Method B: From Console Programmatically

1. Open browser console
2. Run this command:
   ```javascript
   // Get FCM token directly
   import { getFCMToken } from './app/lib/firebase';
   getFCMToken().then(token => console.log('FCM Token:', token));
   ```

   Or if you're already on the page:
   ```javascript
   // Access through the notification service
   window.pushNotificationService?.getFCMToken().then(token => {
     console.log('Your FCM Token:', token);
     // Copy this token for testing
   });
   ```

## Step 2: Test Using Firebase Console (Recommended for First Test)

This is the easiest way to test - no code required!

### Steps:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Cloud Messaging**
   - Click **"Cloud Messaging"** in the left sidebar
   - Click **"Send your first message"** or **"New campaign"**

3. **Create Test Notification**
   - **Notification title**: `Test from Firebase`
   - **Notification text**: `This is a test notification! 🎉`
   - Click **"Next"**

4. **Select Target**
   - Choose **"Web"** as the platform
   - For testing, you can select **"Single device"** and paste your FCM token
   - Or select **"User segment"** to send to all users

5. **Review and Send**
   - Click **"Review"**
   - Click **"Publish"**

6. **Check Your Browser**
   - If the app is **open**: You should see the notification appear
   - If the app is **closed**: You should see a browser notification

## Step 3: Test Using Browser Console (Quick Test)

You can test notifications directly from the browser console:

### Test Foreground Notification (App Open)

1. Open your app
2. Open browser console
3. Run:
   ```javascript
   // Test notification when app is open
   new Notification('Test Notification', {
     body: 'This is a test from the console!',
     icon: '/heart.png'
   });
   ```

### Test FCM Push (Requires Backend)

For a real FCM push, you need to send it from a backend. See Step 4 below.

## Step 4: Test Using a Simple Node.js Script

Create a test script to send notifications programmatically.

### Create Test Script

1. **Create a file**: `test-fcm.js` in your project root

2. **Install Firebase Admin SDK**:
   ```bash
   npm install firebase-admin
   ```

3. **Get Service Account Key**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click **"Generate new private key"**
   - Save the JSON file (e.g., `serviceAccountKey.json`)
   - ⚠️ **Add it to `.gitignore`** - never commit this file!

4. **Create the test script**:

```javascript
// test-fcm.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Replace with your FCM token from Step 1
const FCM_TOKEN = 'YOUR_FCM_TOKEN_HERE';

async function sendTestNotification() {
  const message = {
    notification: {
      title: '🎉 Test Notification from Firebase!',
      body: 'This is a test notification sent from a Node.js script.',
    },
    data: {
      url: '/',
      timestamp: Date.now().toString(),
      type: 'test',
    },
    token: FCM_TOKEN,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Successfully sent message:', response);
    console.log('📱 Check your browser for the notification!');
  } catch (error) {
    console.error('❌ Error sending message:', error);
    
    if (error.code === 'messaging/invalid-registration-token') {
      console.error('⚠️  Invalid FCM token. Make sure you copied the correct token.');
    } else if (error.code === 'messaging/registration-token-not-registered') {
      console.error('⚠️  Token not registered. The user may have revoked permission.');
    }
  }
}

// Run the test
sendTestNotification()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
```

5. **Run the test**:
   ```bash
   node test-fcm.js
   ```

## Step 5: Test Using cURL (Alternative Method)

If you have an access token, you can test using cURL:

```bash
curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "YOUR_FCM_TOKEN",
      "notification": {
        "title": "Test from cURL",
        "body": "This is a test notification sent via cURL"
      },
      "data": {
        "url": "/",
        "timestamp": "'$(date +%s)'"
      }
    }
  }'
```

**Note**: Getting an access token requires OAuth2 setup. The Firebase Console method is easier.

## Step 6: Verify Notifications Work

### Test Scenarios:

1. **Foreground Test (App Open)**
   - Keep your app open in the browser
   - Send a notification
   - ✅ Should see notification appear immediately

2. **Background Test (App Minimized)**
   - Minimize the browser window (don't close it)
   - Send a notification
   - ✅ Should see browser notification

3. **Closed Test (App Closed)**
   - Close the browser tab/window completely
   - Wait a few seconds
   - Send a notification
   - ✅ Should see system notification (works on desktop, limited on mobile)

## Step 7: Debug Common Issues

### Issue: "No FCM token in console"

**Solutions:**
- Make sure notification permission is granted
- Check that Firebase config is correct in `.env.local`
- Verify VAPID key is set correctly
- Check browser console for errors

### Issue: "Invalid registration token"

**Solutions:**
- Token may have expired - get a new one
- User may have revoked permission - request again
- Make sure you copied the full token (it's very long)

### Issue: "Notifications not appearing"

**Solutions:**
- Check browser notification settings (system settings)
- Make sure service worker is registered (check DevTools → Application → Service Workers)
- Try in a different browser (Chrome/Firefox recommended)
- Check console for errors

### Issue: "Firebase initialization error"

**Solutions:**
- Verify all environment variables are set
- Check that `.env.local` file exists
- Restart the dev server after changing `.env.local`
- Check Firebase config values match your project

## Step 8: Test Notification Features

### Test Different Notification Types

1. **Simple Notification**:
   ```javascript
   {
     notification: {
       title: "Simple Test",
       body: "This is a simple notification"
     }
   }
   ```

2. **Notification with Data**:
   ```javascript
   {
     notification: {
       title: "Match Found!",
       body: "Someone wants to connect with you"
     },
     data: {
       url: "/matches",
       matchId: "123",
       type: "new_match"
     }
   }
   ```

3. **Data-Only Notification** (No visible notification, just data):
   ```javascript
   {
     data: {
       title: "Silent Update",
       body: "Your profile was viewed",
       url: "/profile"
     }
   }
   ```

## Quick Test Checklist

- [ ] Firebase project created
- [ ] Environment variables configured
- [ ] App running (`npm run dev`)
- [ ] Notification permission granted
- [ ] FCM token obtained from console
- [ ] Test notification sent from Firebase Console
- [ ] Notification received when app is open
- [ ] Notification received when app is closed

## Next Steps

Once testing works:

1. **Store FCM tokens in your database** - Associate tokens with user accounts
2. **Create API endpoint** - To send notifications from your backend
3. **Implement notification preferences** - Let users control what notifications they receive
4. **Set up notification scheduling** - Send notifications at appropriate times
5. **Add notification actions** - Allow users to interact with notifications

## Example: Complete Test Flow

```bash
# 1. Start your app
npm run dev

# 2. Open browser to http://localhost:3000

# 3. Open console and get token
# (Click notification bell → Enable → Check console for token)

# 4. Copy the FCM token

# 5. Test from Firebase Console
# (Firebase Console → Cloud Messaging → Send test message)

# 6. Or test using Node.js script
node test-fcm.js

# 7. Verify notification appears!
```

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Firebase configuration
3. Check service worker status (DevTools → Application)
4. Try in incognito mode (to rule out extension issues)
5. Test in different browsers

---

**Happy Testing! 🎉**
