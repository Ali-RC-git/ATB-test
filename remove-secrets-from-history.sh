#!/bin/bash

# Remove secrets from git history
# This will rewrite commits adf0f63 and dc1b911

set -e

echo "🔒 Removing secrets from git history..."
echo ""
echo "Files to remove from history:"
echo "  - add-service-account-to-env.sh (commit adf0f63)"
echo "  - UPDATE_ENV.md (commit adf0f63)"
echo "  - app/lib/serviceAccountKey.json (commit dc1b911)"
echo ""
echo "⚠️  WARNING: This will rewrite git history!"
echo "   Make sure you've backed up your work."
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "🔄 Removing secrets from git history..."

# Remove files from all commits in the range
git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch add-service-account-to-env.sh UPDATE_ENV.md app/lib/serviceAccountKey.json" \
    --prune-empty --tag-name-filter cat -- dc1b911^..HEAD

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Secrets removed from git history!"
    echo ""
    echo "🧹 Cleaning up backup refs..."
    
    # Remove backup refs
    git for-each-ref --format="delete %(refname)" refs/original 2>/dev/null | git update-ref --stdin 2>/dev/null || true
    
    # Expire reflog
    git reflog expire --expire=now --all
    
    # Garbage collect
    git gc --prune=now --aggressive
    
    echo ""
    echo "✅ Cleanup complete!"
    echo ""
    echo "📤 Next steps:"
    echo "   1. Verify: git log --all --full-history -- add-service-account-to-env.sh"
    echo "   2. Force push: git push origin --force --all"
    echo ""
    echo "⚠️  Force push rewrites remote history - coordinate with your team!"
else
    echo ""
    echo "❌ Error during filter-branch"
    exit 1
fi
