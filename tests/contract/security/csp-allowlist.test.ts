import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('Content Security Policy allowlist', () => {
  const nextConfigPath = join(process.cwd(), 'next.config.ts');
  const nextConfigContent = readFileSync(nextConfigPath, 'utf8');

  const cspMatch = nextConfigContent.match(/const cspHeader = `([\s\S]*?)`/);
  if (!cspMatch) {
    throw new Error('Could not find cspHeader in next.config.ts');
  }
  const cspHeader = cspMatch[1]!.replace(/\s{2,}/g, ' ').trim();

  describe('required third-party domains', () => {
    it('allows Supabase connections', () => {
      expect(cspHeader).toContain('*.supabase.co');
    });

    it('allows Stripe script loading', () => {
      expect(cspHeader).toContain('https://js.stripe.com');
    });

    it('allows Stripe API connections', () => {
      expect(cspHeader).toContain('https://api.stripe.com');
    });

    it('allows Cloudflare Turnstile challenges', () => {
      expect(cspHeader).toContain('https://challenges.cloudflare.com');
    });

    it('allows Sentry error reporting', () => {
      expect(cspHeader).toContain('*.ingest.sentry.io');
    });

    it('allows Plausible analytics', () => {
      expect(cspHeader).toContain('https://plausible.io');
    });
  });

  describe('security directives', () => {
    it('sets default-src to self', () => {
      expect(cspHeader).toContain("default-src 'self'");
    });

    it('blocks object-src', () => {
      expect(cspHeader).toContain("object-src 'none'");
    });

    it('restricts base-uri', () => {
      expect(cspHeader).toContain("base-uri 'self'");
    });

    it('restricts form-action', () => {
      expect(cspHeader).toContain("form-action 'self'");
    });

    it('blocks frame-ancestors', () => {
      expect(cspHeader).toContain("frame-ancestors 'none'");
    });

    it('enforces upgrade-insecure-requests', () => {
      expect(cspHeader).toContain('upgrade-insecure-requests');
    });
  });

  describe('frame-src for embedded content', () => {
    it('allows Stripe frame embedding', () => {
      expect(cspHeader).toContain('https://js.stripe.com');
    });

    it('allows Cloudflare Turnstile frame', () => {
      expect(cspHeader).toContain('https://challenges.cloudflare.com');
    });
  });

  describe('image sources', () => {
    it('allows data URIs for images', () => {
      expect(cspHeader).toContain('data:');
    });

    it('allows blob URIs for images', () => {
      expect(cspHeader).toContain('blob:');
    });

    it('allows Supabase storage images', () => {
      expect(cspHeader).toContain('https://*.supabase.co');
    });
  });
});
