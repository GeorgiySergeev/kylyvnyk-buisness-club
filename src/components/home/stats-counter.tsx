'use client';

import { useEffect, useRef, useState } from 'react';

interface StatsCounterProps {
  value: string;
  className?: string;
}

function parseNumeric(raw: string): { prefix: string; number: number; suffix: string } | null {
  const match = raw.match(/^([^0-9]*)([0-9][0-9,.]*)([^0-9]*)$/);
  if (!match) return null;
  const num = parseFloat(match[2]!.replace(/,/g, ''));
  if (isNaN(num)) return null;
  return { prefix: match[1] ?? '', number: num, suffix: match[3] ?? '' };
}

function formatNumber(n: number, original: string): string {
  if (original.includes(',')) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  return String(Math.round(n));
}

export function StatsCounter({ value, className }: StatsCounterProps) {
  const parsed = parseNumeric(value);
  const [displayed, setDisplayed] = useState(parsed ? `${parsed.prefix}0${parsed.suffix}` : value);
  const ref = useRef<HTMLSpanElement>(null);
  const animating = useRef(false);

  useEffect(() => {
    if (!parsed || animating.current) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || animating.current) return;
        animating.current = true;
        observer.disconnect();

        const duration = 1200;
        const start = performance.now();
        const target = parsed.number;

        function step(now: number) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;
          setDisplayed(`${parsed!.prefix}${formatNumber(current, value)}${parsed!.suffix}`);
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [parsed, value]);

  return (
    <span ref={ref} className={className} aria-label={value}>
      {displayed}
    </span>
  );
}
