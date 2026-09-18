import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPublicPage } from "@/app/components/cms-public-page";
import { getPublishedCmsPage } from "@/lib/cms";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedCmsPage("refund");
  return { title: page?.seoTitle || page?.title || "refund", description: page?.seoDescription || page?.excerpt || undefined };
}

export default async function Page() {
  const page = await getPublishedCmsPage("refund");
  if (!page) notFound();
  return <CmsPublicPage page={page} />;
}
