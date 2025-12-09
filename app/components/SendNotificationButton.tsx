'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle, XCircle, Bell } from 'lucide-react';

interface SendNotificationButtonProps {
  className?: string;
}

export default function SendNotificationButton({ className = '' }: SendNotificationButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const sendNotification = async () => {
    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '🎉 New Update from ATB Matchmaking!',
          body: 'This is a test notification sent to all registered devices. If you see this, push notifications are working! 🚀',
          data: {
            url: '/',
            type: 'broadcast',
            timestamp: Date.now().toString(),
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `✅ Notification sent successfully!`,
          details: data,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send notification',
          details: data,
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Network error. Check console for details.',
        details: null,
      });
      console.error('Error sending notification:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={sendNotification}
        disabled={isSending}
        className={`
          w-full bg-gradient-to-r from-purple-500 to-pink-500 
          text-white font-semibold py-3 px-6 rounded-lg 
          shadow-lg hover:shadow-xl transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
          hover:from-purple-600 hover:to-pink-600
          active:scale-95
        `}
      >
        {isSending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending to all devices...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Push Notification to All Devices
          </>
        )}
      </button>

      {result && (
        <div
          className={`
            p-4 rounded-lg border-2
            ${result.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
            }
          `}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{result.message}</p>
              {result.details && (
                <div className="mt-2 text-sm space-y-1">
                  {result.details.sent !== undefined && (
                    <p>
                      ✅ Sent: {result.details.sent} device(s)
                    </p>
                  )}
                  {result.details.failed !== undefined && result.details.failed > 0 && (
                    <p className="text-orange-600">
                      ⚠️ Failed: {result.details.failed} device(s)
                    </p>
                  )}
                  {result.details.total !== undefined && (
                    <p className="text-gray-600">
                      📱 Total registered: {result.details.total} device(s)
                    </p>
                  )}
                  {result.details.registeredDevices !== undefined && (
                    <p className="text-gray-600">
                      📱 Registered devices: {result.details.registeredDevices}
                    </p>
                  )}
                  {result.details.message && (
                    <p className="text-gray-600 italic">{result.details.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
