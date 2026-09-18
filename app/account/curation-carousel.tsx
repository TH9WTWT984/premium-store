"use client";

import Link from "next/link";
import { useRef } from "react";
import styles from "./account-carousel.module.css";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  alt: string;
};

export default function CurationCarousel({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(direction: number) {
    ref.current?.scrollBy({
      left: direction * 320,
      behavior: "smooth",
    });
  }

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div>
          <div className={styles.eyebrow}>MY ATELIER CURATION</div>
          <h2>Pieces selected for the way you shop.</h2>
        </div>
        <div className={styles.controls}>
          <button type="button" onClick={() => scroll(-1)} aria-label="Previous pieces">←</button>
          <button type="button" onClick={() => scroll(1)} aria-label="Next pieces">→</button>
        </div>
      </div>

      <div className={styles.track} ref={ref}>
        {products.map((product, index) => (
          <Link href={`/product/${product.slug}`} className={`${styles.card} ${index === 2 ? styles.featured : ""}`} key={product.id}>
            <div className={styles.image}>
              {product.image ? (
                <img src={product.image} alt={product.alt} />
              ) : (
                <span>ATELIER</span>
              )}
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className={styles.info}>
              <div>
                <span>ATELIER EDIT</span>
                <strong>{product.name}</strong>
              </div>
              <span>₹{product.price.toLocaleString("en-IN")}</span>
            </div>
            {index === 2 && <span className={styles.featuredAction}>EXPLORE YOUR COLLECTION ↗</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
