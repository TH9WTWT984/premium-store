"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./product-media-picker.module.css";

type MediaItem = {
  filename: string;
  url: string;
  title: string;
  originalName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  tags: string[];
};

export default function ProductMediaPicker({
  selectedUrls,
  onClose,
  onConfirm,
}: {
  selectedUrls: string[];
  onClose: () => void;
  onConfirm: (items: { url: string; alt: string; title: string }[]) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<string[]>(selectedUrls);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/media", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || "Unable to load Media Library.");
        }
        setItems(Array.isArray(payload.items) ? payload.items : []);
      })
      .catch((caught) => {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to load Media Library.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;

    return items.filter((item) =>
      `${item.title} ${item.originalName} ${item.tags.join(" ")}`
        .toLowerCase()
        .includes(needle),
    );
  }, [items, query]);

  function toggle(url: string) {
    setSelected((current) =>
      current.includes(url)
        ? current.filter((item) => item !== url)
        : [...current, url],
    );
  }

  function confirm() {
    const chosen = selected
      .map((url) => items.find((item) => item.url === url))
      .filter((item): item is MediaItem => Boolean(item))
      .map((item) => ({
        url: item.url,
        alt: "",
        title: item.title || item.originalName,
      }));

    onConfirm(chosen);
  }

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <section
        className={styles.dialog}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-media-title"
      >
        <header className={styles.header}>
          <div>
            <span>PRODUCT IMAGERY</span>
            <h2 id="product-media-title">Choose from Media Library</h2>
            <p>
              Select the images you want in this product gallery. The first
              selected image can become the primary image after saving.
            </p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className={styles.toolbar}>
          <div className={styles.search}>
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search media by name or tag"
              aria-label="Search Media Library"
            />
          </div>
          <span className={styles.selectedCount}>
            {selected.length} selected
          </span>
          <Link href="/admin/media" className={styles.openLibrary}>
            Open Media Library ↗
          </Link>
        </div>

        {loading ? (
          <div className={styles.state}>Loading your Media Library…</div>
        ) : error ? (
          <div className={`${styles.state} ${styles.error}`}>{error}</div>
        ) : !filtered.length ? (
          <div className={styles.state}>
            <strong>No images found.</strong>
            <span>Upload imagery in Admin → Media first.</span>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((item) => {
              const isSelected = selected.includes(item.url);

              return (
                <button
                  type="button"
                  key={item.filename}
                  className={`${styles.card} ${isSelected ? styles.selected : ""}`}
                  onClick={() => toggle(item.url)}
                >
                  <div className={styles.image}>
                    <img src={item.url} alt={item.title || item.originalName} />
                    <span className={styles.number}>
                      {String((selected.indexOf(item.url) + 1) || "—").padStart(2, "0")}
                    </span>
                    {isSelected && <span className={styles.check}>✓</span>}
                  </div>
                  <div className={styles.meta}>
                    <strong>{item.title || item.originalName}</strong>
                    <span>
                      {item.width && item.height
                        ? `${item.width} × ${item.height}`
                        : item.mimeType}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <footer className={styles.footer}>
          <span>
            {selected.length ? `${selected.length} image${selected.length === 1 ? "" : "s"} ready to add` : "No new images selected"}
          </span>
          <div>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirm}
              disabled={!selected.length}
              onClick={confirm}
            >
              Add selected images
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
