import type { ButtonProps } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type GoldButtonVariant = 'solid' | 'outline' | 'ghost';
type GoldButtonSize = 'md' | 'lg';

interface GoldButtonProps extends Omit<ButtonProps, 'size' | 'variant'> {
  size?: GoldButtonSize;
  variant?: GoldButtonVariant;
}

const variants: Record<GoldButtonVariant, string> = {
  solid: 'gold-gradient text-fg-on-gold shadow-cta hover:brightness-105',
  outline:
    'border border-gold/55 bg-transparent text-gold-400 shadow-soft hover:bg-accent-muted hover:text-gold-400',
  ghost: 'bg-transparent text-foreground hover:bg-secondary hover:text-gold-400',
};

const sizes: Record<GoldButtonSize, string> = {
  md: 'min-h-11 px-5 py-3 text-sm',
  lg: 'min-h-12 px-6 py-4 text-base',
};

export function GoldButton({
  asChild = false,
  className,
  size = 'lg',
  type,
  variant = 'solid',
  ...props
}: GoldButtonProps) {
  return (
    <Button
      asChild={asChild}
      className={cn(
        'focus-gold rounded-md font-semibold transition-[background-color,color,filter,box-shadow]',
        variants[variant],
        sizes[size],
        className,
      )}
      type={asChild ? undefined : (type ?? 'button')}
      {...props}
    />
  );
}
