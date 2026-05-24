import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/lib/env";
import { log } from "@/lib/log";

// Initialize Upstash Redis client
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * SMS OTP Rate Limiter
 * Limits to 3 requests per 120 seconds (2 minutes) per phone number/IP.
 */
export const smsOtpRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "120 s"),
  analytics: true,
  prefix: "kclub:sms-otp",
});

export const verifyCardIpRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "rl:verify-card:ip",
});

export const verifyCardNumberRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "600 s"),
  analytics: true,
  prefix: "rl:verify-card:number",
});

/**
 * Helper to check rate limit for a given identifier
 * Returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkSmsOtpRateLimit(identifier: string) {
  // Always bypass rate limits in non-production if needed, or keep enabled for local testing
  if (env.NODE_ENV === "test") {
    return { success: true, limit: 3, remaining: 3, reset: 0 };
  }

  try {
    const result = await smsOtpRateLimiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    log.error("Rate limiter error", { error, identifier });
    // Fail-open to prevent Redis downtime from blocking user auth completely,
    // but log a severe warning.
    return { success: true, limit: 3, remaining: 1, reset: 0 };
  }
}

export async function checkVerifyCardRateLimit(input: { ip: string; number: string }) {
  if (env.NODE_ENV === "test") {
    return { success: true };
  }

  try {
    const [ipResult, numberResult] = await Promise.all([
      verifyCardIpRateLimiter.limit(input.ip),
      verifyCardNumberRateLimiter.limit(input.number.trim().toUpperCase()),
    ]);

    return { success: ipResult.success && numberResult.success };
  } catch (error) {
    log.error("Verify card rate limiter error", {
      error,
      ip: input.ip,
      numberPrefix: input.number.trim().slice(0, 8).toUpperCase(),
    });

    return { success: false };
  }
}
