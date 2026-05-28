'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';

import { log } from '@/lib/log';

declare global {
  interface Window {
    turnstileCallback?: (token: string) => void;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
}

export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const callbackRef = useRef(onVerify);
  callbackRef.current = onVerify;

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    window.turnstileCallback = (token: string) => {
      callbackRef.current(token);
    };
    return () => {
      delete window.turnstileCallback;
    };
  }, []);

  if (!siteKey) {
    log.error('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not defined');
    return null;
  }

  return (
    <div className="flex min-h-[65px] w-full items-center justify-center py-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-callback="turnstileCallback"
        data-theme="dark"
      />
    </div>
  );
}
