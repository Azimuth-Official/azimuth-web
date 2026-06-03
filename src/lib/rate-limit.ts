// Token-bucket rate limiter for API endpoints
// Single-instance in-memory implementation

export interface RateLimitConfig {
  maxTokens: number;
  refillRate: number;
  refillIntervalMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

interface TokenBucket {
  tokens: number;
  lastRefillMs: number;
}

// Global state: map of {ip:bucket} -> TokenBucket
const buckets = new Map<string, TokenBucket>();

// Preset bucket configurations
export const RATE_LIMIT_CONFIG = {
  AUTH: { maxTokens: 5, refillRate: 1, refillIntervalMs: 60000 },
  WRITE: { maxTokens: 30, refillRate: 5, refillIntervalMs: 60000 },
  READ: { maxTokens: 60, refillRate: 10, refillIntervalMs: 60000 },
  OBSERVATION: { maxTokens: 120, refillRate: 20, refillIntervalMs: 60000 },
};

/**
 * Apply rate limiting using token bucket algorithm.
 * Returns whether the request is allowed and metadata about the bucket state.
 */
export function rateLimit(
  ip: string,
  bucket: string,
  config: RateLimitConfig,
): RateLimitResult {
  const key = `${ip}:${bucket}`;
  const now = Date.now();

  // Initialize or retrieve bucket
  let tokenBucket = buckets.get(key);
  if (!tokenBucket) {
    tokenBucket = {
      tokens: config.maxTokens,
      lastRefillMs: now,
    };
    buckets.set(key, tokenBucket);
  }

  // Refill tokens based on elapsed time
  const elapsedMs = now - tokenBucket.lastRefillMs;
  const refillIntervals = Math.floor(elapsedMs / config.refillIntervalMs);

  if (refillIntervals > 0) {
    const tokensToAdd = refillIntervals * config.refillRate;
    tokenBucket.tokens = Math.min(
      config.maxTokens,
      tokenBucket.tokens + tokensToAdd,
    );
    tokenBucket.lastRefillMs += refillIntervals * config.refillIntervalMs;
  }

  // Check if request is allowed
  const allowed = tokenBucket.tokens >= 1;

  if (allowed) {
    tokenBucket.tokens -= 1;
  }

  // Calculate reset time
  const nextRefillMs =
    tokenBucket.lastRefillMs + config.refillIntervalMs - now;
  const resetMs = Math.max(0, nextRefillMs);

  return {
    allowed,
    remaining: Math.floor(tokenBucket.tokens),
    resetMs,
  };
}

/**
 * Prune stale entries older than ttlMs to prevent memory leak.
 * Call periodically (e.g., every 5 minutes).
 */
export function pruneStaleEntries(ttlMs: number = 600000): void {
  const now = Date.now();
  const entriesToDelete: string[] = [];

  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefillMs > ttlMs) {
      entriesToDelete.push(key);
    }
  }

  entriesToDelete.forEach((key) => buckets.delete(key));
}

// Start automatic pruning every 5 minutes
let pruneIntervalId: NodeJS.Timeout | null = null;

export function startAutoPrune(): void {
  if (!pruneIntervalId) {
    pruneIntervalId = setInterval(() => {
      pruneStaleEntries(600000); // 10 minutes TTL
    }, 300000); // Prune every 5 minutes
    // Prevent process from hanging if this is the only active timer
    if (pruneIntervalId.unref) {
      pruneIntervalId.unref();
    }
  }
}

export function stopAutoPrune(): void {
  if (pruneIntervalId) {
    clearInterval(pruneIntervalId);
    pruneIntervalId = null;
  }
}
