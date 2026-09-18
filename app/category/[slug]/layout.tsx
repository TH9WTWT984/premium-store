import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCategoryPage } from "@/lib/storefront-cache";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

function cleanDescription(value: string | null | undefined, fallback: string) {
  const text = (value || fallback).replace(/\s+/g, " ").trim();
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

function absoluteUrl(value?: string | null) {
  if (!value) return `${siteUrl}/og-default.jpg`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${siteUrl}${value.startsWith("/") ? "" : "/"}${value}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const category = await getPublicCategoryPage(slug);

  if (!category) {
    return {
      title: "Collection not found",
      robots: { index: false, follow: false },
    };
  }

  const title = category.name;
  const description = cleanDescription(
    category.description,
    `Explore the ${category.name} collection at ATELIER — modern pieces selected with restraint.`,
  );
  const canonical = `/category/${category.slug}`;
  const image = absoluteUrl(category.imageUrl);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "ATELIER",
      locale: "en_IN",
      images: [{ url: image, alt: category.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CategorySeoLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;

  const category = await getPublicCategoryPage(slug);

  if (!category) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${siteUrl}/category/${category.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
