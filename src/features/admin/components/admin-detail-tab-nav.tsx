'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface AdminDetailTabItem<T extends string> {
  icon: LucideIcon;
  key: T;
  label: string;
}

interface AdminDetailTabNavProps<T extends string> {
  activeTab: T;
  ariaLabel: string;
  onChange: (tab: T) => void;
  tabs: AdminDetailTabItem<T>[];
}

export function AdminDetailTabNav<T extends string>({
  activeTab,
  ariaLabel,
  onChange,
  tabs,
}: AdminDetailTabNavProps<T>) {
  return (
    <nav
      aria-label={ariaLabel}
      className="flex gap-1 overflow-x-auto rounded-ds-radius-md border border-ds-border bg-ds-surface p-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-9 shrink-0 items-center gap-2 rounded-ds-radius-sm px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none',
              isActive
                ? 'bg-ds-surface-2 font-medium text-ds-text'
                : 'text-ds-text-muted hover:bg-ds-surface-2 hover:text-ds-text',
            )}
            key={tab.key}
            onClick={() => onChange(tab.key)}
            type="button"
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
