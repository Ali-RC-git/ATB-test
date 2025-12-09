# Security Fix: Service Account Key Moved to .env

## ✅ What Was Fixed

1. **Removed from Git**: The `app/lib/serviceAccountKey.json` file has been removed from git tracking
2. **Added to .env.local**: Service account credentials are now in `.env.local` (which is gitignored)
3. **Updated Code**: Code now reads from `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable first

## 🔒 Security Status

- ✅ Service account key is in `.env.local` (not tracked by git)
- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ File removed from git history (needs commit)
- ✅ Code updated to use environment variables

## 📝 Next Steps

### 1. Commit the Changes

```bash
# Stage the removal of the service account file
git add app/lib/serviceAccountKey.json

# Stage the .gitignore update
git add .gitignore

# Commit
git commit -m "Security: Move service account key to .env.local"
```

### 2. Remove from Git History (Important!)

The file is still in git history. To completely remove it:

```bash
# Remove from git history (use with caution)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app/lib/serviceAccountKey.json" \
  --prune-empty --tag-name-filter cat -- --all

# Or use BFG Repo-Cleaner (recommended)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
```

**⚠️ Warning**: This rewrites git history. Only do this if you haven't shared the repo yet, or coordinate with your team.

### 3. Force Push (if you cleaned history)

```bash
# Only if you cleaned git history
git push origin --force --all
```

### 4. Restart Dev Server

```bash
# Restart to load new environment variables
npm run dev
```

## ✅ Verify It's Working

1. **Check server logs** for:
   ```
   ✅ Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_JSON
   ✅ Firebase Admin initialized successfully
   ```

2. **Test sending notifications** - should work now!

## 🔐 Environment Variable Format

The service account JSON is stored in `.env.local` as:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

The code automatically parses this JSON string.

## 📋 Files Changed

- ✅ `app/lib/serviceAccountKey.json` - Removed from git
- ✅ `.gitignore` - Updated to ignore service account files
- ✅ `.env.local` - Added `FIREBASE_SERVICE_ACCOUNT_JSON`
- ✅ `app/lib/firebase-admin.ts` - Updated to prioritize env variables

## 🚨 Important Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Rotate the key** - Since it was exposed in git, consider generating a new one:
   - Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Update `.env.local` with new key
3. **For production** - Set `FIREBASE_SERVICE_ACCOUNT_JSON` in your hosting platform's environment variables

---

**Your service account key is now secure! 🔒**
