import Link from "next/link";
import { getActiveCategories, getActiveProducts } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import PublicProductCard from "./components/public-product-card";
import StoreHeader from "./components/store-header";
import AnnouncementSlider from "./components/announcement-slider";
import { CollectionGrid } from "./components/collection-grid";
import StoreFooter from "./components/store-footer";
import TShirtShowcase from "./components/t-shirt-showcase";

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
  return <>
    {content.announcement && <AnnouncementSlider announcement={content.announcement} />}
    <StoreHeader />
    <main>
      <TShirtShowcase />

      <section className="section container" id="collections">
        <div className="section-head"><div><div className="eyebrow">{content.collectionEyebrow}</div><h2 className="serif">{content.collectionTitle}</h2></div><Link className="link" href="/shop">{content.collectionLinkLabel}</Link></div>
        <CollectionGrid categories={categories} />
      </section>

      <section className="editorial-band"><div className="editorial-copy"><div className="eyebrow">The daily edit</div><h2 className="serif">Good design earns its place.</h2><p>{content.storyExcerpt}</p><Link className="btn btn-light" href={content.storyCtaHref || "/about"}>{content.storyCtaLabel || "Read our story"}</Link></div><div className="editorial-stat"><span>01</span><strong>Thoughtful<br />objects</strong><small>Made for everyday living.</small></div></section>
      <section className="story"><div className="story-art" /><div className="story-copy"><div><div className="eyebrow">{content.storyEyebrow}</div><h2 className="serif">{content.storyTitle}</h2><p>{content.storyExcerpt}</p><Link href={content.storyCtaHref || "/about"} className="btn btn-light">{content.storyCtaLabel || "Read our story"}</Link></div></div></section>
      <section className="newsletter"><div className="eyebrow">{content.newsletterEyebrow}</div><h2 className="serif">{content.newsletterTitle}</h2><p>{content.newsletterText}</p><form><input type="email" placeholder="Your email address" aria-label="Email address" /><button className="btn btn-dark" type="submit">{content.newsletterButtonLabel || "Subscribe"}</button></form></section>
    </main>
    <StoreFooter />
  </>;
}
