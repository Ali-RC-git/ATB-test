# Backend Setup for Push Notifications

This guide explains how to set up the backend to send push notifications to all devices.

## Prerequisites

1. ✅ Firebase project created
2. ✅ Firebase Admin SDK installed (`npm install firebase-admin`)
3. ✅ Service account key downloaded

## Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click on **"Service Accounts"** tab
5. Click **"Generate new private key"**
6. Save the JSON file as `serviceAccountKey.json` in your project root
7. ⚠️ **IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore` (already done)

## Step 2: Verify Service Account Key Location

The backend will look for the service account key in this order:

1. **Environment variable** `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON string)
2. **Environment variable** `FIREBASE_SERVICE_ACCOUNT_PATH` (file path)
3. **Default location**: `serviceAccountKey.json` in project root

### Option A: Use File (Easiest for Development)

Just place `serviceAccountKey.json` in the project root:
```
/Users/apple/Desktop/BlenSpark/Royal Cyber/ATB-test/
  ├── serviceAccountKey.json  ← Place it here
  ├── package.json
  └── ...
```

### Option B: Use Environment Variable (Recommended for Production)

Add to `.env.local`:
```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

Or set the path:
```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
```

## Step 3: Test the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Open your app** in browser: `http://localhost:3000`

3. **Enable notifications**:
   - Click the notification bell icon (top-right)
   - Click "Enable" to grant permission
   - Check browser console for: `✅ FCM token registered successfully`

4. **Send a test notification**:
   - Scroll down to the CTA section
   - Click **"Send Push Notification to All Devices"** button
   - You should see a success message
   - Check your browser for the notification!

## Step 4: API Endpoints

### Register FCM Token
**POST** `/api/notifications/register`

**Body:**
```json
{
  "token": "fcm-token-here",
  "userId": "optional-user-id",
  "deviceInfo": "optional-device-info"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token registered successfully",
  "tokenCount": 1
}
```

### Send Notification to All Devices
**POST** `/api/notifications/send`

**Body:**
```json
{
  "title": "Notification Title",
  "body": "Notification message",
  "data": {
    "url": "/",
    "type": "custom-type"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications sent",
  "sent": 5,
  "failed": 0,
  "total": 5,
  "invalidTokensRemoved": 0
}
```

### Check Status
**GET** `/api/notifications/send`

**Response:**
```json
{
  "status": "ready",
  "registeredDevices": 5,
  "message": "5 device(s) registered and ready to receive notifications"
}
```

## Step 5: How It Works

1. **User enables notifications** → FCM token is generated
2. **Token is automatically registered** → Stored in memory (or database)
3. **Admin clicks "Send Notification"** → API sends to all registered tokens
4. **Users receive notification** → Even if app is closed!

## Step 6: Production Considerations

### Replace In-Memory Token Store

The current implementation uses an in-memory store (`app/lib/token-store.ts`). For production, replace it with a database:

**Example with MongoDB:**
```typescript
// app/lib/token-store.ts (Production version)
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db('atb-matchmaking');
const tokensCollection = db.collection('fcm_tokens');

export async function storeToken(token: string, userId?: string, deviceInfo?: string) {
  await tokensCollection.updateOne(
    { token },
    { 
      $set: { 
        token, 
        userId, 
        deviceInfo, 
        lastUsed: new Date() 
      },
      $setOnInsert: { registeredAt: new Date() }
    },
    { upsert: true }
  );
}

export async function getAllTokens(): Promise<string[]> {
  const tokens = await tokensCollection.find({}).toArray();
  return tokens.map(t => t.token);
}
```

**Example with PostgreSQL:**
```typescript
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function storeToken(token: string, userId?: string, deviceInfo?: string) {
  await pool.query(
    `INSERT INTO fcm_tokens (token, user_id, device_info, registered_at, last_used)
     VALUES ($1, $2, $3, NOW(), NOW())
     ON CONFLICT (token) 
     DO UPDATE SET last_used = NOW()`,
    [token, userId, deviceInfo]
  );
}
```

### Add Authentication

Protect the send endpoint with authentication:

```typescript
// app/api/notifications/send/route.ts
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... rest of the code
}
```

### Add Rate Limiting

Prevent abuse with rate limiting:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});
```

## Troubleshooting

### Error: "Firebase Admin not initialized"

**Solutions:**
- Check that `serviceAccountKey.json` exists in project root
- Verify the JSON file is valid
- Check environment variables if using them
- Restart the dev server after adding the file

### Error: "No devices registered"

**Solutions:**
- Make sure users have enabled notifications
- Check that tokens are being registered (check console logs)
- Verify the register endpoint is working: `POST /api/notifications/register`

### Error: "Invalid registration token"

**Solutions:**
- Token may have expired - users need to re-enable notifications
- Invalid tokens are automatically removed
- Check Firebase Console for token validity

### Notifications not appearing

**Solutions:**
- Check browser notification settings
- Verify service worker is registered
- Check browser console for errors
- Test with Firebase Console first

## Testing Checklist

- [ ] Service account key downloaded and placed in project root
- [ ] Dev server restarted after adding service account key
- [ ] Notification permission granted in browser
- [ ] FCM token registered (check console)
- [ ] Send notification button works
- [ ] Notification appears when app is open
- [ ] Notification appears when app is closed (test in different tab)

## Next Steps

1. ✅ Set up service account key
2. ✅ Test sending notifications
3. 🔄 Replace in-memory store with database
4. 🔄 Add authentication to send endpoint
5. 🔄 Add rate limiting
6. 🔄 Set up monitoring/logging
7. 🔄 Add notification preferences per user
8. 🔄 Implement targeted notifications (by user, topic, etc.)

---

**Ready to send notifications! 🚀**
