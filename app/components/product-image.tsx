"use client";

import Image from "next/image";
import { useState } from "react";

function isRemoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

function canUseNextImageOptimization(src: string) {
  try {
    return new URL(src).hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}

export default function ProductImage({
  src,
  alt,
  className = "",
  fallback = "Image unavailable",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={`product-image-fallback ${className}`}>{fallback}</div>;
  }

  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={800}
      height={1000}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      loading="lazy"
      unoptimized={isRemoteImage(src) && !canUseNextImageOptimization(src)}
      onError={() => setFailed(true)}
    />
  );
}
