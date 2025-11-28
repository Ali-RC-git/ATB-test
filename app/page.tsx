'use client';

import { useState, useEffect } from "react";
import { 
  Search,
  Camera,
  Video,
  FileText,
  Radio,
  Tag,
  Home,
  PlusSquare,
  ShoppingBag,
  User,
  Bell,
  MessageCircle,
  Heart,
  MessageSquare,
  Send,
  Bookmark,
  MoreHorizontal,
  ShoppingCart,
  X,
  Settings
} from 'lucide-react';
import Header from './components/Header';
import Stories from './components/Stories';
import ProductCard from './components/ProductCard';
import BottomNavigation from './components/BottomNavigation';
import CartSection from './components/CartSection';
import ProfileSection from './components/ProfileSection';
import PWAInstallButton from './components/PWAInstallButton';
import IOSInstallGuide from './components/IOSInstallGuide';

export default function ShoppingApp() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isStandalone);

    // Auto-show install prompt for Android after 3 seconds
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isAndroid && !isStandalone) {
      const timer = setTimeout(() => {
        setShowAndroidPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleLike = (productId: number) => {
    if (likedPosts.includes(productId)) {
      setLikedPosts(likedPosts.filter(id => id !== productId));
    } else {
      setLikedPosts([...likedPosts, productId]);
    }
  };

  // Sample data
  const stories = [
    { id: 1, name: "You", isUser: true, hasNew: false, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
    { id: 2, name: "Tech", hasNew: true, image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&h=150&fit=crop&crop=center" },
    { id: 3, name: "Fashion", hasNew: true, image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=150&h=150&fit=crop&crop=center" },
    { id: 4, name: "Home", hasNew: false, image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center" },
    { id: 5, name: "Electro", hasNew: true, image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&h=150&fit=crop&crop=center" },
  ];

  const products = [
    { 
      id: 1, 
      name: "DEWALK T&X", 
      description: "BERSHERS 1 Piece Kit", 
      price: "$45.99", 
      likes: "1.2k", 
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&h=500&fit=crop&crop=center",
      storeImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center",
      comments: "View all 24 comments",
      time: "2 hours ago"
    },
    { 
      id: 2, 
      name: "Aye Squirrel", 
      description: "Unique Collection", 
      price: "$18.75", 
      likes: "543", 
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&crop=center",
      storeImage: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=100&h=100&fit=crop&crop=center",
      comments: "View all 15 comments", 
      time: "3 hours ago"
    },
    { 
      id: 3, 
      name: "Tech Drink", 
      description: "Energy Boost Formula", 
      price: "$12.99", 
      likes: "892", 
      image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=500&h=500&fit=crop&crop=center",
      storeImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center",
      comments: "View all 31 comments",
      time: "1 hour ago"
    },
    { 
      id: 4, 
      name: "Fashion Wear", 
      description: "Latest Summer Collection", 
      price: "$34.99", 
      likes: "2.4k", 
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=500&fit=crop&crop=center",
      storeImage: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=100&h=100&fit=crop&crop=center",
      comments: "View all 67 comments",
      time: "4 hours ago"
    },
  ];

  const cartItems = [
    { 
      name: "Redhats SG8 Film", 
      specs: "Treated 100 x 50mm", 
      price: "$4.88", 
      quantity: 1, 
      total: "$87.84",
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=100&h=100&fit=crop&crop=center"
    },
    { 
      name: "Premium Headphones", 
      specs: "Wireless Noise Cancelling", 
      price: "$129.99", 
      quantity: 1, 
      total: "$129.99",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop&crop=center"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Stories stories={stories} />
       
      {/* iOS Install Guide */}
      <IOSInstallGuide />
      
      <main className="pb-16">
        {/* Home Tab - Instagram Feed */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isLiked={likedPosts.includes(product.id)}
                onLike={toggleLike}
              />
            ))}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="p-4">
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-gray-100 rounded-lg py-3 px-4 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-4">Popular Searches</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Electronics", icon: <ShoppingBag className="w-6 h-6" /> },
                { name: "Fashion", icon: <User className="w-6 h-6" /> },
                { name: "Home", icon: <Home className="w-6 h-6" /> },
                { name: "Beauty", icon: <Heart className="w-6 h-6" /> },
                { name: "Sports", icon: <Camera className="w-6 h-6" /> },
                { name: "Books", icon: <Bookmark className="w-6 h-6" /> }
              ].map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2 text-gray-600">
                    {category.icon}
                  </div>
                  <p className="text-sm font-medium">{category.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Tab */}
        {activeTab === 'add' && (
          <div className="p-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-lg p-8 mb-6">
                <div className="flex justify-center mb-4">
                  <Camera className="w-12 h-12 text-gray-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">Create New Post</h2>
                <p className="text-gray-600 mb-4">Share your favorite products with the community</p>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto">
                  <Camera className="w-5 h-5" />
                  Upload Photo
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Video, label: "Reels" },
                  { icon: FileText, label: "Story" },
                  { icon: Radio, label: "Live" },
                  { icon: Tag, label: "Guide" }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-center mb-2 text-gray-600">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Featured Collections</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl p-4 text-white">
                <h3 className="font-bold mb-2">Summer Sale</h3>
                <p className="text-sm opacity-90">Up to 50% off</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-teal-400 rounded-xl p-4 text-white">
                <h3 className="font-bold mb-2">New Arrivals</h3>
                <p className="text-sm opacity-90">Fresh styles</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Popular Categories</h3>
              {[
                { name: "Electronics", icon: ShoppingBag, count: "234 items" },
                { name: "Fashion", icon: User, count: "189 items" },
                { name: "Home & Garden", icon: Home, count: "156 items" },
                { name: "Beauty", icon: Heart, count: "98 items" },
                { name: "Sports", icon: Camera, count: "76 items" },
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-600">
                      <category.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-gray-500 text-sm">{category.count}</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === 'cart' && <CartSection cartItems={cartItems} />}

        {/* Profile Tab */}
        {activeTab === 'profile' && <ProfileSection products={products} />}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* PWA Install Button */}
      <PWAInstallButton isStandalone={isStandalone} />
      
      {/* Android Auto-Install Prompt */}
      {showAndroidPrompt && !isStandalone && (
        <div className="fixed bottom-20 left-4 right-4 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Install ATB Shop</h3>
              <p className="text-sm text-gray-600">Get the full app experience on your home screen</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAndroidPrompt(false)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 font-medium text-sm"
              >
                Later
              </button>
              <button
                onClick={() => {
                  const event = new Event('beforeinstallprompt');
                  window.dispatchEvent(event);
                  setShowAndroidPrompt(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}