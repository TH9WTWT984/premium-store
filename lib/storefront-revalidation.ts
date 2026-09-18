import "server-only";

import { revalidateTag } from "next/cache";

export function revalidatePublicProduct(slug: string) {
  revalidateTag(`product:${slug}`);
  revalidateTag("public-products");
}

export function revalidatePublicCategory(slug: string) {
  revalidateTag(`category:${slug}`);
  revalidateTag("public-categories");
}

export function revalidatePublicCatalog() {
  revalidateTag("public-products");
  revalidateTag("public-categories");
}
