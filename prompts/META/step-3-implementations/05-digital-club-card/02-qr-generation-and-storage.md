# step-3-implementations/05-digital-club-card/02-qr-generation-and-storage.md

## Title

QR Generation (Frontend)

## Objective

Генерировать QR‑код для карты на лету (клиентский рендеринг SVG), который ссылается на публичный роут верификации.

## Files

### src/features/members/components/card-qr.tsx

```tsx
'use client';

import { QRCodeSVG } from 'qrcode.react';

export function CardQR({ cardNumber, verifyUrl }: { cardNumber: string; verifyUrl: string }) {
  return (
    <div className="bg-white p-3 rounded-lg inline-block">
      <QRCodeSVG
        value={verifyUrl}
        size={160}
        level="Q"
        includeMargin={false}
        fgColor="#000000"
        bgColor="#FFFFFF"
      />
      <div className="text-center mt-2 font-mono text-xs text-black/80 font-semibold tracking-wider">
        {cardNumber}
      </div>
    </div>
  );
}
```

## Acceptance

- Использует `qrcode.react` (SVG).
- Сканирование ведет на `/verify-card/[cardNumber]`.
