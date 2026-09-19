import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StoreHeader from "../components/store-header";
import PublicProductCard from "../components/public-product-card";
import StoreFooter from "../components/store-footer";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fwishlist");

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            include: {
              category: true,
              images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
            },
          },
        },
      },
    },
  });

  const products = (wishlist?.items || [])
    .map((item) => item.product)
    .filter((product) => product.status === "ACTIVE");

  return (
    <>
      <StoreHeader />
      <main className="container section">
        <div className="eyebrow">Saved pieces</div>
        <div className="shop-heading">
          <div>
            <h1 className="serif shop-title">Wishlist</h1>
            <p className="admin-muted">{products.length} saved product{products.length === 1 ? "" : "s"}.</p>
          </div>
          <Link className="link" href="/shop">Discover more</Link>
        </div>
        {products.length ? (
          <div className="grid">{products.map((product) => <PublicProductCard key={product.id} product={product as never} />)}</div>
        ) : (
          <div className="catalog-empty large">
            <div className="eyebrow">Nothing saved</div>
            <h2 className="serif">Keep your favorites close.</h2>
            <Link className="btn btn-dark" href="/shop">Browse products</Link>
          </div>
        )}
      </main>
      <StoreFooter />
    </>
  );
}
