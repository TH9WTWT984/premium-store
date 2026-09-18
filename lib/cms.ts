import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PublicCmsPage = {
  id: string; slug: string; title: string; eyebrow: string | null; excerpt: string | null; content: string; seoTitle: string | null; seoDescription: string | null; status: string;
};

export async function getPublishedCmsPage(slug: string): Promise<PublicCmsPage | null> {
  noStore();
  return prisma.cmsPage.findFirst({ where: { slug, status: "PUBLISHED" }, select: { id: true, slug: true, title: true, eyebrow: true, excerpt: true, content: true, seoTitle: true, seoDescription: true, status: true } });
}

export type ContentBlock = { type: "heading" | "paragraph" | "question"; text: string };
export function contentToBlocks(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const raw of content.replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
    const text = raw.trim();
    if (!text) continue;
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.length === 1) {
      const line = lines[0];
      if (/^#{1,3}\s+/.test(line)) blocks.push({ type: "heading", text: line.replace(/^#{1,3}\s+/, "") });
      else if (/\?$/.test(line) || /^[A-Z0-9][A-Z0-9\s&'’–—:-]{4,}$/.test(line)) blocks.push({ type: line.endsWith("?") ? "question" : "heading", text: line });
      else blocks.push({ type: "paragraph", text: line });
    } else {
      blocks.push({ type: "paragraph", text: lines.join(" ") });
    }
  }
  return blocks;
}
