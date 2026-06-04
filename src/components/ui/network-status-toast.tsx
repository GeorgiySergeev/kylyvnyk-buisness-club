'use client';

import { Wifi, WifiOff, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getErrorMessages, resolveLocaleFromPathname } from '@/lib/i18n/error-messages';
import { cn } from '@/lib/utils';

export function NetworkStatusToast() {
  const [status, setStatus] = useState<'online' | 'offline' | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [locale, setLocale] = useState<'en' | 'ru' | 'uk'>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Resolve locale from the current pathname
    const currentLocale = resolveLocaleFromPathname(window.location.pathname);
    setLocale(currentLocale);

    // Initial state check: only show if they start offline
    if (!navigator.onLine) {
      setStatus('offline');
      setIsVisible(true);
    }

    const handleOnline = () => {
      setStatus('online');
      setIsVisible(true);
    };

    const handleOffline = () => {
      setStatus('offline');
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle auto-dismiss for online notification
  useEffect(() => {
    if (status === 'online' && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status, isVisible]);

  if (!status || !isVisible) return null;

  const t = getErrorMessages(locale);
  const isOffline = status === 'offline';

  // Retrieve translation values
  const title = isOffline ? t.offlineTitle : t.onlineTitle;
  const description = isOffline ? t.offlineDescription : t.onlineDescription;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-6 left-1/2 z-[150] w-full max-w-sm -translate-x-1/2 px-4 animate-[toastEntrance_300ms_cubic-bezier(0.16,1,0.3,1)_both]',
        'motion-reduce:animate-none',
      )}
    >
      <div
        className={cn(
          'flex items-start gap-3 rounded-lg border bg-ds-surface p-4 shadow-lg backdrop-blur-md',
          isOffline ? 'border-ds-error/30 bg-ds-surface/95' : 'border-ds-success/30 bg-ds-surface/95',
        )}
      >
        <div className="mt-0.5 shrink-0">
          {isOffline ? (
            <WifiOff className="h-5 w-5 text-ds-error animate-pulse" />
          ) : (
            <Wifi className="h-5 w-5 text-ds-success" />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-ds-text">{title}</p>
          <p className="text-xs text-ds-text-muted">{description}</p>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="shrink-0 rounded-md p-1 text-ds-text-muted hover:bg-ds-surface-hover hover:text-ds-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-accent"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
