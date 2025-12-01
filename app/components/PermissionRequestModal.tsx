'use client';

import { useState } from "react";
import { Shield, CheckCircle, XCircle, X } from 'lucide-react';

interface PermissionRequestModalProps {
    show: boolean;
    onGrant: () => void;
    onDismiss: () => void;
    permissions: {
        notifications: 'default' | 'granted' | 'denied';
        serviceWorker: boolean;
    };
}

export default function PermissionRequestModal({ show, onGrant, onDismiss, permissions }: PermissionRequestModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-purple-600" />
                        <h3 className="text-xl font-bold text-gray-900">Permissions Required</h3>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    To install the app, we need to request some permissions:
                </p>

                <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${permissions.notifications === 'granted' ? 'bg-green-100' :
                                    permissions.notifications === 'denied' ? 'bg-red-100' : 'bg-yellow-100'
                                }`}>
                                {permissions.notifications === 'granted' ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : permissions.notifications === 'denied' ? (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                ) : (
                                    <Shield className="w-5 h-5 text-yellow-600" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Notifications</p>
                                <p className="text-xs text-gray-500">
                                    {permissions.notifications === 'granted' ? 'Granted' :
                                        permissions.notifications === 'denied' ? 'Denied' : 'Not requested'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${permissions.serviceWorker ? 'bg-green-100' : 'bg-yellow-100'
                                }`}>
                                {permissions.serviceWorker ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <Shield className="w-5 h-5 text-yellow-600" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Service Worker</p>
                                <p className="text-xs text-gray-500">
                                    {permissions.serviceWorker ? 'Registered' : 'Not registered'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onDismiss}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onGrant}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                        Grant Permissions
                    </button>
                </div>
            </div>
        </div>
    );
}

