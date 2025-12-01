import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ATB Matchmaking - Connect Counselors & Candidates',
  description: 'Matchmaking platform connecting career counselors with candidates. Find your perfect match today!',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ATB Match',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8b5cf6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-white">
      <head>
        <link rel="icon" href="https://ui-avatars.com/api/?name=ATB&background=8b5cf6&color=fff&size=192&bold=true&font-size=0.6" type="image/png" />
        {/* iOS requires PNG icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="https://ui-avatars.com/api/?name=ATB&background=8b5cf6&color=fff&size=180&bold=true&font-size=0.6" />
        <link rel="apple-touch-icon" sizes="192x192" href="https://ui-avatars.com/api/?name=ATB&background=8b5cf6&color=fff&size=192&bold=true&font-size=0.6" />
        <link rel="apple-touch-icon" sizes="512x512" href="https://ui-avatars.com/api/?name=ATB&background=8b5cf6&color=fff&size=512&bold=true&font-size=0.6" />
        <link rel="apple-touch-icon" href="https://ui-avatars.com/api/?name=ATB&background=8b5cf6&color=fff&size=180&bold=true&font-size=0.6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ATB Match" />

        {/* PWA meta tags */}
        <meta name="application-name" content="ATB Matchmaking" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="theme-color" content="#8b5cf6" />

        {/* Desktop PWA support */}
        <meta name="msapplication-TileImage" content="https://ui-avatars.com/api/?name=ATB&background=8b5cf6&color=fff&size=512&bold=true&font-size=0.6" />

        {/* Prevents zooming and ensures proper scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-white">
        {children}

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
      // Store deferred prompt globally so it can be accessed by components
      let deferredPrompt = null;
      
      // Request permissions early for better install support
      async function requestInitialPermissions() {
        try {
          // Request notification permission (helps with PWA installability)
          if ('Notification' in window && Notification.permission === 'default') {
            // Don't request immediately - wait for user interaction
            console.log('📱 Notification permission available to request');
          }
          
          // Ensure service worker is registered (this is a permission)
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                  console.log('✅ Service Worker registered: ', registration);
                  // Store registration for permission checks
                  window.serviceWorkerRegistration = registration;
                })
                .catch(function(registrationError) {
                  console.log('❌ Service Worker registration failed: ', registrationError);
                });
            });
          }
        } catch (error) {
          console.log('⚠️ Permission setup error:', error);
        }
      }
      
      // Request initial permissions
      requestInitialPermissions();
      
      // Capture beforeinstallprompt event early (before React components mount)
      window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        console.log('✅ beforeinstallprompt captured globally');
        console.log('🔐 Permissions status:', {
          notifications: 'Notification' in window ? Notification.permission : 'not supported',
          serviceWorker: 'serviceWorker' in navigator ? 'supported' : 'not supported'
        });
        // Store in window for component access
        window.deferredInstallPrompt = deferredPrompt;
        // Dispatch custom event for components
        window.dispatchEvent(new CustomEvent('installpromptavailable', { detail: deferredPrompt }));
      });
    `,
          }}
        />
      </body>
    </html>
  )
}