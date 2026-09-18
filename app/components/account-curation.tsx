 "use client";

import { useRef } from "react";
import Link from "next/link";
import styles from "./account-curation.module.css";

const ITEMS = [
  {
    title: "Leather Jacket",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=700&auto=format&fit=crop",
    href: "/shop",
  },
  {
    title: "Artisan Ceramic Vase",
    image: "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?q=80&w=700&auto=format&fit=crop",
    href: "/shop",
  },
  {
    title: "Tailored Beige Shirt",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=700&auto=format&fit=crop",
    href: "/shop",
    featured: true,
  },
  {
    title: "Knit Sweater",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=700&auto=format&fit=crop",
    href: "/shop",
  },
  {
    title: "Navy Quarter-Zip",
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=700&auto=format&fit=crop",
    href: "/shop",
  },
];

export default function AccountCuration() {
  const track = useRef<HTMLDivElement>(null);

  function scrollByAmount(direction: number) {
    track.current?.scrollBy({
      left: direction * Math.min(520, track.current.clientWidth * 0.55),
      behavior: "smooth",
    });
  }

  return (
    <section className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <span>MY ATELIER CURATION</span>
          <h2>Pieces worth another look.</h2>
        </div>
        <div className={styles.controls}>
          <button type="button" onClick={() => scrollByAmount(-1)} aria-label="Previous curation items">←</button>
          <button type="button" onClick={() => scrollByAmount(1)} aria-label="Next curation items">→</button>
        </div>
      </div>

      <div className={styles.track} ref={track} tabIndex={0} aria-label="Curated product gallery">
        {ITEMS.map((item, index) => (
          <Link
            href={item.href}
            className={`${styles.card} ${item.featured ? styles.featured : ""}`}
            key={item.title}
          >
            <div className={styles.image}>
              <img src={item.image} alt={item.title} />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className={styles.info}>
              <strong>{item.title}</strong>
              <span>Explore <i>↗</i></span>
            </div>

            {item.featured && (
              <span className={styles.cta}>EXPLORE YOUR COLLECTION</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
