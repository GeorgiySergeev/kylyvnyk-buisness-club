import type { PublicCardStatus } from './public-card-dto';

export function getVerifyCardClientIp(headersList: Pick<Headers, 'get'>): string {
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  );
}

export function getVerifyCardStatusClassName(status: PublicCardStatus): string {
  if (status === 'ACTIVE') {
    return 'border-ds-success/40 bg-ds-success-subtle text-ds-success';
  }

  if (status === 'NOT_FOUND') {
    return 'border-muted bg-muted/30 text-muted-foreground';
  }

  return 'border-destructive/40 bg-destructive/10 text-destructive';
}

export function formatVerifyCardExpiresAt(expiresAt: string | null, fallback: string): string {
  if (!expiresAt) {
    return fallback;
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(expiresAt));
}
