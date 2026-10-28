/**
 * In-memory sliding-window rate limiter for sensitive authentication endpoints.
 * Protects against brute-force password guessing and registration spam.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes (unrefed so tests and CLI tasks can exit cleanly)
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

export interface RateLimitOptions {
  keyPrefix: string;
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const isLoopback =
    identifier === "127.0.0.1" ||
    identifier === "::1" ||
    identifier === "localhost" ||
    identifier === "::ffff:127.0.0.1";

  const maxRequests = isLoopback ? Math.max(options.maxRequests, 500) : options.maxRequests;
  const now = Date.now();
  const key = `${options.keyPrefix}:${identifier}`;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    const record: RateLimitRecord = {
      count: 1,
      resetAt: now + options.windowSeconds * 1000,
    };
    rateLimitStore.set(key, record);
    return {
      success: true,
      remaining: maxRequests - 1,
      resetSeconds: options.windowSeconds,
    };
  }

  if (existing.count >= maxRequests) {
    const resetSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      success: false,
      remaining: 0,
      resetSeconds,
    };
  }

  existing.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    success: true,
    remaining: maxRequests - existing.count,
    resetSeconds,
  };
}

export function resetRateLimit(keyPrefix: string, identifier: string): void {
  rateLimitStore.delete(`${keyPrefix}:${identifier}`);
}
