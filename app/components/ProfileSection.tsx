'use client';

import { MoreHorizontal, Star, MapPin, Briefcase, GraduationCap, Settings } from 'lucide-react';

interface Profile {
  id: number;
  image: string;
}

interface ProfileSectionProps {
  profiles: Profile[];
}

export default function ProfileSection({ profiles }: ProfileSectionProps) {
  return (
    <div className="p-4">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
          />
          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-xl font-bold">john_doe</h1>
            <button className="bg-gray-100 px-3 py-1 rounded text-sm font-semibold">
              Edit Profile
            </button>
            <button className="p-2">
              <Settings size={20} className="text-gray-900" />
            </button>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="font-bold">24</div>
              <div className="text-gray-500 text-sm">Matches</div>
            </div>
            <div className="text-center">
              <div className="font-bold">156</div>
              <div className="text-gray-500 text-sm">Connections</div>
            </div>
            <div className="text-center">
              <div className="font-bold">89</div>
              <div className="text-gray-500 text-sm">Likes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mb-6 space-y-2">
        <h2 className="font-semibold text-lg">John Doe</h2>
        <p className="text-sm text-gray-600">Career Counselor • Helping professionals find their path</p>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold">4.8</span>
          <span className="text-sm text-gray-500">(124 reviews)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>New York, USA</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="w-4 h-4" />
          <span>10+ years experience</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <GraduationCap className="w-4 h-4" />
          <span>M.A. in Career Counseling</span>
        </div>
      </div>

      {/* Profile Highlights */}
      <div className="flex gap-4 mb-6 overflow-x-auto hide-scrollbar">
        {['Verified', 'Premium', 'Available'].map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
              {item[0]}
            </div>
            <span className="text-xs mt-1">{item}</span>
          </div>
        ))}
      </div>

      {/* Profile Tabs */}
      <div className="flex border-b border-gray-200">
        {['Matches', 'Saved', 'Activity'].map((tab) => (
          <button key={tab} className="flex-1 py-3 text-center font-semibold border-b-2 border-black">
            {tab}
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-3 gap-1 mt-2">
        {profiles.slice(0, 6).map((profile, index) => (
          <div key={index} className="aspect-square bg-gray-100 relative">
            <img 
              src={profile.image} 
              alt={`Match ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <div className="text-white text-xs font-semibold">Match {index + 1}</div>
            </div>
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