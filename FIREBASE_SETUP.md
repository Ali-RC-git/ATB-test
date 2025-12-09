# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you set up Google Push Notifications using Firebase Cloud Messaging (FCM) for your ATB Matchmaking application.

## Prerequisites

- A Google account
- Firebase project (we'll create one)
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter your project name (e.g., "ATB Matchmaking")
4. Follow the setup wizard:
   - Disable Google Analytics (optional, you can enable it later)
   - Click **"Create project"**

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Register your app:
   - **App nickname**: "ATB Matchmaking Web"
   - **Firebase Hosting**: (optional, can be enabled later)
3. Click **"Register app"**
4. You'll see your Firebase configuration. **Copy these values** - you'll need them in Step 3.

## Step 3: Get Your Firebase Configuration

You'll need these values from Firebase:

1. **API Key**: Found in the config object
2. **Auth Domain**: Usually `your-project-id.firebaseapp.com`
3. **Project ID**: Your Firebase project ID
4. **Storage Bucket**: Usually `your-project-id.appspot.com`
5. **Messaging Sender ID**: Found in the config object
6. **App ID**: Found in the config object

## Step 4: Get Your VAPID Key (Required for Push Notifications)

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click on the **"Cloud Messaging"** tab
3. Scroll down to **"Web Push certificates"** section
4. If you don't have a key pair:
   - Click **"Generate key pair"**
   - Copy the **Key pair** value (this is your VAPID key)
5. If you already have a key pair, copy the existing one

## Step 5: Set Up Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist):

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

2. Replace all the placeholder values with your actual Firebase configuration values

**Important**: 
- The `.env.local` file is already in `.gitignore` to keep your keys secure
- Never commit your Firebase keys to version control
- For production, set these as environment variables in your hosting platform

## Step 6: Update Firebase Configuration (Alternative)

If you prefer not to use environment variables, you can directly edit the Firebase config in:
- File: `app/lib/firebase.ts`
- Replace the placeholder values in the `firebaseConfig` object

## Step 7: Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your app in a browser (Chrome or Firefox recommended for best FCM support)

3. Navigate to the notification settings in your app

4. Click **"Enable Notifications"** or **"Request Permission"**

5. Grant notification permission when prompted

6. Check the browser console - you should see:
   - `✅ Firebase initialized successfully`
   - `✅ Firebase Cloud Messaging initialized`
   - `✅ FCM Registration token: [your-token]`

## Step 8: Send Test Push Notifications

### Option A: Using Firebase Console (Quick Test)

1. Go to Firebase Console > **Cloud Messaging**
2. Click **"Send your first message"**
3. Enter:
   - **Notification title**: "Test Notification"
   - **Notification text**: "This is a test from Firebase"
4. Click **"Next"**
5. Select **"Web"** as the target
6. Click **"Review"** then **"Publish"**

### Option B: Using Firebase Admin SDK (Backend)

You can send notifications from your backend server. Here's an example using Node.js:

```javascript
// Install: npm install firebase-admin

const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendPushNotification(fcmToken, title, body, data = {}) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: {
      ...data,
      url: data.url || '/',
    },
    token: fcmToken, // The FCM token from the client
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Usage
sendPushNotification(
  'user-fcm-token-here',
  'New Match Found!',
  'Someone wants to connect with you.',
  { url: '/matches' }
);
```

### Option C: Using cURL (Quick Test)

```bash
curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "USER_FCM_TOKEN",
      "notification": {
        "title": "Test Notification",
        "body": "This is a test from FCM"
      }
    }
  }'
```

## Step 9: Store FCM Tokens in Your Backend

When a user grants notification permission, the app will generate an FCM token. You should:

1. Send this token to your backend server
2. Store it in your database associated with the user
3. Use these tokens to send targeted push notifications

Example API endpoint to store tokens:

```javascript
// app/api/notifications/register/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json();
    
    // Store token in your database
    // Example: await db.users.update({ userId }, { fcmToken: token });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
  }
}
```

## Troubleshooting

### Issue: "Firebase initialization error"
- **Solution**: Check that all environment variables are set correctly
- Verify your Firebase config values are correct

### Issue: "No registration token available"
- **Solution**: Make sure notification permission is granted
- Check that service worker is registered and active
- Verify VAPID key is correct

### Issue: Notifications not appearing
- **Solution**: 
  - Check browser console for errors
  - Verify service worker is active (check in DevTools > Application > Service Workers)
  - Make sure you're using HTTPS (required for push notifications, except localhost)

### Issue: FCM token is null
- **Solution**:
  - Ensure VAPID key is set correctly
  - Check that service worker registration is complete
  - Verify notification permission is granted

### Issue: Notifications work in foreground but not background
- **Solution**: This is expected behavior. FCM handles background notifications automatically through the service worker.

## Browser Support

- ✅ **Chrome/Edge**: Full support
- ✅ **Firefox**: Full support
- ✅ **Safari (macOS/iOS)**: Limited support (requires PWA installation)
- ⚠️ **Opera**: Full support
- ❌ **Internet Explorer**: Not supported

## Security Best Practices

1. **Never expose your Firebase Admin SDK credentials** in client-side code
2. **Use environment variables** for all Firebase config values
3. **Implement token refresh** - FCM tokens can expire and need to be refreshed
4. **Validate tokens** on your backend before sending notifications
5. **Rate limit** notification sending to prevent abuse

## Next Steps

1. ✅ Set up your Firebase project
2. ✅ Configure environment variables
3. ✅ Test push notifications
4. ✅ Implement backend API to store FCM tokens
5. ✅ Set up notification sending from your backend
6. ✅ Implement token refresh logic
7. ✅ Add notification preferences in user settings

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [FCM Web Setup Guide](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all configuration values are correct
3. Ensure service worker is registered
4. Test with Firebase Console first to verify FCM is working

---

**Note**: The implementation is complete and ready to use. Just add your Firebase configuration values to start receiving push notifications!
