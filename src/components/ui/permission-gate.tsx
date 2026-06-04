import { ShieldX } from 'lucide-react';
import type { ReactNode } from 'react';

import { EmptyState } from '@/components/ui/empty-state';

export interface PermissionGateProps {
  /**
   * The tier (or role) the user currently holds.
   * If `userTier` meets `requiredTier`, children render.
   */
  children: ReactNode;
  /**
   * Fallback shown when the user doesn't meet the required tier.
   * Defaults to a branded "upgrade" empty state.
   */
  fallback?: ReactNode;
  /** Label for the upgrade CTA button. Provide to show a CTA. */
  upgradeLabel?: string;
  /** Href for the upgrade CTA. Required when `upgradeLabel` is set. */
  upgradeHref?: string;
  /** Whether the user has permission. */
  hasPermission: boolean;
  /** Optional heading shown in the default fallback state. */
  title?: string;
  /** Optional description shown in the default fallback state. */
  description?: string;
}

export function PermissionGate({
  children,
  description = 'This feature is available to higher-tier members.',
  fallback,
  hasPermission,
  title = 'Upgrade required',
  upgradeHref,
  upgradeLabel,
}: PermissionGateProps) {
  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <EmptyState
      icon={<ShieldX className="size-6" />}
      title={title}
      description={description}
      action={upgradeLabel && upgradeHref ? { href: upgradeHref, label: upgradeLabel } : undefined}
    />
  );
}
