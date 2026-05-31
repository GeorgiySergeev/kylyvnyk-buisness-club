'use client';

import { QRCodeSVG } from 'qrcode.react';

import { Badge } from '@/components/ui/badge';

interface ClubCardProps {
  cardNumber: string;
  discountLabel?: string | null;
  memberName: string;
  memberType: string;
  status: string;
  verifyUrl: string;
}

const CARD_SHELL_CLASS =
  'relative w-full overflow-hidden rounded-ds-radius-md border border-ds-border';

export function ClubCard({ cardNumber, discountLabel, memberName, memberType, status, verifyUrl }: ClubCardProps) {
  return (
    <div className={CARD_SHELL_CLASS} role="region" aria-label="Club membership card">
      <div className="relative bg-black/60 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="font-sans text-ds-text-sm font-semibold uppercase tracking-[0.18em] text-ds-text">
            KYLYVNYK
          </span>
          <Badge className="uppercase tracking-[0.14em] text-ds-text-faint" variant="outline">
            {memberType}
          </Badge>
          <Badge className="uppercase tracking-[0.14em] text-ds-text-faint" variant="outline">
            {status}
          </Badge>
        </div>

        <div className="mb-6 space-y-1">
          <p
            className="font-mono text-ds-text-lg tracking-wider text-ds-text sm:text-ds-text-xl"
            aria-label={`Card number: ${cardNumber}`}
          >
            {cardNumber}
          </p>
          <p className="text-ds-text-base text-ds-text sm:text-ds-text-lg">{memberName}</p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-ds-text-xs uppercase tracking-[0.14em] text-ds-text-faint">Member since</p>
            <p className="text-ds-text-xs text-ds-text-muted">{new Date().getFullYear()}</p>
          </div>
          <div className="rounded-ds-radius-md border border-ds-border bg-white p-1.5">
            <QRCodeSVG
              value={verifyUrl}
              size={64}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
              aria-hidden="true"
            />
          </div>
        </div>

        {discountLabel ? (
          <div className="absolute bottom-0 left-0 bg-ds-accent px-2 py-px text-[10px] font-medium uppercase tracking-[0.08em] text-ds-bg">
            {discountLabel}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface ClubCardPlaceholderProps {
  description: string;
  title: string;
}

export function ClubCardPlaceholder({ description, title }: ClubCardPlaceholderProps) {
  return (
    <div
      className={`${CARD_SHELL_CLASS} flex aspect-[1.586/1] flex-col items-center justify-center border-dashed bg-transparent p-ds-space-6 text-center sm:p-ds-space-8`}
      role="region"
      aria-label="Club membership card placeholder"
    >
      <h3 className="text-ds-text-sm font-semibold text-ds-text">{title}</h3>
      <p className="mt-2 max-w-xs text-ds-text-sm leading-relaxed text-ds-text-muted">{description}</p>
    </div>
  );
}
