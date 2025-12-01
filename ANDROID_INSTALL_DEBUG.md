# Android Install Debugging Guide

If the install button is not working on your Android device, follow these steps:

## Step 1: Check Browser Console

1. Open Chrome on your Android device
2. Connect to Chrome DevTools (chrome://inspect)
3. Or use remote debugging
4. Check the console for these messages:
   - `✅ beforeinstallprompt captured globally`
   - `PWA Install Button - Platform Detection`
   - `📊 Installability check`

## Step 2: Verify PWA Requirements

The app must meet these criteria for `beforeinstallprompt` to fire:

1. **HTTPS or localhost** ✅
2. **Valid manifest.json** ✅
3. **Service Worker registered** ✅
4. **Icons provided** (192x192 and 512x512) ✅
5. **User interaction** - The prompt may require user interaction first

## Step 3: Common Issues

### Issue: beforeinstallprompt not firing

**Possible causes:**
- App already installed (check if icon exists on home screen)
- Previously dismissed the prompt (clear browser data)
- Browser doesn't support it (use Chrome/Edge)
- Not meeting PWA criteria (check console logs)

**Solutions:**
1. Clear browser cache and data
2. Uninstall if already installed
3. Use Chrome browser (not Samsung Internet or Firefox)
4. Check console for installability check results

### Issue: Button shows but doesn't trigger prompt

**Solutions:**
1. Wait a few seconds after page load
2. Try clicking the button again
3. Check if `deferredPrompt` is available in console
4. Use browser menu as fallback: Menu (⋮) → "Add to Home Screen"

## Step 4: Manual Install (Fallback)

If automatic install doesn't work:

1. **Chrome:**
   - Tap menu (⋮) → "Add to Home screen" or "Install app"
   - Tap "Add" or "Install"

2. **Samsung Internet:**
   - Tap menu (☰) → "Add page to" → "Home screen"
   - Tap "Add"

3. **Firefox:**
   - Tap menu (⋮) → "Install" or "Add to Home Screen"

## Step 5: Check Your Device

- **Android version:** Should be Android 5.0+ for PWA support
- **Chrome version:** Should be Chrome 67+ for beforeinstallprompt
- **Browser:** Use Chrome for best compatibility

## Debug Commands

Open browser console and run:

```javascript
// Check if prompt is available
console.log('Deferred prompt:', window.deferredInstallPrompt);

// Check installability
navigator.serviceWorker.getRegistration().then(r => console.log('SW:', !!r));
fetch('/manifest.json').then(r => r.json()).then(m => console.log('Manifest:', m));

// Check display mode
console.log('Standalone:', window.matchMedia('(display-mode: standalone)').matches);
```

## Still Not Working?

1. Check the console logs when you click the install button
2. Verify all installability checks pass
3. Try on a different Android device
4. Clear all browser data and try again
5. Make sure you're using HTTPS (not HTTP)

