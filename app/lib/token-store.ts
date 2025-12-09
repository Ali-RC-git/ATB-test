// Simple in-memory token store for FCM tokens
// In production, replace this with a database (MongoDB, PostgreSQL, etc.)

interface TokenRecord {
  token: string;
  userId?: string;
  deviceInfo?: string;
  registeredAt: Date;
  lastUsed?: Date;
}

// In-memory store (replace with database in production)
const tokenStore = new Map<string, TokenRecord>();

// Store a token
export function storeToken(token: string, userId?: string, deviceInfo?: string): void {
  tokenStore.set(token, {
    token,
    userId,
    deviceInfo,
    registeredAt: new Date(),
    lastUsed: new Date(),
  });
  console.log(`✅ Token stored (Total: ${tokenStore.size})`);
}

// Get all tokens
export function getAllTokens(): string[] {
  return Array.from(tokenStore.keys());
}

// Get tokens for a specific user
export function getTokensByUserId(userId: string): string[] {
  return Array.from(tokenStore.values())
    .filter(record => record.userId === userId)
    .map(record => record.token);
}

// Remove a token (when user unsubscribes)
export function removeToken(token: string): void {
  tokenStore.delete(token);
  console.log(`🗑️ Token removed (Total: ${tokenStore.size})`);
}

// Get token count
export function getTokenCount(): number {
  return tokenStore.size;
}

// Get all token records (for debugging)
export function getAllTokenRecords(): TokenRecord[] {
  return Array.from(tokenStore.values());
}

// Clear all tokens (for testing)
export function clearAllTokens(): void {
  tokenStore.clear();
  console.log('🗑️ All tokens cleared');
}
