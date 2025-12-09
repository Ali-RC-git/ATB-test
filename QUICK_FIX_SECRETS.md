# Quick Fix: Remove Secrets from Git History

GitHub is blocking your push because secrets are in commits `adf0f63` and `dc1b911`.

## Quick Solution

Run this script to remove secrets from git history:

```bash
./remove-secrets-from-commits.sh
```

Or manually:

### Step 1: Remove from Recent Commits

```bash
# Remove files from commits adf0f63 and dc1b911
git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch add-service-account-to-env.sh UPDATE_ENV.md app/lib/serviceAccountKey.json SECURITY_FIX.md" \
    --prune-empty --tag-name-filter cat -- dc1b911^..HEAD
```

### Step 2: Clean Up

```bash
# Remove backup refs
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin

# Clean reflog
git reflog expire --expire=now --all

# Garbage collect
git gc --prune=now
```

### Step 3: Force Push

```bash
# ⚠️ WARNING: This rewrites remote history!
git push origin --force --all
```

## Alternative: Use BFG Repo-Cleaner (Easier)

1. Download: https://rtyley.github.io/bfg-repo-cleaner/
2. Run:
```bash
java -jar bfg.jar --delete-files add-service-account-to-env.sh
java -jar bfg.jar --delete-files UPDATE_ENV.md
java -jar bfg.jar --delete-files app/lib/serviceAccountKey.json
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## Files Now Ignored

✅ Added to `.gitignore`:
- `add-service-account-to-env.sh`
- `*UPDATE_ENV.md`
- `*SECURITY_FIX.md`
- `serviceAccountKey.json`
- `*serviceAccount*.json`

## After Cleaning

1. ✅ Secrets removed from git history
2. ✅ Files added to `.gitignore`
3. ✅ Can push to GitHub
4. ✅ Service account in `.env.local` (safe)

---

**Run the script or follow manual steps above! 🔒**
