'use client';

import { useState, useEffect } from "react";
import { Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  isStandalone: boolean;
}

export default function PWAInstallButton({ isStandalone }: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Handle Android PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    // Check if user is on Android
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isAndroid) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android - trigger native install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('App installed successfully');
        setDeferredPrompt(null);
        setShowButton(false);
      }
    } else {
      // iOS or other - show manual instructions
      showManualInstructions();
    }
  };

  const showManualInstructions = () => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      alert(`📱 How to install on iPhone/iPad:
      
1. Tap the Share button 📤 at the bottom
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" in the top right
4. The app will appear on your home screen!`);
    } else {
      alert(`📱 How to install this app:
      
For Chrome/Android:
• Tap menu (⋮) → "Add to Home Screen"

For Safari/iOS:
• Tap share 📤 → "Add to Home Screen"

For Samsung Browser:
• Tap menu (⁝) → "Add page to" → "Home screen"`);
    }
  };

  // Don't show if app is already installed or not on mobile
  if (isStandalone || !showButton) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={handleInstallClick}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce hover:animate-none transition-all duration-300"
      >
        <span className="text-lg"><Smartphone/></span>
        <span className="font-semibold text-sm">Install App</span>
      </button>
    </div>
  );
}