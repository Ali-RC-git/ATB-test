'use client';

import { useState, useEffect } from "react";
import { Smartphone, Download, Monitor } from 'lucide-react';
import AndroidInstallPrompt from './AndroidInstallPrompt';
import IOSInstallGuide from './IOSInstallGuide';
import PermissionRequestModal from './PermissionRequestModal';

interface PWAInstallButtonProps {
  isStandalone: boolean;
}

export default function PWAInstallButton({ isStandalone }: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(true); // Always show by default
  const [isDesktop, setIsDesktop] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState({
    notifications: 'default' as 'default' | 'granted' | 'denied',
    serviceWorker: false
  });

  // Check current permission status - defined outside useEffect so it's accessible
  const checkPermissionStatus = async () => {
    if (typeof window === 'undefined') return;

    const status = {
      notifications: ('Notification' in window ? Notification.permission : 'default') as 'default' | 'granted' | 'denied',
      serviceWorker: false
    };

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        status.serviceWorker = !!registration;
      } catch (e) {
        console.log('⚠️ Service Worker check error:', e);
      }
    }

    setPermissionStatus(status);
    return status;
  };

  useEffect(() => {
    // Mark component as mounted to prevent hydration mismatch
    setMounted(true);

    // Enhanced standalone detection
    const checkIfInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isAndroidStandalone = !window.matchMedia('(display-mode: browser)').matches;

      return isStandaloneMode || isFullscreen || isMinimalUI || isIOSStandalone || isAndroidStandalone || isStandalone;
    };

    // Detect platform and browser
    const checkPlatform = () => {
      const userAgent = navigator.userAgent;
      const isIOSDevice = /iPhone|iPad|iPod/.test(userAgent);
      const isAndroidDevice = /Android/.test(userAgent);
      const isDesktopDevice = window.innerWidth > 768 && !isIOSDevice && !isAndroidDevice;

      // Detect Android browser type
      const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
      const isSamsungBrowser = /SamsungBrowser/.test(userAgent);
      const isFirefox = /Firefox/.test(userAgent);
      const isOpera = /OPR/.test(userAgent) || /Opera/.test(userAgent);

      setIsIOS(isIOSDevice);
      setIsAndroid(isAndroidDevice);
      setIsDesktop(isDesktopDevice);

      // Check if already installed
      const installed = checkIfInstalled();
      if (installed) {
        setShowButton(false);
        console.log('✅ App is already installed - hiding install button');
        return;
      }

      // Always show button on mobile devices if not installed
      if (isIOSDevice || isAndroidDevice) {
        setShowButton(true);
      }

      // Debug logging
      console.log('PWA Install Button - Platform Detection:', {
        isIOS: isIOSDevice,
        isAndroid: isAndroidDevice,
        isDesktop: isDesktopDevice,
        isChrome,
        isSamsungBrowser,
        isFirefox,
        isOpera,
        isStandalone,
        installed,
        showButton: !installed
      });
    };

    checkPlatform();
    window.addEventListener('resize', checkPlatform);

    // Periodically check if app got installed
    const installCheckInterval = setInterval(() => {
      const installed = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        isStandalone;
      if (installed) {
        setShowButton(false);
        clearInterval(installCheckInterval);
      }
    }, 2000);

    // Check permissions on mount
    if (typeof window !== 'undefined') {
      checkPermissionStatus();
    }

    // Check if prompt was already captured globally (from layout.tsx)
    if ((window as any).deferredInstallPrompt) {
      console.log('✅ Found existing deferred prompt from global storage');
      setDeferredPrompt((window as any).deferredInstallPrompt);
      setShowButton(true);
    } else {
      console.log('⏳ No deferred prompt yet - waiting for beforeinstallprompt event...');
      console.log('💡 This is normal. The event fires when PWA criteria are met.');
    }

    // Handle PWA install prompt (works for Android, Chrome Desktop, Edge Desktop)
    // Note: iOS never fires this event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as any;
      setDeferredPrompt(promptEvent);
      setShowButton(true);
      // Also store globally
      (window as any).deferredInstallPrompt = promptEvent;

      console.log('✅ beforeinstallprompt event fired - install prompt available', promptEvent);
    };

    // Listen for custom event from global handler
    const handleInstallPromptAvailable = (e: CustomEvent) => {
      console.log('✅ Received install prompt from global handler');
      setDeferredPrompt(e.detail);
      setShowButton(true);
    };

    // Listen for install prompt on all platforms
    // Use capture phase to catch it early
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt, { capture: true });

    // Also try listening without capture as fallback
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for custom event
    window.addEventListener('installpromptavailable', handleInstallPromptAvailable as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt, { capture: true });
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('installpromptavailable', handleInstallPromptAvailable as EventListener);
      window.removeEventListener('resize', checkPlatform);
      clearInterval(installCheckInterval);
    };
  }, [isStandalone]);

  const requestInstallPermissions = async () => {
    if (typeof window === 'undefined') return false;

    setRequestingPermissions(true);
    let allGranted = true;

    try {
      // Request notification permission (required for some PWA features)
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          console.log('🔔 Requesting notification permission...');
          const permission = await Notification.requestPermission();
          console.log('📱 Notification permission result:', permission);
          if (permission !== 'granted') {
            console.warn('⚠️ Notification permission denied - may affect install');
            allGranted = false;
          }
        } else if (Notification.permission === 'denied') {
          console.warn('⚠️ Notification permission was previously denied');
          allGranted = false;
        }
      }

      // Ensure service worker is registered (permission for service worker)
      if ('serviceWorker' in navigator) {
        try {
          let registration = await navigator.serviceWorker.getRegistration();
          if (!registration) {
            console.log('📦 Registering service worker...');
            registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered');
          }
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
          allGranted = false;
        }
      }

      // Request storage permission (for PWA install)
      if ('storage' in navigator && 'persist' in navigator.storage) {
        try {
          const isPersisted = await navigator.storage.persist();
          console.log('💾 Storage persistence:', isPersisted ? 'Granted' : 'Not granted');
        } catch (error) {
          console.log('⚠️ Storage permission check failed:', error);
        }
      }

    } catch (error) {
      console.error('❌ Permission request error:', error);
      allGranted = false;
    } finally {
      setRequestingPermissions(false);
      setPermissionsGranted(allGranted);
    }

    return allGranted;
  };

  const handleInstallClick = async () => {
    // Check if already installed
    if (typeof window === 'undefined') return;

    const installed = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (installed) {
      console.log('App is already installed');
      setShowButton(false);
      return;
    }

    // iOS - show instructions modal when button is clicked
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // Android - request permissions first, then try to install
    if (isAndroid) {
      // Check if permissions need to be requested
      const needsPermissions =
        ('Notification' in window && Notification.permission === 'default') ||
        !permissionStatus.serviceWorker;

      if (needsPermissions && !permissionsGranted) {
        console.log('🔐 Permissions needed - showing permission modal...');
        setShowPermissionModal(true);
        return;
      }

      // Step 1: Request necessary permissions
      console.log('🔐 Requesting install permissions...');
      const permissionsOk = await requestInstallPermissions();

      if (!permissionsOk) {
        console.warn('⚠️ Some permissions were not granted, but continuing with install attempt...');
      }

      // Update permission status
      await checkPermissionStatus();

      // Step 2: Try to install
      // Method 1: Use beforeinstallprompt (Chrome, Edge)
      // Wait a moment for permissions to be processed
      await new Promise(resolve => setTimeout(resolve, 500));

      const promptToUse = deferredPrompt || (window as any).deferredInstallPrompt;

      if (promptToUse) {
        try {
          const promptEvent = promptToUse as any;
          console.log('🚀 Triggering install prompt (Method 1: beforeinstallprompt)...', promptEvent);
          console.log('🔐 Permissions status:', {
            notifications: Notification.permission,
            serviceWorker: 'serviceWorker' in navigator
          });

          if (typeof promptEvent.prompt === 'function') {
            // Trigger the install prompt - this requires user interaction (button click)
            await promptEvent.prompt();
            const choiceResult = await promptEvent.userChoice;
            console.log('📱 User choice:', choiceResult);

            if (choiceResult.outcome === 'accepted') {
              console.log('✅ App installation accepted by user');
              setDeferredPrompt(null);
              (window as any).deferredInstallPrompt = null;
              setShowButton(false);
              return;
            } else {
              console.log('❌ User dismissed install prompt');
            }
          } else {
            console.error('❌ prompt() method not available on deferredPrompt');
          }
        } catch (error: any) {
          console.error('❌ Method 1 failed:', error);
          if (error.message?.includes('permission') || error.message?.includes('user gesture')) {
            console.log('💡 Install requires user gesture - this is expected on button click');
          }
        }
      }

      // Method 2: Try Samsung Internet browser specific method
      const userAgent = navigator.userAgent;
      if (/SamsungBrowser/.test(userAgent)) {
        console.log('🚀 Trying Samsung Internet install method...');
        // Samsung browser might need different approach
        try {
          // Try to trigger add to home screen
          if ((window as any).samsung && (window as any).samsung.addToHomeScreen) {
            (window as any).samsung.addToHomeScreen();
            return;
          }
        } catch (error) {
          console.error('Samsung method failed:', error);
        }
      }

      // Method 3: Check installability and show help
      console.log('⚠️ Native prompt not available');
      console.log('🔍 Running installability check...');
      await checkInstallability();

      // If still no prompt after check, show browser-specific instructions
      if (!deferredPrompt && !(window as any).deferredInstallPrompt) {
        console.log('⚠️ Showing browser-specific instructions as fallback');
        showAndroidBrowserSpecificInstall();
      } else {
        // Prompt became available, retry
        console.log('✅ Prompt now available, retrying...');
        setTimeout(() => handleInstallClick(), 500);
      }
      return;
    }

    // Desktop - try to trigger native install
    const promptToUse = deferredPrompt || (window as any).deferredInstallPrompt;

    if (promptToUse) {
      try {
        const promptEvent = promptToUse as any;
        console.log('🚀 Triggering install prompt...', promptEvent);

        if (typeof promptEvent.prompt === 'function') {
          await promptEvent.prompt();
          const choiceResult = await promptEvent.userChoice;
          console.log('📱 User choice:', choiceResult);

          if (choiceResult.outcome === 'accepted') {
            console.log('✅ App installation accepted by user');
            setDeferredPrompt(null);
            (window as any).deferredInstallPrompt = null;
            setShowButton(false);
          }
        }
      } catch (error) {
        console.error('❌ Install prompt error:', error);
      }
    } else {
      // No deferred prompt available yet
      console.log('⏳ Install prompt not available yet. Waiting for beforeinstallprompt event...');

      // For Android, try to wait and retry
      if (isAndroid) {
        console.log('🤖 Android device detected - checking install prompt availability...');
        console.log('   Current deferredPrompt:', !!deferredPrompt);
        console.log('   Global deferredPrompt:', !!(window as any).deferredInstallPrompt);

        // Show loading state
        const button = document.querySelector('[aria-label="Install ATB Matchmaking app"]') as HTMLButtonElement;
        if (button) {
          const originalText = button.innerHTML;
          button.innerHTML = '<span>Checking...</span>';
          button.disabled = true;

          // Wait a moment and check again (event might fire late)
          setTimeout(async () => {
            const promptAvailable = deferredPrompt || (window as any).deferredInstallPrompt;
            if (promptAvailable) {
              // Retry if prompt became available
              console.log('✅ Prompt now available, retrying install...');
              button.innerHTML = originalText;
              button.disabled = false;
              handleInstallClick();
            } else {
              console.log('⚠️ Install prompt still not available after wait');
              console.log('🔍 Running full installability check...');
              button.innerHTML = originalText;
              button.disabled = false;
              // Check installability criteria
              await checkInstallability();
            }
          }, 2000); // Increased wait time to 2 seconds
        } else {
          // Fallback: check installability directly
          await checkInstallability();
        }
      }
    }
  };

  const checkInstallability = async () => {
    console.log('🔍 Checking PWA installability criteria...');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('🌐 Protocol:', location.protocol);
    console.log('🏠 Hostname:', location.hostname);

    const checks = {
      serviceWorker: false,
      manifest: false,
      https: false,
      icons: false,
      beforeinstallprompt: false
    };

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        checks.serviceWorker = !!registration;
        console.log('✅ Service Worker:', checks.serviceWorker ? 'Registered' : 'Not registered');
      } catch (e) {
        console.log('❌ Service Worker check failed:', e);
      }
    }

    // Check if manifest is loaded
    const manifestLink = document.querySelector('link[rel="manifest"]');
    checks.manifest = !!manifestLink;
    console.log('✅ Manifest:', checks.manifest ? 'Found' : 'Not found');

    // Check HTTPS
    checks.https = location.protocol === 'https:' || location.hostname === 'localhost';
    console.log('✅ HTTPS:', checks.https ? 'Yes' : 'No (required for PWA)');

    // Check icons in manifest
    try {
      const manifestResponse = await fetch('/manifest.json');
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        checks.icons = manifest.icons && manifest.icons.length > 0;
        console.log('✅ Icons:', checks.icons ? `Found ${manifest.icons.length} icon(s)` : 'Not found');
        if (manifest.icons) {
          console.log('   Icon details:', manifest.icons.map((i: any) => ({ sizes: i.sizes, type: i.type })));
        }
      }
    } catch (e) {
      console.log('❌ Manifest fetch failed:', e);
    }

    // Check if beforeinstallprompt is available
    checks.beforeinstallprompt = !!(deferredPrompt || (window as any).deferredInstallPrompt);
    console.log('✅ beforeinstallprompt:', checks.beforeinstallprompt ? 'Available' : 'Not available');

    const allChecksPass = Object.values(checks).every(v => v);
    console.log('📊 Installability check:', allChecksPass ? '✅ PASSED' : '❌ FAILED', checks);

    // Additional Android-specific checks
    if (isAndroid) {
      const chromeVersion = /Chrome\/(\d+)/.exec(navigator.userAgent)?.[1];
      const isChrome = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

      console.log('🤖 Android-specific checks:');
      console.log('   - Chrome version:', chromeVersion || 'Unknown');
      console.log('   - Is Chrome:', isChrome);
      console.log('   - Standalone mode:', isStandaloneMode);
      console.log('   - Display mode:', isStandaloneMode ? 'standalone' :
        window.matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' : 'browser');

      // Warn if Chrome version is too old
      if (chromeVersion && parseInt(chromeVersion) < 67) {
        console.warn('⚠️ Chrome version is too old. beforeinstallprompt requires Chrome 67+');
      }

      // Warn if not Chrome
      if (!isChrome) {
        console.warn('⚠️ Not using Chrome. beforeinstallprompt works best with Chrome/Edge browsers.');
      }
    }

    // If checks fail, show help
    if (!allChecksPass && isAndroid) {
      showAndroidInstallHelp(checks);
    } else if (!deferredPrompt && isAndroid) {
      // All checks pass but no prompt - might need to wait or user needs to use menu
      console.log('⚠️ All checks pass but beforeinstallprompt not fired. This can happen if:');
      console.log('   - User previously dismissed the prompt');
      console.log('   - App is already installed');
      console.log('   - Browser needs user interaction first');
      showAndroidInstallHelp(checks, true);
    }
  };

  const showAndroidInstallHelp = (checks?: any, waitingMode?: boolean) => {
    // Only show help if we're really stuck - otherwise keep trying
    if (waitingMode) {
      // Show a subtle notification that we're waiting for the prompt
      console.log('⏳ Waiting for install prompt to become available...');
      return;
    }

    // Create a modal with visual instructions (only as last resort)
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    const checkStatus = checks ? `
      <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin: 16px 0; text-align: left; font-size: 12px;">
        <p style="margin: 4px 0;"><strong>Service Worker:</strong> ${checks.serviceWorker ? '✅' : '❌'}</p>
        <p style="margin: 4px 0;"><strong>Manifest:</strong> ${checks.manifest ? '✅' : '❌'}</p>
        <p style="margin: 4px 0;"><strong>HTTPS:</strong> ${checks.https ? '✅' : '❌'}</p>
        <p style="margin: 4px 0;"><strong>Icons:</strong> ${checks.icons ? '✅' : '❌'}</p>
      </div>
    ` : '';

    modal.innerHTML = `
      <div style="background: white; border-radius: 16px; padding: 24px; max-width: 400px; text-align: center;">
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">Install ATB Matchmaking</h3>
        <p style="margin-bottom: 20px; color: #666;">The install prompt should appear automatically. If it doesn't, please use the browser menu:</p>
        ${checkStatus}
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="font-weight: 600; margin-bottom: 8px;">Tap the menu (⋮) →</p>
          <p style="font-weight: 600;">"Add to Home Screen" or "Install app"</p>
        </div>
        <button id="retry-install" style="background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; margin-bottom: 8px;">
          Try Again
        </button>
        <button id="close-help" style="background: transparent; color: #666; border: 1px solid #ddd; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%;">
          Close
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#retry-install')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      // Retry after a moment
      setTimeout(() => {
        handleInstallClick();
      }, 500);
    });

    modal.querySelector('#close-help')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  const showAndroidBrowserSpecificInstall = () => {
    const userAgent = navigator.userAgent;
    let instructions = '';
    let browserName = '';

    if (/SamsungBrowser/.test(userAgent)) {
      browserName = 'Samsung Internet';
      instructions = `1. Tap the menu (☰) at the bottom right
2. Tap "Add page to"
3. Select "Home screen"
4. Tap "Add"`;
    } else if (/Chrome/.test(userAgent)) {
      browserName = 'Chrome';
      instructions = `1. Tap the menu (⋮) at the top right
2. Tap "Add to Home screen" or "Install app"
3. Tap "Add" or "Install"`;
    } else if (/Firefox/.test(userAgent)) {
      browserName = 'Firefox';
      instructions = `1. Tap the menu (⋮) at the top right
2. Tap "Install" or "Add to Home Screen"
3. Follow the prompts`;
    } else {
      browserName = 'Your Browser';
      instructions = `1. Open the browser menu
2. Look for "Add to Home Screen" or "Install app"
3. Follow the prompts`;
    }

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    modal.innerHTML = `
      <div style="background: white; border-radius: 16px; padding: 24px; max-width: 400px; text-align: center;">
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Install ATB Matchmaking</h3>
        <p style="color: #666; margin-bottom: 20px; font-size: 14px;">For ${browserName}:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px; text-align: left; white-space: pre-line; font-size: 14px; line-height: 1.6;">
          ${instructions}
        </div>
        <button id="close-install-help" style="background: linear-gradient(to right, #8b5cf6, #ec4899); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%;">
          Got it
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#close-install-help')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  const showManualInstructions = () => {
    const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isDesktopDevice = window.innerWidth > 768 && !/Android|iPhone|iPad|iPod/.test(navigator.userAgent);

    // Never show manual instructions for Android - use native prompt only
    if (isIOSDevice) {
      alert(`📱 How to install ATB Matchmaking on iPhone/iPad:
      
1. Tap the Share button 📤 at the bottom of Safari
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" in the top right
4. The app will appear on your home screen!`);
    } else if (isDesktopDevice) {
      alert(`💻 How to install ATB Matchmaking on Desktop:
      
For Chrome/Edge:
• Look for the install icon (➕) in the address bar
• Or click the menu (⋮) → "Install ATB Matchmaking"
• Or use the install button that appears in the browser

The app will install as a desktop application!`);
    }
    // Android instructions removed - native prompt will handle it
  };

  // Enhanced check if app is already installed
  const isInstalled = isStandalone ||
    (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) ||
    (typeof window !== 'undefined' && window.matchMedia('(display-mode: fullscreen)').matches) ||
    (typeof window !== 'undefined' && (window.navigator as any).standalone === true);

  // Don't show if app is already installed
  if (isInstalled) {
    console.log('App is installed - hiding install button');
    return null;
  }

  // Always show button - it will handle platform-specific behavior
  // This ensures users can always see and click the install button

  // Debug: Log when button should render
  console.log('PWA Install Button Render Check:', {
    isStandalone,
    isIOS,
    isAndroid,
    isDesktop,
    showButton,
    shouldRender: !isStandalone
  });

  return (
    <>
      {/* Android-specific install prompt banner */}
      {isAndroid && deferredPrompt && (
        <AndroidInstallPrompt
          deferredPrompt={deferredPrompt}
          onInstall={() => {
            setDeferredPrompt(null);
            setShowButton(false);
          }}
          onDismiss={() => {
            // Keep button visible for manual install
          }}
        />
      )}

      {/* Floating install button - Always show for all platforms */}
      {/* Use consistent className on initial render to prevent hydration mismatch */}
      <div
        className={`md:hidden fixed ${mounted && isDesktop ? 'top-4 right-4' : 'bottom-24 right-4'} z-[9999]`}
      >
        <button
          onClick={handleInstallClick}
          disabled={requestingPermissions}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Install ATB Matchmaking app"
          style={{
            boxShadow: '0 10px 25px rgba(139, 92, 246, 0.5)',
            animation: requestingPermissions ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            position: 'relative',
            zIndex: 10000
          }}
        >
          {requestingPermissions ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="font-semibold text-sm">Requesting Permissions...</span>
            </>
          ) : isDesktop ? (
            <>
              <Monitor className="w-5 h-5" />
              <span className="font-semibold text-sm">Install Desktop App</span>
            </>
          ) : (
            <>
              <Smartphone className="w-5 h-5" />
              <span className="font-semibold text-sm">Install App</span>
            </>
          )}
        </button>
      </div>

      {/* iOS Install Guide - Only shown when button is clicked */}
      <IOSInstallGuide show={showIOSGuide} onClose={() => setShowIOSGuide(false)} />

      {/* Permission Request Modal for Android */}
      <PermissionRequestModal
        show={showPermissionModal}
        onGrant={async () => {
          setShowPermissionModal(false);
          const granted = await requestInstallPermissions();
          if (granted) {
            setPermissionsGranted(true);
            // Retry install after permissions granted
            setTimeout(() => handleInstallClick(), 500);
          }
        }}
        onDismiss={() => {
          setShowPermissionModal(false);
          // Continue with install even if permissions not granted
          handleInstallClick();
        }}
        permissions={permissionStatus}
      />
    </>
  );
}