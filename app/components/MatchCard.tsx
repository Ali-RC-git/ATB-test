'use client';

import { MessageCircle, CheckCircle, XCircle } from 'lucide-react';

interface Match {
  id: number;
  name: string;
  role: 'counselor' | 'candidate';
  image: string;
  matchScore: number;
  lastMessage?: string;
  time: string;
  unread?: number;
}

interface MatchCardProps {
  match: Match;
  onClick: (matchId: number) => void;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  return (
    <div 
      onClick={() => onClick(match.id)}
      className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="relative">
        <img 
          src={match.image} 
          alt={match.name}
          className="w-14 h-14 rounded-full object-cover border-2 border-purple-500"
        />
        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 border-2 border-white"></div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm truncate">{match.name}</h3>
          <span className="text-xs text-gray-500">{match.time}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            match.role === 'counselor' 
              ? 'bg-purple-100 text-purple-600' 
              : 'bg-pink-100 text-pink-600'
          }`}>
            {match.role === 'counselor' ? 'Counselor' : 'Candidate'}
          </span>
          <span className="text-xs text-gray-600">
            {match.matchScore}% match
          </span>
        </div>
        {match.lastMessage && (
          <p className="text-sm text-gray-600 truncate">{match.lastMessage}</p>
        )}
      </div>
      
      {match.unread && match.unread > 0 && (
        <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {match.unread}
        </div>
      )}
    </div>
  );
}

