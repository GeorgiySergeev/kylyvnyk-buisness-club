'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  PremiumPartnerCard,
  type PremiumPartnerCardViewModel,
} from '@/components/partners/premium-partner-card';
import { cn } from '@/lib/utils';

interface PremiumPartnerCardLabels {
  conditionLabel: string;
  detailsLabel: string;
  verifiedLabel: string;
}

interface TopPartnersSliderProps {
  labels: PremiumPartnerCardLabels;
  nextLabel: string;
  partners: PremiumPartnerCardViewModel[];
  previousLabel: string;
  regionLabel: string;
}

export function TopPartnersSlider({
  labels,
  nextLabel,
  partners,
  previousLabel,
  regionLabel,
}: TopPartnersSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const slideCount = partners.length;
  const canNavigate = slideCount > 1;

  const updateIndexFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || slideCount === 0) return;

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(slideCenter - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, [slideCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.addEventListener('scroll', updateIndexFromScroll, { passive: true });
    updateIndexFromScroll();

    return () => track.removeEventListener('scroll', updateIndexFromScroll);
  }, [updateIndexFromScroll]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const boundedIndex = ((index % slideCount) + slideCount) % slideCount;
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      slideRefs.current[boundedIndex]?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'start',
      });
      setActiveIndex(boundedIndex);
    },
    [slideCount],
  );

  const goPrev = () => scrollToIndex(activeIndex - 1);
  const goNext = () => scrollToIndex(activeIndex + 1);

  return (
    <div className="relative">
      {canNavigate ? (
        <div className="mb-6 flex items-center justify-center gap-4 sm:mb-8 md:hidden">
          <span aria-live="polite" className="font-mono text-ds-text-xs text-ds-text-faint">
            {String(activeIndex + 1).padStart(2, '0')}
            <span className="text-ds-text-muted"> / </span>
            {String(slideCount).padStart(2, '0')}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={previousLabel}
              className="inline-flex size-10 items-center justify-center rounded-full border border-ds-border text-ds-text-muted transition-ds-transition-fast hover:bg-ds-surface-hover hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
              onClick={goPrev}
            >
              <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              className="inline-flex size-10 items-center justify-center rounded-full border border-ds-border text-ds-text-muted transition-ds-transition-fast hover:bg-ds-surface-hover hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
              onClick={goNext}
            >
              <ChevronRight aria-hidden="true" className="size-5" strokeWidth={1.25} />
            </button>
          </div>
        </div>
      ) : null}

      <div
        ref={trackRef}
        aria-label={regionLabel}
        aria-roledescription="carousel"
        className={cn(
          'flex border-y border-ds-border py-4 sm:py-6',
          'max-md:gap-4 max-md:overflow-x-auto max-md:scroll-smooth max-md:snap-x max-md:snap-mandatory',
          'max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden',
          'md:overflow-hidden',
        )}
        role="region"
      >
        {partners.map((partner, index) => (
          <div
            key={partner.name}
            ref={(element) => {
              slideRefs.current[index] = element;
            }}
            className={cn(
              'relative shrink-0 px-4 sm:px-5 md:w-1/3 md:px-6',
              'max-md:w-full max-md:snap-start max-md:basis-full',
              index > 0 && 'md:border-l md:border-ds-border',
            )}
            data-slide
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${slideCount}`}
          >
            <PremiumPartnerCard labels={labels} partner={partner} />
          </div>
        ))}
      </div>

      {canNavigate ? (
        <div className="mt-4 flex justify-center gap-2 md:hidden">
          {partners.map((partner, index) => (
            <button
              key={partner.name}
              type="button"
              aria-current={index === activeIndex ? 'true' : undefined}
              aria-label={`${index + 1} / ${slideCount}`}
              className={cn(
                'size-1.5 rounded-full transition-colors',
                index === activeIndex ? 'bg-ds-text' : 'bg-ds-text-muted',
              )}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
