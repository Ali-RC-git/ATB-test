'use client';

import { useState, useEffect } from "react";
import { X, Download } from 'lucide-react';

interface AndroidInstallPromptProps {
    deferredPrompt: any;
    onInstall: () => void;
    onDismiss: () => void;
}

export default function AndroidInstallPrompt({ deferredPrompt, onInstall, onDismiss }: AndroidInstallPromptProps) {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Show the prompt banner after 3 seconds for Android users
        const timer = setTimeout(() => {
            setShowPrompt(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            try {
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    onInstall();
                    setShowPrompt(false);
                }
            } catch (error) {
                console.error('Install error:', error);
            }
        }
    };

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[10000] md:hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-2xl p-4 animate-slide-up">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">Install ATB Matchmaking</h3>
                        <p className="text-sm text-white/90">Get the app on your home screen for quick access</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowPrompt(false);
                            onDismiss();
                        }}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleInstall}
                        className="flex-1 bg-white text-purple-600 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                    >
                        Install Now
                    </button>
                    <button
                        onClick={() => {
                            setShowPrompt(false);
                            onDismiss();
                        }}
                        className="px-4 py-3 text-white/90 hover:text-white transition-colors"
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    );
}

