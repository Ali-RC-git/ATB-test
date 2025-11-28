import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ATB Shop - Instagram Style Shopping',
  description: 'Shop like never before with ATB Shop',
  manifest: '/manifest.json',
  themeColor: '#ffffff', // White to match header
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ATB Shop',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ATB Shop" />
        
        {/* PWA meta tags */}
        <meta name="application-name" content="ATB Shop" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Prevents zooming and ensures proper scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-white">
        {children}
        
        {/* Service Worker Registration */}
        // In your layout.tsx, make sure this script is included:
<script
  dangerouslySetInnerHTML={{
    __html: `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
              console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
              console.log('SW registration failed: ', registrationError);
            });
        });
      }
    `,
  }}
/>
      </body>
    </html>
  )
}