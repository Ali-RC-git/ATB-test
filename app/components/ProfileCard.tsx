'use client';

import { Heart, MessageSquare, Star, MapPin, Briefcase, GraduationCap } from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  role: 'counselor' | 'candidate';
  title: string;
  bio: string;
  image: string;
  location: string;
  experience?: string;
  education?: string;
  rating: string;
  matches: string;
  verified: boolean;
  time: string;
}

interface ProfileCardProps {
  profile: Profile;
  isLiked: boolean;
  onLike: (profileId: number) => void;
  onMessage: (profileId: number) => void;
}

export default function ProfileCard({ profile, isLiked, onLike, onMessage }: ProfileCardProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Profile Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={profile.image} 
              alt={profile.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
            />
            {profile.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{profile.name}</h3>
              {profile.role === 'counselor' && (
                <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  Counselor
                </span>
              )}
              {profile.role === 'candidate' && (
                <span className="bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  Candidate
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{profile.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold">{profile.rating}</span>
        </div>
      </div>

      {/* Profile Image */}
      <div className="w-full aspect-[4/3] bg-gray-100">
        <img 
          src={profile.image} 
          alt={profile.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Info */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-800 mb-3">{profile.bio}</p>
        
        {/* Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{profile.location}</span>
          </div>
          {profile.experience && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4" />
              <span>{profile.experience}</span>
            </div>
          )}
          {profile.education && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <GraduationCap className="w-4 h-4" />
              <span>{profile.education}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => onLike(profile.id)}
            >
              <Heart 
                size={24} 
                className={isLiked ? "text-red-500 fill-red-500" : "text-gray-900"}
              />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => onMessage(profile.id)}
            >
              <MessageSquare size={24} className="text-gray-900" />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {profile.matches} matches
          </div>
        </div>

        <div className="text-gray-400 text-xs">
          {profile.time}
        </div>
      </div>
    </div>
  );
}

