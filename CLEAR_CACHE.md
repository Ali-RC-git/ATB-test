# How to Clear Cache for Instant Updates

Since caching is now disabled in the service worker, you should see changes instantly. However, if you still see old content, follow these steps:

## For Browser Cache:

### Chrome/Edge (Desktop & Android):
1. Open DevTools (F12 or right-click → Inspect)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or go to Application tab → Storage → Clear site data

### Safari (iOS):
1. Settings → Safari → Clear History and Website Data
2. Or Settings → Safari → Advanced → Website Data → Remove All

### Firefox:
1. Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
2. Select "Cache" and clear

## For Service Worker Cache:

1. Open DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Click "Service Workers" in the left sidebar
4. Click "Unregister" next to the service worker
5. Go to "Cache Storage" and delete all caches
6. Refresh the page

## Quick Method (Recommended):

**Hard Refresh:**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`
- Mobile: Long press refresh button → "Hard Reload"

## Note:

Caching is currently **DISABLED** in the service worker for development. All changes should appear instantly. If you want to re-enable caching for production, uncomment the caching code in `public/sw.js`.

