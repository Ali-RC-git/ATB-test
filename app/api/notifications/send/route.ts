// API Route: Send Push Notification to All Devices
// POST /api/notifications/send
// Body: { title: string, body: string, data?: object }

import { NextRequest, NextResponse } from 'next/server';
import { getAdminMessaging } from '@/app/lib/firebase-admin';
import { getAllTokens } from '@/app/lib/token-store';

export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase Admin
    const messaging = getAdminMessaging();
    if (!messaging) {
      console.error('❌ Firebase Admin not initialized');
      return NextResponse.json(
        {
          success: false,
          error: 'Firebase Admin not initialized',
          message: 'Backend push notifications require Firebase service account configuration.',
          details: 'Browser notifications still work locally. To enable backend push notifications, configure Firebase Admin with a service account.',
          documentation: 'See FIREBASE_SETUP.md and HOW_TO_GET_SERVICE_ACCOUNT_KEY.md for setup instructions.'
        },
        { status: 503 }
      );
    }

    // Get request body
    const body = await request.json();
    const { title, body: messageBody, data = {} } = body;

    // Validate required fields
    if (!title || !messageBody) {
      console.error('❌ Validation error: Missing title or body');
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Title and body are required',
          missingFields: [!title && 'title', !messageBody && 'body'].filter(Boolean)
        },
        { status: 400 }
      );
    }

    // Get all registered tokens
    const tokens = getAllTokens();

    if (tokens.length === 0) {
      console.warn('⚠️ No devices registered for notifications');
      return NextResponse.json(
        {
          success: false,
          error: 'No devices registered',
          message: 'No FCM tokens found. Make sure users have enabled notifications.',
          data: {
            tokenCount: 0
          }
        },
        { status: 400 }
      );
    }

    // Prepare the message
    const message = {
      notification: {
        title: title,
        body: messageBody,
      },
      data: {
        ...data,
        url: data.url || '/',
        timestamp: Date.now().toString(),
      },
      webpush: {
        notification: {
          icon: '/heart.png',
          badge: '/heart.png',
          requireInteraction: false,
        },
      },
    };

    // Send to all tokens
    // Firebase Admin supports sending to multiple tokens using sendEach()
    const messages = tokens.map(token => ({
      ...message,
      token: token,
    }));

    console.log(`📤 Sending notification to ${tokens.length} device(s)...`);

    // Send notifications
    const responses = await Promise.allSettled(
      messages.map(msg => messaging.send(msg))
    );

    // Count successes and failures
    const successful = responses.filter(r => r.status === 'fulfilled').length;
    const failed = responses.filter(r => r.status === 'rejected').length;

    // Log failed tokens (they may be invalid/expired)
    const failedTokens: string[] = [];
    responses.forEach((result, index) => {
      if (result.status === 'rejected') {
        const error = result.reason;
        console.error(`❌ Failed to send to token ${index}:`, error.code || error.message);

        // Remove invalid tokens
        if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
          failedTokens.push(tokens[index]);
        }
      }
    });

    // Remove invalid tokens
    if (failedTokens.length > 0) {
      const { removeToken } = await import('@/app/lib/token-store');
      failedTokens.forEach(token => removeToken(token));
      console.log(`🗑️ Removed ${failedTokens.length} invalid token(s)`);
    }

    // Log success
    console.log(`✅ Notifications sent: ${successful} succeeded, ${failed} failed`);

    // Return detailed success response
    return NextResponse.json({
      success: true,
      message: successful > 0
        ? `Successfully sent ${successful} notification(s)`
        : 'No notifications were sent successfully',
      data: {
        sent: successful,
        failed: failed,
        total: tokens.length,
        invalidTokensRemoved: failedTokens.length,
        timestamp: new Date().toISOString(),
      },
      warnings: failed > 0 ? [`${failed} notification(s) failed to send`] : undefined,
    });
  } catch (error: any) {
    console.error('❌ Error sending notifications:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Return detailed error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send notifications',
        message: error.message || 'Unknown error occurred',
        errorCode: error.code || 'UNKNOWN_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET() {
  const { getTokenCount } = await import('@/app/lib/token-store');
  const tokenCount = getTokenCount();

  return NextResponse.json({
    status: 'ready',
    registeredDevices: tokenCount,
    message: tokenCount > 0
      ? `${tokenCount} device(s) registered and ready to receive notifications`
      : 'No devices registered yet. Users need to enable notifications first.',
  });
}
