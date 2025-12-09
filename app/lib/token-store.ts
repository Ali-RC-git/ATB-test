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
// Using globalThis to ensure singleton across Next.js hot reloads
const globalForTokenStore = globalThis as unknown as {
  tokenStore: Map<string, TokenRecord> | undefined;
};

const tokenStore = globalForTokenStore.tokenStore ?? new Map<string, TokenRecord>();

if (process.env.NODE_ENV !== 'production') {
  globalForTokenStore.tokenStore = tokenStore;
}

console.log(`🔧 Token store initialized (size: ${tokenStore.size})`);

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
  const tokens = Array.from(tokenStore.keys());
  console.log(`📊 getAllTokens called - Found ${tokens.length} token(s)`);
  console.log(`📊 Token store size: ${tokenStore.size}`);
  if (tokens.length > 0) {
    console.log(`📊 First token: ${tokens[0].substring(0, 20)}...`);
  }
  return tokens;
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
