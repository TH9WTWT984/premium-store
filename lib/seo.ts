import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

export function absoluteSeoUrl(value?: string | null) {
  if (!value) return `${siteUrl}/og-default.jpg`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}${value.startsWith("/") ? "" : "/"}${value}`;
}

export function seoText(value: unknown, fallback: string, max = 160) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > max ? `${text.slice(0, max - 3).trimEnd()}...` : text;
}

export function seoImageAlt(
  explicitAlt: string | null | undefined,
  fallback: string,
) {
  const alt = String(explicitAlt ?? "").replace(/\s+/g, " ").trim();
  return alt || fallback;
}

export function noIndexMetadata(title = "Not found"): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}


export function productMetadata(input: {
  title: string;
  description: string;
  canonical: string;
  image?: string | null;
  imageAlt?: string | null;
}): Metadata {
  const image = input.image ? absoluteSeoUrl(input.image) : undefined;

  return {
    title: input.title,
    description: seoText(input.description, input.title, 160),
    alternates: { canonical: input.canonical },
    openGraph: {
      type: "website",
      url: input.canonical,
      title: input.title,
      description: seoText(input.description, input.title, 160),
      siteName: "ATELIER",
      locale: "en_IN",
      ...(image
        ? { images: [{ url: image, alt: seoImageAlt(input.imageAlt, input.title) }] }
        : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: input.title,
      description: seoText(input.description, input.title, 160),
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function categoryMetadata(input: {
  title: string;
  description: string;
  canonical: string;
  image?: string | null;
}): Metadata {
  return productMetadata({
    title: input.title,
    description: input.description,
    canonical: input.canonical,
    image: input.image,
    imageAlt: `${input.title} collection`,
  });
}
