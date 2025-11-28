'use client';

interface Story {
  id: number;
  name: string;
  isUser: boolean;
  hasNew: boolean;
  image: string;
}

interface StoriesProps {
  stories: Story[];
}

export default function Stories({ stories }: StoriesProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex space-x-4 overflow-x-auto hide-scrollbar">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center space-y-1 flex-shrink-0">
            <div className={`w-16 h-16 rounded-full p-0.5 ${
              story.hasNew ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
            }`}>
              <div className="w-full h-full bg-white rounded-full p-0.5">
                <img 
                  src={story.image} 
                  alt={story.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-xs text-gray-600 max-w-16 truncate">
              {story.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}