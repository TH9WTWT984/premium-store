import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop the Collection",
  description:
    "Browse the ATELIER collection of modern essentials and everyday pieces.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop the Collection | ATELIER",
    description:
      "Browse the ATELIER collection of modern essentials and everyday pieces.",
    url: "/shop",
  },
};

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
