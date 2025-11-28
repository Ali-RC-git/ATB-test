'use client';

import { MoreHorizontal } from 'lucide-react';

interface Product {
  id: number;
  image: string;
}

interface ProfileSectionProps {
  products: Product[];
}

export default function ProfileSection({ products }: ProfileSectionProps) {
  return (
    <div className="p-4">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-6">
        <img 
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border-2 border-gradient-to-r from-purple-500 to-pink-500"
        />
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-xl font-bold">atb_shop</h1>
            <button className="bg-gray-100 px-3 py-1 rounded text-sm font-semibold">
              Edit Profile
            </button>
            <button className="p-2">
              <MoreHorizontal size={20} className="text-gray-900" />
            </button>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="font-bold">124</div>
              <div className="text-gray-500 text-sm">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold">1.2K</div>
              <div className="text-gray-500 text-sm">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold">356</div>
              <div className="text-gray-500 text-sm">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Highlights */}
      <div className="flex gap-4 mb-6 overflow-x-auto hide-scrollbar">
        {['Plus Member', 'Reviews', 'Wishlist'].map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-shrink-0">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=100&h=100&fit=crop&crop=center"
                alt={item}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="text-xs mt-1">{item}</span>
          </div>
        ))}
      </div>

      {/* Profile Tabs */}
      <div className="flex border-b border-gray-200">
        {['Posts', 'Saved', 'Tagged'].map((tab) => (
          <button key={tab} className="flex-1 py-3 text-center font-semibold border-b-2 border-black">
            {tab}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1 mt-2">
        {products.slice(0, 6).map((product, index) => (
          <div key={index} className="aspect-square bg-gray-100">
            <img 
              src={product.image} 
              alt={`Post ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}