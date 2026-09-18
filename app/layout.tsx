import type { Metadata } from "next";
import "./globals.css";
import SeoStructuredData from "./seo-structured-data";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ATELIER — Modern Essentials, Thoughtfully Selected",
    template: "%s | ATELIER",
  },
  description:
    "ATELIER is a considered collection of modern essentials, everyday pieces and objects designed with restraint.",
  applicationName: "ATELIER",
  generator: "Next.js",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "ATELIER",
    title: "ATELIER — Modern Essentials, Thoughtfully Selected",
    description:
      "A considered collection of modern essentials and everyday pieces.",
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "ATELIER — Modern Essentials, Thoughtfully Selected",
    description:
      "A considered collection of modern essentials and everyday pieces.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SeoStructuredData />
        {children}
      </body>
    </html>
  );
}
