# How to Get Firebase Service Account Key

This guide will walk you through getting the `serviceAccountKey.json` file needed for sending push notifications from your backend.

## Step-by-Step Instructions

### Step 1: Go to Firebase Console

1. Open your browser and go to: **https://console.firebase.google.com/**
2. **Sign in** with your Google account (the one you used to create your Firebase project)

### Step 2: Select Your Project

1. Click on your **Firebase project** (the one you're using for ATB Matchmaking)
   - If you don't see your project, make sure you're signed in with the correct account
   - If you haven't created a project yet, create one first

### Step 3: Open Project Settings

1. Click on the **gear icon** (⚙️) in the top left corner, next to "Project Overview"
2. Select **"Project settings"** from the dropdown menu

### Step 4: Go to Service Accounts Tab

1. In the Project Settings page, click on the **"Service accounts"** tab
   - It's located at the top of the settings page, next to "General" and "Your apps"

### Step 5: Generate New Private Key

1. You'll see a section titled **"Firebase Admin SDK"**
2. Look for the **"Generate new private key"** button
3. Click the button
4. A dialog will appear warning you about keeping the key secure
5. Click **"Generate key"** to confirm

### Step 6: Download the JSON File

1. A JSON file will automatically download to your computer
2. The file will be named something like: `your-project-name-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`
3. **Rename this file** to: `serviceAccountKey.json`

### Step 7: Place the File in Your Project

1. **Move the file** to your project root directory:
   ```
   /Users/apple/Desktop/BlenSpark/Royal Cyber/ATB-test/
     ├── serviceAccountKey.json  ← Place it here
     ├── package.json
     ├── app/
     └── ...
   ```

2. **Verify the file location**:
   - The file should be in the same folder as `package.json`
   - NOT inside the `app/` folder
   - NOT inside `node_modules/`

### Step 8: Verify It's in .gitignore

The file should already be in `.gitignore` (we added it earlier), but double-check:

1. Open `.gitignore` in your project root
2. Make sure you see:
   ```
   serviceAccountKey.json
   *serviceAccount*.json
   ```

**⚠️ IMPORTANT**: Never commit this file to Git! It contains sensitive credentials.

## What the File Looks Like

The `serviceAccountKey.json` file contains something like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Alternative: Using Environment Variables

If you prefer not to use a file, you can set it as an environment variable:

### Option 1: Set as JSON String

Add to `.env.local`:
```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

### Option 2: Set File Path

Add to `.env.local`:
```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey.json
```

## Troubleshooting

### Issue: "Generate new private key" button is disabled

**Solution:**
- Make sure you have the correct permissions (Project Owner or Editor)
- Try refreshing the page
- Check if you're using the correct Firebase project

### Issue: File not downloading

**Solution:**
- Check your browser's download settings
- Look in your Downloads folder
- Try a different browser
- Check if pop-up blocker is preventing the download

### Issue: "Firebase Admin not initialized" error

**Solutions:**
1. Make sure `serviceAccountKey.json` is in the project root (same folder as `package.json`)
2. Verify the file name is exactly `serviceAccountKey.json` (case-sensitive)
3. Check that the JSON file is valid (not corrupted)
4. Restart your dev server after adding the file
5. Check the file permissions (should be readable)

### Issue: "Permission denied" when accessing file

**Solution:**
- Check file permissions: `chmod 600 serviceAccountKey.json` (on Mac/Linux)
- Make sure the file is readable by your Node.js process

## Security Best Practices

1. ✅ **Never commit** `serviceAccountKey.json` to Git
2. ✅ **Keep it secret** - don't share it publicly
3. ✅ **Use environment variables** in production (recommended)
4. ✅ **Rotate keys** if you suspect it's been compromised
5. ✅ **Limit permissions** - only grant necessary Firebase permissions

## Verify It's Working

After placing the file:

1. **Restart your dev server**:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

2. **Check the console** - you should see:
   ```
   ✅ Firebase Admin initialized successfully
   ```

3. **Test sending a notification**:
   - Click the "Send Push Notification to All Devices" button
   - You should see a success message (not "Firebase Admin not initialized")

## Quick Checklist

- [ ] Went to Firebase Console
- [ ] Selected correct project
- [ ] Opened Project Settings → Service Accounts
- [ ] Clicked "Generate new private key"
- [ ] Downloaded the JSON file
- [ ] Renamed it to `serviceAccountKey.json`
- [ ] Placed it in project root (same folder as `package.json`)
- [ ] Verified it's in `.gitignore`
- [ ] Restarted dev server
- [ ] Tested sending a notification

---

**Once you have the file in place, you're ready to send push notifications! 🚀**
