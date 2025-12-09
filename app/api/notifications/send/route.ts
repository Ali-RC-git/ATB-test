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
      return NextResponse.json(
        { error: 'Firebase Admin not initialized. Check service account configuration.' },
        { status: 500 }
      );
    }

    // Get request body
    const body = await request.json();
    const { title, body: messageBody, data = {} } = body;

    // Validate required fields
    if (!title || !messageBody) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Get all registered tokens
    const tokens = getAllTokens();

    if (tokens.length === 0) {
      return NextResponse.json(
        { 
          error: 'No devices registered',
          message: 'No FCM tokens found. Make sure users have enabled notifications.',
          tokenCount: 0
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

    return NextResponse.json({
      success: true,
      message: 'Notifications sent',
      sent: successful,
      failed: failed,
      total: tokens.length,
      invalidTokensRemoved: failedTokens.length,
    });
  } catch (error: any) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send notifications',
        message: error.message || 'Unknown error'
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
