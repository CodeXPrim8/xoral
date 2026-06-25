'use client';

import { useState } from 'react';

type SafeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  alt,
  fallbackSrc = '/placeholder.jpg',
  loading = 'lazy',
  decoding = 'async',
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={() => setCurrentSrc(fallbackSrc)}
    />
  );
}
