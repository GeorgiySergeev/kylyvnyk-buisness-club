import { env } from "@/lib/env";
import { log } from "@/lib/log";

export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  if (env.NODE_ENV !== "production" && env.AUTH_DEV_PHONE_BYPASS_ENABLED === "1") {
    if (!token || token === "XXXX.dummy.token.XXXX" || token.startsWith("10000000")) {
      log.info("Bypassing Turnstile validation in non-production environment");
      return true;
    }
  }

  if (!token) {
    log.warn("Turnstile validation failed: missing token");
    return false;
  }

  try {
    const formData = new FormData();
    formData.append("secret", env.TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
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
