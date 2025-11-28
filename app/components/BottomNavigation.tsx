'use client';

import { Home, Search, PlusSquare, ShoppingBag, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { icon: Home, label: "Home", id: "home" },
    { icon: Search, label: "Search", id: "search" },
    { icon: PlusSquare, label: "Add", id: "add" },
    { icon: ShoppingBag, label: "Shop", id: "shop" },
    { icon: User, label: "Profile", id: "profile" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${
              activeTab === tab.id ? 'text-black' : 'text-gray-500'
            }`}
          >
            <tab.icon 
              size={24} 
              className={activeTab === tab.id ? "fill-black" : ""}
            />
            <span className="text-[10px] mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}