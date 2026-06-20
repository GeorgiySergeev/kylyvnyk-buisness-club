import 'server-only';

import { z } from 'zod';

const flagSchema = z.enum(['', '1']).default('');
const nonEmptyStringSchema = z.string().trim().min(1);

const envSchema = z.object({
  ALLOW_SEED: flagSchema,
  AUTH_DEV_PHONE_BYPASS_ENABLED: flagSchema,
  AUTH_DEV_PHONE_BYPASS_SECRET: nonEmptyStringSchema.optional(),
  AUTH_DEV_2FA_BYPASS_ENABLED: flagSchema,
  CONFIRM_SEED: flagSchema,
  CRON_SECRET: nonEmptyStringSchema.optional(),
  DATABASE_URL: nonEmptyStringSchema,
  DATABASE_URL_DIRECT: nonEmptyStringSchema,
  DISABLE_VOCAB_GREP: flagSchema,
  EMAIL_FROM: nonEmptyStringSchema.optional(),
  NEXT_PUBLIC_APP_URL: nonEmptyStringSchema,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: nonEmptyStringSchema,
  NEXT_PUBLIC_SENTRY_DSN: nonEmptyStringSchema,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: nonEmptyStringSchema,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: nonEmptyStringSchema,
  NEXT_PUBLIC_SUPABASE_URL: nonEmptyStringSchema,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: nonEmptyStringSchema,
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  RESEND_API_KEY: nonEmptyStringSchema.optional(),
  SENTRY_AUTH_TOKEN: nonEmptyStringSchema.optional(),
  SENTRY_ORG: nonEmptyStringSchema,
  SENTRY_PROJECT: nonEmptyStringSchema,
  STRIPE_PORTAL_CONFIGURATION_ID: nonEmptyStringSchema,
  STRIPE_PRICE_BUSINESS_ANNUAL: nonEmptyStringSchema,
  STRIPE_PRICE_VIP_ANNUAL: nonEmptyStringSchema,
  STRIPE_SECRET_KEY: nonEmptyStringSchema,
  STRIPE_WEBHOOK_SECRET: nonEmptyStringSchema,
  TEST_DATABASE_URL: nonEmptyStringSchema.optional(),
  TURNSTILE_SECRET_KEY: nonEmptyStringSchema,
  UPSTASH_REDIS_REST_TOKEN: nonEmptyStringSchema,
  UPSTASH_REDIS_REST_URL: nonEmptyStringSchema,
}).superRefine((value, ctx) => {
  if (value.NODE_ENV === 'production' && !value.CRON_SECRET) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'must be set in production',
      path: ['CRON_SECRET'],
    });
  }

  if (value.NODE_ENV === 'production' && value.AUTH_DEV_PHONE_BYPASS_ENABLED === '1') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'must not be enabled in production',
      path: ['AUTH_DEV_PHONE_BYPASS_ENABLED'],
    });
  }

  if (
    value.AUTH_DEV_PHONE_BYPASS_ENABLED === '1' &&
    value.NODE_ENV !== 'test' &&
    (!value.AUTH_DEV_PHONE_BYPASS_SECRET || value.AUTH_DEV_PHONE_BYPASS_SECRET.length < 32)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'must be at least 32 characters when bypass is enabled',
      path: ['AUTH_DEV_PHONE_BYPASS_SECRET'],
    });
  }
});

type EnvShape = z.infer<typeof envSchema>;
type EnvSource = Record<string, string | undefined>;

function formatEnvIssues(rawEnv: EnvSource, issues: z.ZodIssue[]): string {
  const formattedIssues = issues.map((issue) => {
    const key = issue.path.join('.');
    const value = rawEnv[key];
    const reason = value === undefined || value === '' ? 'is missing' : issue.message.toLowerCase();

    return `- ${key}: ${reason}`;
  });

  return `Invalid environment variables:\n${formattedIssues.join('\n')}`;
}

function parseEnv(rawEnv: EnvSource): EnvShape {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    throw new Error(formatEnvIssues(rawEnv, parsed.error.issues));
  }

  return parsed.data;
}

export const env = parseEnv(process.env);
