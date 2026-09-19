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
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  fallbackSrc,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackSrc?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  if ((!src || failed) && fallbackSrc && !fallbackFailed) {
    return (
      <Image
        className={className}
        src={fallbackSrc}
        alt={alt}
        width={1200}
        height={1500}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        onError={() => setFallbackFailed(true)}
      />
    );
  }

  if (!src || failed) {
    return (
      <div
        className={`product-image-fallback ${className}`}
        style={{
          display: "grid",
          placeItems: "center",
          background: "#f4f2ee",
          color: "#999",
          width: "100%",
          height: "100%",
          minHeight: "140px",
        }}
        aria-label={alt}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.35" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={1200}
      height={1500}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      unoptimized={isRemoteImage(src) && !canUseNextImageOptimization(src)}
      onError={() => setFailed(true)}
    />
  );
}
