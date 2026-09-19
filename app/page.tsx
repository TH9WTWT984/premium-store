import Link from "next/link";
import { getActiveCategories, getActiveProducts } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import PublicProductCard from "./components/public-product-card";
import StoreHeader from "./components/store-header";
import AnnouncementSlider from "./components/announcement-slider";
import { CollectionGrid } from "./components/collection-grid";

const defaults = {
  announcement: "",
  heroEyebrow: "The ATELIER collection",
  heroTitle: "Objects with a quiet point of view.",
  heroExcerpt: "Considered essentials for everyday living. Designed with restraint, made to last, and selected for the spaces and rituals that matter.",
  heroCtaLabel: "Explore the collection",
  heroCtaHref: "/shop",
  heroImageUrl: "",
  collectionEyebrow: "Live from the catalog",
  collectionTitle: "Shop by collection",
  collectionLinkLabel: "View all",
  storyEyebrow: "Our philosophy",
  storyTitle: "Less, but better.",
  storyExcerpt: "We believe the things you live with should earn their place. Our collection is deliberately edited: tactile materials, enduring forms, and useful objects with a little soul.",
  storyCtaLabel: "Read our story",
  storyCtaHref: "/about",
  newsletterEyebrow: "Stay in the know",
  newsletterTitle: "A considered note, occasionally.",
  newsletterText: "New collections, journal stories and private offers. No noise.",
  newsletterButtonLabel: "Subscribe",
};

async function getHomepage() {
  const homepage = await prisma.cmsHomepage.findUnique({ where: { id: "home" } }).catch(() => null);
  return homepage ? { ...defaults, ...homepage } : defaults;
}

export default async function Home() {
  const [products, categories, content] = await Promise.all([
    getActiveProducts({ featuredOnly: false, limit: 12 }),
    getActiveCategories(),
    getHomepage(),
  ]);
  const featuredProducts = products.filter((product) => product.featured);
  const newArrivals = products.slice(0, 4);
  const discoveryProducts = featuredProducts.length ? featuredProducts.slice(0, 4) : products.slice(0, 4);
  const heroStyle = content.heroImageUrl ? { backgroundImage: `url("${content.heroImageUrl.replace(/"/g, "\\\"")}")` } : undefined;

  return <>
    {content.announcement && <AnnouncementSlider announcement={content.announcement} />}
    <StoreHeader />
    <main>
      <section className="hero">
        <div className="hero-copy"><div><div className="eyebrow">{content.heroEyebrow}</div><h1 className="serif">{content.heroTitle}</h1><p>{content.heroExcerpt}</p><div className="hero-actions"><Link className="btn btn-dark" href={content.heroCtaHref || "/shop"}>{content.heroCtaLabel || "Explore the collection"}</Link><Link className="text-link" href="/shop">Browse all pieces <span>↗</span></Link></div></div></div>
        <div className="hero-art" style={heroStyle} aria-label="Store collection"><div className="hero-art-note">ATELIER / 2026<br /><strong>Everyday, considered.</strong></div></div>
      </section>

      <section className="section container" id="collections">
        <div className="section-head"><div><div className="eyebrow">{content.collectionEyebrow}</div><h2 className="serif">{content.collectionTitle}</h2></div><Link className="link" href="/shop">{content.collectionLinkLabel}</Link></div>
        <CollectionGrid categories={categories} />
      </section>

      <section className="section container product-section"><div className="section-head"><div><div className="eyebrow">Just added</div><h2 className="serif">New arrivals</h2></div><Link className="link" href="/shop?sort=newest">View new pieces ↗</Link></div><div className="grid">{newArrivals.map((product) => <PublicProductCard key={product.id} product={product} />)}</div>{!newArrivals.length && <div className="catalog-empty">New pieces will appear here as they are published.</div>}</section>
      <section className="editorial-band"><div className="editorial-copy"><div className="eyebrow">The daily edit</div><h2 className="serif">Good design earns its place.</h2><p>{content.storyExcerpt}</p><Link className="btn btn-light" href={content.storyCtaHref || "/about"}>{content.storyCtaLabel || "Read our story"}</Link></div><div className="editorial-stat"><span>01</span><strong>Thoughtful<br />objects</strong><small>Made for everyday living.</small></div></section>
      <section className="section container product-section"><div className="section-head"><div><div className="eyebrow">The considered edit</div><h2 className="serif">Featured pieces</h2></div><Link className="link" href="/shop?sort=featured">Shop the edit ↗</Link></div><div className="grid">{discoveryProducts.map((product) => <PublicProductCard key={product.id} product={product} />)}</div>{!discoveryProducts.length && <div className="catalog-empty">No featured pieces are published yet.</div>}</section>
      <section className="story"><div className="story-art" /><div className="story-copy"><div><div className="eyebrow">{content.storyEyebrow}</div><h2 className="serif">{content.storyTitle}</h2><p>{content.storyExcerpt}</p><Link href={content.storyCtaHref || "/about"} className="btn btn-light">{content.storyCtaLabel || "Read our story"}</Link></div></div></section>
      <section className="newsletter"><div className="eyebrow">{content.newsletterEyebrow}</div><h2 className="serif">{content.newsletterTitle}</h2><p>{content.newsletterText}</p><form><input type="email" placeholder="Your email address" aria-label="Email address" /><button className="btn btn-dark" type="submit">{content.newsletterButtonLabel || "Subscribe"}</button></form></section>
    </main>
    <footer className="footer"><div className="container"><div className="footer-grid"><div><div className="logo">ATELIER</div><p>Modern essentials, thoughtfully selected. An independent store built around quality, restraint and everyday beauty.</p></div><div><h4>Shop</h4><div className="footer-links"><Link href="/shop">All products</Link><Link href="/search">Search</Link></div></div><div><h4>Help</h4><div className="footer-links"><Link href="/contact">Contact</Link><Link href="/faq">FAQ</Link><Link href="/shipping">Shipping</Link><Link href="/returns">Returns</Link></div></div><div><h4>Company</h4><div className="footer-links"><Link href="/about">Our story</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></div><div className="copyright"><span>© 2026 ATELIER</span><span>Made for everyday living.</span></div></div></footer>
  </>;
}
