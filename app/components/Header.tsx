'use client';

import { Camera, MessageCircle, Bell } from 'lucide-react';
import NotificationManager  from './NotificationManager';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <button className="p-2">
            <Camera size={24} className="text-gray-900" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-500 to-pink-500 rounded-full flex items-center justify-center p-4">
              <span className="text-white font-bold text-sm">ATB</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ATB
            </span>
          </div>

          <div className="flex items-center gap-3">
             <NotificationManager />
          </div>
        </div>
      </div>
    </header>
  );
}