'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';

export interface ResponsiveImageProps extends Omit<ImageProps, 'onLoad'> {
  aspectRatio?: '16/9' | '4/3' | 'auto' | 'square' | 'video';
  containerClassName?: string;
}

export function ResponsiveImage({
  alt,
  aspectRatio = 'auto',
  className,
  containerClassName,
  fill,
  height,
  src,
  width,
  ...props
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectRatioClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    auto: 'aspect-auto',
    square: 'aspect-square',
    video: 'aspect-video',
  };

  const isFill = fill || aspectRatio !== 'auto';

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-ds-surface-hover',
        aspectRatioClasses[aspectRatio],
        containerClassName,
      )}
    >
      <Image
        alt={alt}
        className={cn(
          'object-cover duration-500 ease-out',
          isLoaded ? 'scale-100 blur-0 grayscale-0' : 'scale-105 blur-md grayscale',
          className,
        )}
        fill={isFill}
        height={isFill ? undefined : height}
        src={src}
        width={isFill ? undefined : width}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
}
