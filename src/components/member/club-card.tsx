'use client';

import { QRCodeSVG } from 'qrcode.react';

interface ClubCardProps {
  cardNumber: string;
  memberName: string;
  status: string;
  verifyUrl: string;
}

export function ClubCard({ cardNumber, memberName, status, verifyUrl }: ClubCardProps) {
  return (
    <div
      className="relative w-full max-w-sm overflow-hidden rounded-2xl"
      role="region"
      aria-label="Club membership card"
    >
      <div
        className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-neutral-950 p-6 pb-8 shadow-xl sm:p-8"
        style={{
          boxShadow: '0 0 0 1px rgba(212, 175, 55, 0.3), 0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <span
            className="font-display text-2xl font-bold tracking-[0.15em] text-[#d4af37]"
            aria-label="KYLYVNYK CLUB"
          >
            KYC
          </span>
          <span
            className="inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#d4af37]"
            style={{ borderColor: 'rgba(212, 175, 55, 0.4)' }}
          >
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
          <p className="text-base font-medium text-zinc-300 sm:text-lg">
            {memberName}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Member since
            </p>
            <p className="text-xs text-zinc-400">
              {new Date().getFullYear()}
            </p>
          </div>
          <div className="rounded-lg bg-white p-1.5">
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
