import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/lib/env";
import { log } from "@/lib/log";

// Initialize Upstash Redis client
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

function maskIdentifierSegment(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

function maskRateLimitIdentifier(identifier: string): string {
  const [phone = "", ip = ""] = identifier.split(":");
  const phoneSuffix = phone.length > 4 ? `***${phone.slice(-4)}` : "****";
  const ipFingerprint = ip ? maskIdentifierSegment(ip) : "none";

  return `${phoneSuffix}:${ipFingerprint}`;
}

function maskVerifyCardRateLimitInput(input: { ip: string; number: string }) {
  return {
    ipFingerprint: maskIdentifierSegment(input.ip),
    numberFingerprint: maskIdentifierSegment(input.number.trim().toUpperCase()),
  };
}

/**
 * SMS OTP Rate Limiter
 * Limits to 3 requests per 120 seconds (2 minutes) per phone number/IP.
 */
export const smsOtpRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "120 s"),
  analytics: true,
  prefix: "rl:sms-otp",
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

export const partnerRegistrationRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "600 s"),
  analytics: true,
  prefix: "rl:partner-registration",
});

/**
 * Helper to check rate limit for a given identifier
 * Returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkSmsOtpRateLimit(identifier: string) {
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
    log.error("SMS OTP rate limiter error", {
      cause: error instanceof Error ? error.message : String(error),
      identifier: maskRateLimitIdentifier(identifier),
    });

    if (env.NODE_ENV === "production") {
      return { success: false, limit: 3, remaining: 0, reset: 0 };
    }

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
  } catch (cause) {
    log.warn("Verify card rate limiter error (fail-open)", {
      cause: cause instanceof Error ? cause.message : String(cause),
      ...maskVerifyCardRateLimitInput(input),
    });

    return { success: true };
  }
}

export async function checkPartnerRegistrationRateLimit(identifier: string) {
  if (env.NODE_ENV === "test") {
    return { success: true };
  }

  try {
    const result = await partnerRegistrationRateLimiter.limit(identifier);
    return { success: result.success };
  } catch (cause) {
    log.warn("Partner registration rate limiter error (fail-open)", {
      cause: cause instanceof Error ? cause.message : String(cause),
      identifier,
    });

    return { success: true };
  }
}
