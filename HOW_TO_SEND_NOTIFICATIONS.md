# How to Send Push Notifications from Backend

You have your FCM token working! Here are all the ways to trigger notifications:

## Method 1: Using the UI Button (Easiest)

1. **Scroll down** on your landing page to the purple/pink CTA section
2. **Find the "Send Push Notification to All Devices" button**
3. **Click it** - it will send a notification to all registered devices
4. **Check the result** - you'll see success/failure message

This button is already on your page and ready to use!

## Method 2: Using the API Endpoint Directly

### Using cURL

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test from the backend API!",
    "data": {
      "url": "/",
      "type": "test"
    }
  }'
```

### Using JavaScript/Fetch

```javascript
// In browser console or any JavaScript code
fetch('/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '🎉 New Update!',
    body: 'This notification was sent from the backend API',
    data: {
      url: '/matches',
      type: 'new_match',
      matchId: '123'
    }
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Notification sent:', data);
  console.log(`Sent to ${data.sent} device(s)`);
})
.catch(error => {
  console.error('❌ Error:', error);
});
```

### Using Node.js/Backend Code

```javascript
// In any server-side code
const response = await fetch('http://localhost:3000/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'New Match Found!',
    body: 'Someone wants to connect with you',
    data: {
      url: '/matches',
      type: 'new_match'
    }
  })
});

const result = await response.json();
console.log('Notification sent:', result);
```

## Method 3: Check Registered Devices

Before sending, check how many devices are registered:

```bash
# Using cURL
curl http://localhost:3000/api/notifications/send

# Using JavaScript
fetch('/api/notifications/send')
  .then(r => r.json())
  .then(data => console.log(data));
```

Response:
```json
{
  "status": "ready",
  "registeredDevices": 1,
  "message": "1 device(s) registered and ready to receive notifications"
}
```

## Method 4: Send from Server-Side Code (Next.js API Route)

Create a new API route that triggers notifications:

```typescript
// app/api/notifications/trigger/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Your business logic here
  // For example: new match found, new message, etc.
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'New Match Found! 💜',
      body: 'Someone wants to connect with you',
      data: {
        url: '/matches',
        type: 'new_match',
        timestamp: Date.now().toString()
      }
    })
  });

  const result = await response.json();
  return NextResponse.json(result);
}
```

## Method 5: Direct Firebase Admin (Advanced)

If you want to send directly without using the API:

```typescript
// app/api/custom-notification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminMessaging } from '@/app/lib/firebase-admin';
import { getAllTokens } from '@/app/lib/token-store';

export async function POST(request: NextRequest) {
  const messaging = getAdminMessaging();
  if (!messaging) {
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  const tokens = getAllTokens();
  
  // Send to all tokens
  const messages = tokens.map(token => ({
    notification: {
      title: 'Custom Notification',
      body: 'This is sent directly from Firebase Admin',
    },
    token: token,
  }));

  const results = await Promise.allSettled(
    messages.map(msg => messaging.send(msg))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  
  return NextResponse.json({
    success: true,
    sent: successful,
    total: tokens.length
  });
}
```

## Quick Test Right Now

### Option A: Use the Button
1. Scroll down on your page
2. Click "Send Push Notification to All Devices"
3. Done! ✅

### Option B: Use Browser Console
1. Open browser console (F12)
2. Paste this code:

```javascript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test from Console! 🚀',
    body: 'If you see this, backend notifications are working!',
    data: { url: '/', type: 'test' }
  })
})
.then(r => r.json())
.then(d => console.log('✅', d))
.catch(e => console.error('❌', e));
```

3. Press Enter
4. Check for notification! 🔔

## Example: Trigger on Specific Events

### When a New Match is Created

```typescript
// In your match creation logic
async function createMatch(matchData: any) {
  // ... create match in database ...
  
  // Send notification to all users
  await fetch('/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '🎯 New Match Available!',
      body: `A new counselor is available in ${matchData.location}`,
      data: {
        url: `/matches/${matchData.id}`,
        type: 'new_match',
        matchId: matchData.id
      }
    })
  });
}
```

### When a User Gets a Message

```typescript
// In your message sending logic
async function sendMessage(messageData: any) {
  // ... save message to database ...
  
  // Send notification to recipient
  await fetch('/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '💬 New Message',
      body: `${messageData.senderName}: ${messageData.preview}`,
      data: {
        url: `/messages/${messageData.conversationId}`,
        type: 'new_message',
        conversationId: messageData.conversationId
      }
    })
  });
}
```

## Response Format

When you send a notification, you'll get a response like:

```json
{
  "success": true,
  "message": "Notifications sent",
  "sent": 1,
  "failed": 0,
  "total": 1,
  "invalidTokensRemoved": 0
}
```

## Troubleshooting

### "No devices registered"
- Make sure you've enabled notifications in the browser
- Check that the token was registered (look for "✅ FCM token registered successfully" in console)
- Try refreshing the page and enabling notifications again

### "Firebase Admin not initialized"
- Make sure `serviceAccountKey.json` is in your project root
- Restart your dev server after adding the file
- Check the file is valid JSON

### Notification not appearing
- Check browser notification settings (system settings)
- Make sure service worker is registered
- Try in a different browser
- Check console for errors

## Next Steps

1. ✅ **Test the button** - Scroll down and click it
2. ✅ **Test from console** - Use the JavaScript code above
3. 🔄 **Integrate with your app logic** - Send notifications when events happen
4. 🔄 **Add user targeting** - Send to specific users (requires database)
5. 🔄 **Add notification preferences** - Let users choose what they receive

---

**Your FCM token is working! Try the button or console method now! 🚀**
