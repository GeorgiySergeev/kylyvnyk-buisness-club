import { env } from "@/lib/env";
import { log } from "@/lib/log";

/**
 * Verifies Cloudflare Turnstile captcha token.
 * In development and test environments, allows dummy tokens.
 */
export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  // Allow bypass in non-production environments for ease of local testing
  if (env.NODE_ENV !== "production") {
    if (!token || token === "XXXX.dummy.token.XXXX" || token.startsWith("10000000")) {
      log.info("Bypassing Turnstile validation in non-production environment", { token });
      return true;
    }
  }

  if (!token) {
    log.warn("Turnstile validation failed: missing token");
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", env.TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      log.warn("Turnstile validation failed", { errors: data["error-codes"] });
      return false;
    }

    return true;
  } catch (error) {
    log.error("Turnstile verification error", { error });
    return false;
  }
}
