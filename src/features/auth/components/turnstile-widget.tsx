'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';

import { log } from '@/lib/log';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: (error: unknown) => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
}

export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const initTurnstile = useCallback(() => {
    if (window.turnstile && containerRef.current) {
      try {
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            onVerify(token);
          },
          'error-callback': (err) => {
            log.error('Turnstile widget error', { err });
          },
          theme: 'dark',
        });
      } catch (e) {
        log.error('Failed to render Turnstile widget', { error: e });
      }
    }
  }, [siteKey, onVerify]);

  useEffect(() => {
    if (!siteKey) {
      log.error('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not defined');
      return;
    }
    if (scriptLoaded) {
      initTurnstile();
    }
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // Ignore removal errors on unmount
        }
      }
    };
  }, [siteKey, scriptLoaded, initTurnstile]);

  return (
    <div className="flex min-h-[65px] w-full items-center justify-center py-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} />
    </div>
  );
}
