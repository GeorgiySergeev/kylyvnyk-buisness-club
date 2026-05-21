import "server-only";

import { z } from "zod";

const flagSchema = z.enum(["", "1"]).default("");
const nonEmptyStringSchema = z.string().trim().min(1);

const envSchema = z.object({
  ALLOW_SEED: flagSchema,
  CLERK_SECRET_KEY: nonEmptyStringSchema,
  CLERK_WEBHOOK_SECRET: nonEmptyStringSchema,
  DATABASE_URL: nonEmptyStringSchema,
  DATABASE_URL_DIRECT: nonEmptyStringSchema,
  DISABLE_VOCAB_GREP: flagSchema,
  EMAIL_FROM: nonEmptyStringSchema.optional(),
  NEXT_PUBLIC_APP_URL: nonEmptyStringSchema,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: nonEmptyStringSchema,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: nonEmptyStringSchema,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: nonEmptyStringSchema,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: nonEmptyStringSchema,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: nonEmptyStringSchema,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: nonEmptyStringSchema,
  NEXT_PUBLIC_SENTRY_DSN: nonEmptyStringSchema,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: nonEmptyStringSchema,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: nonEmptyStringSchema,
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RESEND_API_KEY: nonEmptyStringSchema.optional(),
  SENTRY_ORG: nonEmptyStringSchema,
  SENTRY_PROJECT: nonEmptyStringSchema,
  STRIPE_PORTAL_CONFIGURATION_ID: nonEmptyStringSchema,
  STRIPE_PRICE_BUSINESS_ANNUAL: nonEmptyStringSchema,
  STRIPE_PRICE_VIP_ANNUAL: nonEmptyStringSchema,
  STRIPE_SECRET_KEY: nonEmptyStringSchema,
  STRIPE_WEBHOOK_SECRET: nonEmptyStringSchema,
  TURNSTILE_SECRET_KEY: nonEmptyStringSchema,
  UPSTASH_REDIS_REST_TOKEN: nonEmptyStringSchema,
  UPSTASH_REDIS_REST_URL: nonEmptyStringSchema,
});

type EnvShape = z.infer<typeof envSchema>;
type EnvSource = Record<string, string | undefined>;

function formatEnvIssues(rawEnv: EnvSource, issues: z.ZodIssue[]): string {
  const formattedIssues = issues.map((issue) => {
    const key = issue.path.join(".");
    const value = rawEnv[key];
    const reason =
      value === undefined || value === ""
        ? "is missing"
        : issue.message.toLowerCase();

    return `- ${key}: ${reason}`;
  });

  return `Invalid environment variables:\n${formattedIssues.join("\n")}`;
}

function parseEnv(rawEnv: EnvSource): EnvShape {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    throw new Error(formatEnvIssues(rawEnv, parsed.error.issues));
  }

  return parsed.data;
}

export const env = parseEnv(process.env);
