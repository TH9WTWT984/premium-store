"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./t-shirt-showcase.module.css";

const shirts = [
  {
    name: "The Essential Tee",
    style: "Plain / everyday",
    image: "/images/tshirts/01-plain.jpg",
    href: "/category/t-shirts?style=plain",
  },
  {
    name: "Studio Weight",
    style: "Heavy cotton",
    image: "/images/tshirts/06-knitted.jpg",
    href: "/category/t-shirts?style=plain",
  },
  {
    name: "Soft Form",
    style: "Relaxed fit",
    image: "/images/tshirts/14-soft-studio.jpg",
    href: "/category/t-shirts?style=plain",
  },
  {
    name: "Graphic Study",
    style: "Printed / expressive",
    image: "/images/tshirts/09-graphic-essential.jpg",
    href: "/category/t-shirts?style=printed",
  },
  {
    name: "The Oversized Edit",
    style: "Easy silhouette",
    image: "/images/tshirts/16-everyday-oversized.jpg",
    href: "/category/t-shirts?style=boxy-fit-full-sleeves",
  },
] as const;

export default function TShirtShowcase() {
  const loop = [...shirts, ...shirts];

  return (
    <section className={styles.showcase} aria-labelledby="t-shirt-showcase-title">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>The T-shirt edit</span>
          <h1 id="t-shirt-showcase-title">Everyday, reworked.</h1>
        </div>
        <p>Five considered forms. One easy foundation for the days ahead.</p>
      </div>

      <div className={styles.viewport}>
        <div className={styles.track}>
          {loop.map((shirt, index) => (
            <Link className={styles.card} href={shirt.href} key={`${shirt.name}-${index}`} aria-label={`Explore ${shirt.name}`}>
              <div className={styles.imageWrap}>
                <Image src={shirt.image} alt={shirt.name} fill sizes="(max-width: 640px) 78vw, (max-width: 1100px) 42vw, 25vw" priority={index < 5} />
                <span className={styles.index}>{String((index % shirts.length) + 1).padStart(2, "0")}</span>
                <span className={styles.arrow}>↗</span>
              </div>
              <div className={styles.cardMeta}>
                <strong>{shirt.name}</strong>
                <span>{shirt.style}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.progress} aria-label="T-shirt showcase position">
        {shirts.map((shirt, index) => <span className={styles.progressBar} key={shirt.name} aria-label={`Showcase item ${index + 1}`} />)}
      </div>
    </section>
  );
}
