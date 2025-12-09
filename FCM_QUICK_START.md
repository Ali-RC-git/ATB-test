# Firebase Cloud Messaging - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create/Select your project
3. Add a Web app (click `</>` icon)
4. Copy the config values

### 2. Get VAPID Key

1. Firebase Console → Project Settings → Cloud Messaging
2. Scroll to "Web Push certificates"
3. Click "Generate key pair" (if needed)
4. Copy the key

### 3. Create `.env.local` File

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### 4. Test It!

```bash
npm run dev
```

1. Open your app
2. Click "Enable Notifications"
3. Check browser console for: `✅ FCM Registration token`

## 📤 Sending Notifications

### From Firebase Console (Testing)
1. Firebase Console → Cloud Messaging
2. "Send your first message"
3. Enter title & body
4. Select "Web" target
5. Publish

### From Backend (Production)

```javascript
// Install: npm install firebase-admin

const admin = require('firebase-admin');
admin.initializeApp({ /* your config */ });

await admin.messaging().send({
  token: 'user-fcm-token',
  notification: {
    title: 'New Match!',
    body: 'Someone wants to connect'
  }
});
```

## ✅ What's Already Implemented

- ✅ Firebase initialization
- ✅ FCM token generation
- ✅ Service worker FCM handling
- ✅ Foreground message listener
- ✅ Background notification support
- ✅ Cross-platform compatibility

## 🔧 Files Modified/Created

- `app/lib/firebase.ts` - Firebase configuration & FCM setup
- `app/components/PushNotificationService.ts` - FCM integration
- `public/sw.js` - FCM push message handler
- `FIREBASE_SETUP.md` - Detailed setup guide

## 📝 Next Steps

1. Add your Firebase config to `.env.local`
2. Test with Firebase Console
3. Implement backend API to store FCM tokens
4. Set up notification sending from your backend

See `FIREBASE_SETUP.md` for detailed instructions!
