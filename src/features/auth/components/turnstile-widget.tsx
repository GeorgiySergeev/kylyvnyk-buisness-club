'use client';

import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (!siteKey) {
      log.error('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not defined');
      return;
    }

    // Programmatically append Turnstile script
    const scriptId = 'cloudflare-turnstile-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    let intervalId: ReturnType<typeof setInterval>;

    const initTurnstile = () => {
      if (window.turnstile && containerRef.current) {
        try {
          // If already rendered, remove it first
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
            theme: 'dark', // Fits premium aesthetics of KCLUB
          });
          
          if (intervalId) {
            clearInterval(intervalId);
          }
        } catch (e) {
          log.error('Failed to render Turnstile widget', { error: e });
        }
      }
    };

    // Poll until window.turnstile is ready
    if (window.turnstile) {
      initTurnstile();
    } else {
      intervalId = setInterval(initTurnstile, 100);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // Ignore removal errors on unmount
        }
      }
    };
  }, [siteKey, onVerify]);

  return (
    <div className="flex min-h-[65px] w-full items-center justify-center py-2">
      <div ref={containerRef} />
    </div>
  );
}
