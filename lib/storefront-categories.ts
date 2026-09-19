const hiddenStorefrontCategorySlugs = new Set(["apparel", "home", "objects"]);

export function isVisibleStorefrontCategory(slug: string) {
  return !hiddenStorefrontCategorySlugs.has(slug.trim().toLowerCase());
}