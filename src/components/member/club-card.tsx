'use client';

import { QRCodeSVG } from 'qrcode.react';

interface ClubCardProps {
  cardNumber: string;
  memberName: string;
  memberType: string;
  status: string;
  verifyUrl: string;
}

const CARD_SHELL_CLASS =
  'relative w-full overflow-hidden rounded-md border border-border/50';

export function ClubCard({ cardNumber, memberName, memberType, status, verifyUrl }: ClubCardProps) {
  return (
    <div className={CARD_SHELL_CLASS} role="region" aria-label="Club membership card">
      <div className="relative bg-black/60 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-white">
            KYLYVNYK
          </span>
          <span className="inline-flex items-center border border-border/50 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-fg/45">
            {memberType}
          </span>
          <span className="inline-flex items-center border border-border/50 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-fg/45">
            {status}
          </span>
        </div>

        <div className="mb-6 space-y-1">
          <p
            className="font-mono text-lg tracking-wider text-white sm:text-xl"
            aria-label={`Card number: ${cardNumber}`}
          >
            {cardNumber}
          </p>
          <p className="text-base text-fg/65 sm:text-lg">{memberName}</p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-fg/35">Member since</p>
            <p className="text-xs text-fg/50">{new Date().getFullYear()}</p>
          </div>
          <div className="rounded-md border border-border/50 bg-white p-1.5">
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
      className={`${CARD_SHELL_CLASS} flex aspect-[1.586/1] flex-col items-center justify-center border-dashed bg-transparent p-6 text-center sm:p-8`}
      role="region"
      aria-label="Club membership card placeholder"
    >
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-fg/50">{description}</p>
    </div>
  );
}
