#!/bin/bash

# Remove secrets from specific commits
# This uses interactive rebase to edit commits

set -e

echo "🔒 Removing secrets from git commits..."
echo ""
echo "This will edit commits:"
echo "  - adf0f63 (contains add-service-account-to-env.sh, UPDATE_ENV.md)"
echo "  - dc1b911 (contains app/lib/serviceAccountKey.json)"
echo ""
echo "⚠️  WARNING: This rewrites git history!"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# Start interactive rebase from before the problematic commits
echo ""
echo "🔄 Starting interactive rebase..."
echo "   You'll need to edit commits adf0f63 and dc1b911"
echo ""

# Create a rebase script
cat > /tmp/rebase_script.sh << 'REBASE_SCRIPT'
#!/bin/bash
# This script will be used during rebase

COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_HASH=$(git rev-parse HEAD)

# Check which commit we're on
if git show --name-only --pretty="" HEAD | grep -q "add-service-account-to-env.sh\|UPDATE_ENV.md"; then
    echo "Removing secrets from commit $COMMIT_HASH"
    git rm --cached add-service-account-to-env.sh 2>/dev/null || true
    git rm --cached UPDATE_ENV.md 2>/dev/null || true
    git commit --amend --no-edit --allow-empty
elif git show --name-only --pretty="" HEAD | grep -q "app/lib/serviceAccountKey.json"; then
    echo "Removing serviceAccountKey.json from commit $COMMIT_HASH"
    git rm --cached app/lib/serviceAccountKey.json 2>/dev/null || true
    git commit --amend --no-edit --allow-empty
fi
REBASE_SCRIPT

chmod +x /tmp/rebase_script.sh

# Use filter-branch instead (more reliable)
echo "Using git filter-branch to remove files..."

git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch add-service-account-to-env.sh UPDATE_ENV.md app/lib/serviceAccountKey.json SECURITY_FIX.md" \
    --prune-empty --tag-name-filter cat -- dc1b911^..HEAD

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Secrets removed from commits!"
    echo ""
    echo "🧹 Cleaning up backup refs..."
    git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin 2>/dev/null || true
    git reflog expire --expire=now --all
    git gc --prune=now
    
    echo ""
    echo "✅ Done! History cleaned."
    echo ""
    echo "📤 To push:"
    echo "   git push origin --force --all"
    echo ""
    echo "⚠️  Force push rewrites remote history!"
else
    echo ""
    echo "❌ Error. Try manual rebase or use BFG Repo-Cleaner."
    exit 1
fi
