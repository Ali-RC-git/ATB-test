'use client';

import { Heart, MessageSquare, Send, Bookmark, MoreHorizontal } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  likes: string;
  image: string;
  storeImage: string;
  comments: string;
  time: string;
}

interface ProductCardProps {
  product: Product;
  isLiked: boolean;
  onLike: (productId: number) => void;
}

export default function ProductCard({ product, isLiked, onLike }: ProductCardProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Product Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={product.storeImage} 
            alt={product.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-sm">{product.name}</h3>
            <p className="text-xs text-gray-500">Sponsored</p>
          </div>
        </div>
        <button className="p-1">
          <MoreHorizontal size={20} className="text-gray-900" />
        </button>
      </div>

      {/* Product Image */}
      <div className="w-full aspect-square bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button 
              className="p-1"
              onClick={() => onLike(product.id)}
            >
              <Heart 
                size={24} 
                className={isLiked ? "text-red-500 fill-red-500" : "text-gray-900"}
              />
            </button>
            <button className="p-1">
              <MessageSquare size={24} className="text-gray-900" />
            </button>
            <button className="p-1">
              <Send size={24} className="text-gray-900" />
            </button>
          </div>
          <button className="p-1">
            <Bookmark size={24} className="text-gray-900" />
          </button>
        </div>

        {/* Likes */}
        <div className="mb-2">
          <span className="font-semibold text-sm">{product.likes} likes</span>
        </div>

        {/* Product Info */}
        <div className="mb-2">
          <span className="font-semibold text-sm">{product.name} </span>
          <span className="text-sm text-gray-800">{product.description}</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-600 font-bold">{product.price}</span>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Add to Cart
          </button>
        </div>

        {/* Comments */}
        <button className="text-gray-500 text-sm mb-1">
          {product.comments}
        </button>
        <div className="text-gray-400 text-xs">
          {product.time}
        </div>
      </div>
    </div>
  );
}