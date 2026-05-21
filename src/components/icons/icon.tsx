import type { LucideProps } from 'lucide-react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Globe2,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const ICONS = {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Globe2,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

export function Icon({ className, name, size = 20, strokeWidth = 2, ...props }: IconProps) {
  const LucideIcon = ICONS[name];

  return (
    <LucideIcon
      aria-hidden={props['aria-label'] ? undefined : true}
      className={cn('shrink-0', className)}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
