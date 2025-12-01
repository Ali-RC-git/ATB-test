# Icon Setup Instructions

## iOS Icon Issue

iOS requires PNG icons (not SVG) for the app icon to appear on the home screen. 

### Quick Fix:

1. Open `generate-icons.html` in your browser (or use the script in `generate-icons.js`)
2. The icons will be generated and you can download them
3. Place the PNG files in the `public` folder:
   - `icon-180.png` (for iOS)
   - `icon-192.png` (for Android/PWA)
   - `icon-512.png` (for Android/PWA)

### Alternative: Use Online Tool

1. Go to https://realfavicongenerator.net/ or similar
2. Upload your `icon.svg`
3. Download the generated PNG icons
4. Place them in the `public` folder

### Then Update:

1. `app/layout.tsx` - Update apple-touch-icon links to use PNG files
2. `app/manifest.json` - Update icon sources to use PNG files

## Current Status

Currently using SVG icons which work for most browsers but iOS prefers PNG. The app will still work, but the icon may not appear correctly on iOS home screen.

