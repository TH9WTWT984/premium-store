CREATE TABLE "CmsPage" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "eyebrow" TEXT,
  "excerpt" TEXT,
  "content" TEXT NOT NULL,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CmsPage_slug_key" ON "CmsPage"("slug");
CREATE INDEX "CmsPage_status_idx" ON "CmsPage"("status");
CREATE INDEX "CmsPage_updatedAt_idx" ON "CmsPage"("updatedAt");
