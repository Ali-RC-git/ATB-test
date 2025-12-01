
'use client';

import { useState, useEffect } from "react";

interface IOSInstallGuideProps {
  show: boolean;
  onClose: () => void;
}

export default function IOSInstallGuide({ show, onClose }: IOSInstallGuideProps) {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIOS(isIos);
  }, []);

  if (!isIOS || !show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="text-center">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Install ATB Matchmaking
          </h3>
          <p className="text-gray-600 mb-6">
            Add to your home screen for quick access
          </p>

          <div className="space-y-4 text-left mb-6">
            <div className="flex items-start gap-3">
              <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span className="text-sm text-gray-700">Tap the <strong>Share button</strong> <span className="text-xl">📤</span> at the bottom</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span className="text-sm text-gray-700">Scroll and tap <strong>"Add to Home Screen"</strong></span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span className="text-sm text-gray-700">Tap <strong>"Add"</strong> in the top right</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}