// API Route: Register FCM Token
// POST /api/notifications/register
// Body: { token: string, userId?: string, deviceInfo?: string }

import { NextRequest, NextResponse } from 'next/server';
import { storeToken, getTokenCount } from '@/app/lib/token-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, userId, deviceInfo } = body;

    // Validate token
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required and must be a string' },
        { status: 400 }
      );
    }

    // Store the token
    storeToken(token, userId, deviceInfo);

    return NextResponse.json({
      success: true,
      message: 'Token registered successfully',
      tokenCount: getTokenCount(),
    });
  } catch (error) {
    console.error('Error registering token:', error);
    return NextResponse.json(
      { error: 'Failed to register token' },
      { status: 500 }
    );
  }
}
