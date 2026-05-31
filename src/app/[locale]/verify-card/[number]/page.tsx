import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

import type { SupportedLocale } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db/client';
import { clubCards, users } from '@/db/schema';
import {
  createPublicCardDto,
  type PublicCardDto,
  type PublicCardStatus,
} from '@/features/cards/lib/public-card-dto';
import { getT } from '@/lib/i18n/t-server';
import { checkVerifyCardRateLimit } from '@/lib/rate-limit/upstash';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

interface VerifyCardNumberPageProps {
  params: Promise<{
    locale: SupportedLocale;
    number: string;
  }>;
}

function getClientIp(headersList: Headers): string {
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  );
}

function getStatusClassName(status: PublicCardStatus): string {
  if (status === 'ACTIVE') {
    return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200';
  }

  if (status === 'NOT_FOUND') {
    return 'border-muted bg-muted/30 text-muted-foreground';
  }

  return 'border-destructive/40 bg-destructive/10 text-destructive';
}

function formatExpiresAt(expiresAt: string | null, fallback: string): string {
  if (!expiresAt) {
    return fallback;
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(expiresAt));
}

function VerifyCardView({ dto, locale }: { dto: PublicCardDto; locale: SupportedLocale }) {
  const t = getT('cards', locale);
  const statusLabel = dto.status === 'NOT_FOUND' ? t('verifyBadgeNotFound') : dto.status;

  return (
    <PageWrapper>
      <section className="mx-auto max-w-2xl">
        <Card className="overflow-hidden border-primary/20 bg-card/95 shadow-2xl shadow-black/30">
          <CardHeader className="space-y-4 border-b border-border bg-gradient-to-br from-card via-card to-primary/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.32em] text-primary uppercase">
                KYLYVNYK CLUB
              </p>
              <Badge
                className={cn('uppercase tracking-wider', getStatusClassName(dto.status))}
                variant="outline"
              >
                {statusLabel}
              </Badge>
            </div>
            <div className="space-y-3">
              <CardTitle className="font-display text-3xl leading-tight text-foreground sm:text-5xl">
                {t('verifyTitle')}
              </CardTitle>
              <CardDescription className="text-base leading-7 text-muted-foreground">
                {t('verifyDescription')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <dl className="space-y-1 rounded-lg border border-border bg-background/40 p-4">
              <dt className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {t('verifyNumber')}
              </dt>
              <dd className="font-mono text-base text-foreground break-all">{dto.number}</dd>
            </dl>
            <dl className="space-y-1 rounded-lg border border-border bg-background/40 p-4">
              <dt className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {t('verifyMember')}
              </dt>
              <dd className="text-base font-medium text-foreground">
                {dto.memberName ?? t('verifyBadgeNotFound')}
              </dd>
            </dl>
            <dl className="space-y-1 rounded-lg border border-border bg-background/40 p-4">
              <dt className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {t('verifyMemberType')}
              </dt>
              <dd className="text-base font-medium text-foreground">
                {dto.memberType ?? t('verifyBadgeNotFound')}
              </dd>
            </dl>
            <dl className="space-y-1 rounded-lg border border-border bg-background/40 p-4">
              <dt className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {t('verifyExpiresAt')}
              </dt>
              <dd className="text-base font-medium text-foreground">
                {formatExpiresAt(dto.expiresAt, t('verifyNoExpiration'))}
              </dd>
            </dl>
          </CardContent>
        </Card>
      </section>
    </PageWrapper>
  );
}

export default async function VerifyCardNumberPage({ params }: VerifyCardNumberPageProps) {
  const { locale, number } = await params;
  const decodedNumber = decodeURIComponent(number).trim().toUpperCase();
  const t = getT('cards', locale);
  const headersList = await headers();
  const rateLimit = await checkVerifyCardRateLimit({
    ip: getClientIp(headersList),
    number: decodedNumber,
  });

  if (!rateLimit.success) {
    return (
      <VerifyCardView
        locale={locale}
        dto={createPublicCardDto(null, decodedNumber, t('verifyMemberFallback'))}
      />
    );
  }

  const [row] = await db
    .select({
      expiresAt: clubCards.expiresAt,
      memberName: users.displayName,
      memberType: clubCards.memberType,
      number: clubCards.number,
      status: clubCards.status,
    })
    .from(clubCards)
    .leftJoin(users, eq(users.id, clubCards.userId))
    .where(eq(clubCards.number, decodedNumber))
    .limit(1);

  return (
    <VerifyCardView
      locale={locale}
      dto={createPublicCardDto(row ?? null, decodedNumber, t('verifyMemberFallback'))}
    />
  );
}
