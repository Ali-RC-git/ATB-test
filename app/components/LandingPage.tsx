'use client';

import { useState, useEffect } from "react";
import { Heart, Users, MessageCircle, Star, CheckCircle, ArrowRight, Search, Shield, Clock, TrendingUp, Home, User } from 'lucide-react';
import PWAInstallButton from './PWAInstallButton';
import BottomNavigation from './BottomNavigation';
import NotificationManager from './NotificationManager';
import SendNotificationButton from './SendNotificationButton';

export default function LandingPage() {
    const [isStandalone, setIsStandalone] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const checkStandalone = () => {
                // Multiple methods to detect if app is installed
                const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
                const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
                const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
                // Check if running in standalone mode (iOS)
                const isIOSStandalone = (window.navigator as any).standalone === true;
                // Check if window is not in browser (Android)
                const isAndroidStandalone = !window.matchMedia('(display-mode: browser)').matches &&
                    (window.navigator as any).standalone !== false &&
                    window.matchMedia('(display-mode: standalone)').matches;

                const installed = isStandaloneMode || isFullscreen || isMinimalUI || isIOSStandalone || isAndroidStandalone;

                setIsStandalone(installed);

                console.log('Standalone detection:', {
                    isStandaloneMode,
                    isFullscreen,
                    isMinimalUI,
                    isIOSStandalone,
                    isAndroidStandalone,
                    final: installed
                });
            };
            checkStandalone();
            // Check periodically in case it changes
            const interval = setInterval(checkStandalone, 1000);
            window.addEventListener('resize', checkStandalone);
            return () => {
                clearInterval(interval);
                window.removeEventListener('resize', checkStandalone);
            };
        }
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                ATB Matchmaking
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium">Features</a>
                            <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 font-medium">How It Works</a>
                            <a href="#testimonials" className="text-gray-700 hover:text-purple-600 font-medium">Testimonials</a>
                            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Connect with the Perfect
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Match</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                            ATB Matchmaking connects career counselors with candidates seeking guidance.
                            Find your perfect professional match today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                Find a Counselor
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="border-2 border-purple-500 text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-all">
                                Become a Counselor
                            </button>
                        </div>
                        <div className="mt-8 flex items-center gap-6">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">500+</div>
                                <div className="text-sm text-gray-600">Active Users</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">1,200+</div>
                                <div className="text-sm text-gray-600">Successful Matches</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">4.8</div>
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    Average Rating
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="relative">
                            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 shadow-2xl">
                                <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                            SJ
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Sarah Johnson</h3>
                                            <p className="text-gray-600">Career Counselor</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-sm font-semibold">4.9</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-4">
                                        "Helping professionals navigate career transitions with 10+ years of experience."
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">Tech</span>
                                        <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">Finance</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-lg">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                            DK
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">David Kim</h3>
                                            <p className="text-gray-600">Software Engineer</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-sm text-gray-600">Looking for guidance</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-4">
                                        "Seeking career guidance in transitioning from software development to product management."
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">Tech</span>
                                        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">Product</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="bg-gray-50 py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose ATB Matchmaking?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Connect with verified professionals and find the perfect match for your career journey
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <Search className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Matching</h3>
                            <p className="text-gray-600">
                                Our algorithm matches you with counselors or candidates based on your goals, experience, and preferences.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-pink-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Profiles</h3>
                            <p className="text-gray-600">
                                All counselors are verified professionals with proven experience and credentials.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <MessageCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Communication</h3>
                            <p className="text-gray-600">
                                Connect and communicate directly through our secure messaging platform.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Scheduling</h3>
                            <p className="text-gray-600">
                                Schedule sessions at your convenience with counselors who match your availability.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Rating System</h3>
                            <p className="text-gray-600">
                                Read reviews and ratings from other users to make informed decisions.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Career Growth</h3>
                            <p className="text-gray-600">
                                Track your progress and achieve your career goals with professional guidance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Get started in three simple steps
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Profile</h3>
                            <p className="text-gray-600">
                                Sign up and create a detailed profile. Specify whether you're a counselor or candidate, and add your experience and goals.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Find Your Match</h3>
                            <p className="text-gray-600">
                                Browse through verified profiles or let our smart matching algorithm suggest the perfect match for you.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Connecting</h3>
                            <p className="text-gray-600">
                                Send messages, schedule sessions, and begin your journey toward achieving your career goals.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="bg-gray-50 py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            What Our Users Say
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Real stories from counselors and candidates who found success
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4">
                                "ATB Matchmaking helped me find the perfect counselor for my career transition. The matching process was seamless and the counselor was exactly what I needed."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                    DK
                                </div>
                                <div>
                                    <div className="font-semibold">David Kim</div>
                                    <div className="text-sm text-gray-600">Software Engineer</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4">
                                "As a counselor, I've connected with amazing candidates through this platform. The interface is professional and the matching system works really well."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                                    SJ
                                </div>
                                <div>
                                    <div className="font-semibold">Sarah Johnson</div>
                                    <div className="text-sm text-gray-600">Career Counselor</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4">
                                "I was skeptical at first, but ATB Matchmaking exceeded my expectations. Found my career counselor within days and made significant progress."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                    JM
                                </div>
                                <div>
                                    <div className="font-semibold">Jessica Martinez</div>
                                    <div className="text-sm text-gray-600">Marketing Professional</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-16 md:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Find Your Perfect Match?
                    </h2>
                    <p className="text-lg text-purple-100 mb-8">
                        Join hundreds of professionals who have found success through ATB Matchmaking
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                        <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all">
                            Get Started Free
                        </button>
                        <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all">
                            Learn More
                        </button>
                    </div>

                    {/* Admin: Send Notification Button (for testing) */}
                    <div className="mt-8 pt-8 border-t border-purple-400/30">
                        <p className="text-purple-100 mb-4 text-sm font-semibold">Admin: Test Push Notifications</p>
                        <div className="max-w-md mx-auto">
                            <SendNotificationButton />
                        </div>
                    </div>

                    {/* Install App CTA for Mobile */}
                    {!isStandalone && (
                        <div className="mt-8 pt-8 border-t border-purple-400/30">
                            <p className="text-purple-100 mb-4 text-sm">Install our app for the best experience</p>
                            <p className="text-purple-200 text-xs">Look for the floating install button on your screen</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold text-white">ATB Matchmaking</span>
                            </div>
                            <p className="text-sm">
                                Connecting counselors and candidates for successful career journeys.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">For Counselors</a></li>
                                <li><a href="#" className="hover:text-white">For Candidates</a></li>
                                <li><a href="#" className="hover:text-white">How It Works</a></li>
                                <li><a href="#" className="hover:text-white">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Support</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">Help Center</a></li>
                                <li><a href="#" className="hover:text-white">FAQs</a></li>
                                <li><a href="#" className="hover:text-white">Community</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                        <p>&copy; 2024 ATB Matchmaking. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Install Button - Visible on all devices */}
            <PWAInstallButton isStandalone={isStandalone} />

            {/* Notification Manager - Works like Instagram/Facebook/WhatsApp */}
            <NotificationManager />

            {/* Bottom Navigation - Instagram style for mobile */}
            <div className="md:hidden">
                <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
        </div>
    );
}

