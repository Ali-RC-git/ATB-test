# Troubleshooting: "No devices registered" Error

If you're seeing the error:
```json
{
  "error": "No devices registered",
  "message": "No FCM tokens found. Make sure users have enabled notifications.",
  "tokenCount": 0
}
```

This means your FCM token isn't being registered with the backend. Follow these steps:

## Quick Fix Steps

### Step 1: Check if Token is Generated

1. Open your app in the browser
2. Open browser console (F12)
3. Look for: `✅ FCM Registration token: [long-token]`
4. If you see this, the token is being generated ✅
5. If you DON'T see this, enable notifications first (click the bell icon)

### Step 2: Check if Token is Being Registered

After you see the token in console, look for:
```
✅ FCM token registered successfully
```

If you DON'T see this message, the token isn't being sent to the backend.

### Step 3: Manually Register Token (Quick Test)

If the automatic registration isn't working, you can manually register:

1. **Get your FCM token** from the console (the long string after "FCM Registration token:")
2. **Copy the full token**
3. **Run this in browser console**:

```javascript
// Replace YOUR_FCM_TOKEN with your actual token
fetch('/api/notifications/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'YOUR_FCM_TOKEN_HERE',
    deviceInfo: navigator.userAgent
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Token registered:', data);
  console.log('📱 Registered devices:', data.tokenCount);
})
.catch(e => console.error('❌ Error:', e));
```

### Step 4: Verify Registration

After registering, check if it worked:

```javascript
fetch('/api/notifications/send')
  .then(r => r.json())
  .then(data => {
    console.log('Registered devices:', data.registeredDevices);
  });
```

You should see `registeredDevices: 1` (or more if you've registered multiple devices).

## Common Issues

### Issue 1: Token Generated But Not Registered

**Symptoms:**
- ✅ See "FCM Registration token" in console
- ❌ Don't see "FCM token registered successfully"

**Solution:**
1. Check browser console for errors
2. Check Network tab for failed requests to `/api/notifications/register`
3. Make sure the API route is working (check server logs)
4. Try manually registering (see Step 3 above)

### Issue 2: API Route Not Working

**Check:**
1. Open browser DevTools → Network tab
2. Try to register token manually (Step 3)
3. Look for the request to `/api/notifications/register`
4. Check if it returns 200 (success) or an error

**If you see 404:**
- Make sure the file exists: `app/api/notifications/register/route.ts`
- Restart your dev server

**If you see 500:**
- Check server console for errors
- Verify `token-store.ts` is working

### Issue 3: Token Store Not Persisting

**Note:** The current implementation uses in-memory storage, which means:
- ✅ Tokens are stored when server is running
- ❌ Tokens are lost when server restarts

**Solution:**
- For testing: Don't restart the server after registering tokens
- For production: Replace with a database (see `BACKEND_SETUP.md`)

### Issue 4: Permission Not Granted

**Symptoms:**
- No FCM token in console
- Notification permission is "default" or "denied"

**Solution:**
1. Click the notification bell icon (top-right)
2. Click "Enable" to grant permission
3. Check console for token generation

## Debug Checklist

- [ ] Notification permission is granted
- [ ] FCM token appears in console
- [ ] "FCM token registered successfully" message appears
- [ ] No errors in browser console
- [ ] No errors in server console
- [ ] API endpoint `/api/notifications/register` returns 200
- [ ] Token count > 0 when checking status

## Test the Full Flow

1. **Clear everything:**
   ```javascript
   // In browser console
   localStorage.clear();
   // Then refresh page
   ```

2. **Enable notifications:**
   - Click bell icon → Enable
   - Check console for token

3. **Verify registration:**
   ```javascript
   fetch('/api/notifications/send')
     .then(r => r.json())
     .then(d => console.log('Devices:', d.registeredDevices));
   ```

4. **Send test notification:**
   - Click "Send Push Notification to All Devices" button
   - Should work now!

## Still Not Working?

1. **Check server logs** - Look for errors when token registration is attempted
2. **Check browser Network tab** - See if the register request is being made
3. **Try manual registration** - Use the code in Step 3 to register manually
4. **Verify serviceAccountKey.json** - Make sure it's in the project root
5. **Restart dev server** - Sometimes helps with API route issues

---

**Once you see `registeredDevices: 1` or more, you're ready to send notifications! 🎉**
