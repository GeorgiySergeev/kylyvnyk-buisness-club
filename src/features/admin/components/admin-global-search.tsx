'use client';

import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Input } from '@/components/ui/input';
import { searchAdminRecordsAction } from '@/features/admin/actions/admin-search.action';
import type { AdminSearchResult, AdminSearchResultType } from '@/features/admin/lib/admin-search';

export type AdminGlobalSearchLabels = {
  adminSearchError: string;
  adminSearchLoading: string;
  adminSearchMinChars: string;
  adminSearchNoResults: string;
  adminSearchTypeBusiness: string;
  adminSearchTypeCard: string;
  adminSearchTypeCategory: string;
  adminSearchTypeIntroduction: string;
  adminSearchTypeUser: string;
  adminSearchViewAll: string;
};

interface AdminGlobalSearchProps {
  labels: AdminGlobalSearchLabels;
  locale: SupportedLocale;
  placeholder: string;
}

const TYPE_LABEL_KEYS: Record<AdminSearchResultType, keyof AdminGlobalSearchLabels> = {
  business: 'adminSearchTypeBusiness',
  card: 'adminSearchTypeCard',
  category: 'adminSearchTypeCategory',
  introduction: 'adminSearchTypeIntroduction',
  user: 'adminSearchTypeUser',
};

export function AdminGlobalSearch({ labels, locale, placeholder }: AdminGlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const latestQueryRef = useRef('');

  const trimmedQuery = query.trim();
  const fallbackHref = useMemo(
    () =>
      trimmedQuery
        ? `${localizeHref(locale, '/admin/users')}?q=${encodeURIComponent(trimmedQuery)}`
        : localizeHref(locale, '/admin/users'),
    [locale, trimmedQuery],
  );

  useEffect(() => {
    latestQueryRef.current = trimmedQuery;

    if (trimmedQuery.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const response = await searchAdminRecordsAction({ locale, q: trimmedQuery });
        if (latestQueryRef.current !== trimmedQuery) return;

        if (!response.ok) {
          setError(response.error);
          setResults([]);
          return;
        }

        setError(null);
        setResults(response.data);
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [locale, trimmedQuery]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trimmedQuery.length === 0) return;
    setIsOpen(false);
    router.push(fallbackHref);
  }

  const showPanel = isOpen && trimmedQuery.length > 0;

  return (
    <form className="relative hidden flex-1 sm:block sm:max-w-xl" onSubmit={handleSubmit}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ds-text-muted" />
      <Input
        aria-label={placeholder}
        autoComplete="off"
        className="h-9 rounded-ds-radius-md border-ds-border/70 bg-ds-surface/70 pl-9 pr-9 text-ds-text placeholder:text-ds-text-muted"
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        type="search"
        value={query}
      />
      {isPending ? (
        <Loader2
          aria-hidden="true"
          className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-ds-text-muted"
        />
      ) : null}

      {showPanel ? (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-ds-radius-lg border border-ds-border bg-ds-surface shadow-ds-shadow-lg">
          {trimmedQuery.length < 2 ? (
            <p className="px-3 py-3 text-ds-text-sm text-ds-text-muted">
              {labels.adminSearchMinChars}
            </p>
          ) : error ? (
            <p className="px-3 py-3 text-ds-text-sm text-ds-error">
              {labels.adminSearchError}
            </p>
          ) : isPending && results.length === 0 ? (
            <p className="px-3 py-3 text-ds-text-sm text-ds-text-muted">
              {labels.adminSearchLoading}
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-ds-text-sm text-ds-text-muted">
              {labels.adminSearchNoResults}
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto py-1">
              {results.map((result) => (
                <Link
                  className="block px-3 py-2 transition-colors hover:bg-ds-surface-2 focus-visible:bg-ds-surface-2 focus-visible:outline-none"
                  href={result.href}
                  key={`${result.type}-${result.id}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-ds-text-sm font-medium text-ds-text">
                        {result.title}
                      </p>
                      {result.subtitle ? (
                        <p className="truncate text-ds-text-xs text-ds-text-muted">
                          {result.subtitle}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {result.status ? (
                        <span className="rounded-full bg-ds-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ds-text-muted">
                          {result.status}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-ds-accent-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ds-accent">
                        {labels[TYPE_LABEL_KEYS[result.type]]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {trimmedQuery.length >= 2 ? (
            <Link
              className="block border-t border-ds-border px-3 py-2 text-ds-text-xs font-semibold text-ds-accent hover:bg-ds-surface-2 focus-visible:bg-ds-surface-2 focus-visible:outline-none"
              href={fallbackHref}
              onClick={() => setIsOpen(false)}
            >
              {labels.adminSearchViewAll}
            </Link>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
