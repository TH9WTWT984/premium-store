 "use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./category-media-manager.module.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    products?: number;
  };
};

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

export default function CategoryMediaManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");

    try {
      const [categoryResponse, mediaResponse] = await Promise.all([
        fetch("/api/admin/categories", { cache: "no-store" }),
        fetch("/api/admin/media", { cache: "no-store" }),
      ]);

      const categoryPayload = await categoryResponse.json().catch(() => []);
      const mediaPayload = await mediaResponse.json().catch(() => ({ items: [] }));

      if (!categoryResponse.ok) {
        throw new Error(categoryPayload?.error || "Unable to load categories.");
      }

      if (!mediaResponse.ok) {
        throw new Error(mediaPayload?.error || "Unable to load media.");
      }

      const normalizedCategories: Category[] = (
        Array.isArray(categoryPayload) ? categoryPayload : []
      ).map((category: Category) => ({
        ...category,
        _count: {
          products: Number(category?._count?.products ?? 0),
        },
      }));

      setCategories(normalizedCategories);
      setMedia(Array.isArray(mediaPayload?.items) ? mediaPayload.items : []);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load category imagery.",
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredMedia = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return media;
    }

    return media.filter((item) =>
      `${item.title} ${item.originalName} ${item.tags.join(" ")}`
        .toLowerCase()
        .includes(needle),
    );
  }, [media, query]);

  async function saveImage(url: string) {
    if (!active) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/categories/${active.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: active.name,
          slug: active.slug,
          description: active.description || "",
          imageUrl: url,
          sortOrder: active.sortOrder,
          isActive: active.isActive,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save category image.");
      }

      const returnedCategory = payload?.category as Category | undefined;

      const updated: Category = {
        ...(returnedCategory || active),
        _count: {
          products: Number(
            returnedCategory?._count?.products ??
              active._count?.products ??
              0,
          ),
        },
      };

      setCategories((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setActive(updated);
      setMessage(`Image applied to ${updated.name}.`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to save category image.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeImage() {
    if (!active) return;
    await saveImage("");
    setMessage(`Image removed from ${active.name}.`);
  }

  return (
    <div className={styles.shell}>
      {(message || error) && (
        <div className={`${styles.notice} ${error ? styles.error : ""}`}>
          <span>{error || message}</span>
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setError("");
            }}
          >
            ×
          </button>
        </div>
      )}

      <section className={styles.intro}>
        <div>
          <span>STEP 01</span>
          <h2>Choose a category</h2>
          <p>
            Select a category, then choose its storefront image from Media
            Library.
          </p>
        </div>

        <div className={styles.stat}>
          <strong>{categories.length}</strong>
          <span>categories</span>
        </div>
      </section>

      <section className={styles.grid}>
        {categories.map((category) => {
          const productCount = Number(category?._count?.products ?? 0);

          return (
            <button
              key={category.id}
              type="button"
              className={`${styles.card} ${
                active?.id === category.id ? styles.active : ""
              }`}
              onClick={() => {
                setActive(category);
                setQuery("");
                setMessage("");
                setError("");
              }}
            >
              <div className={styles.image}>
                {category.imageUrl ? (
                  <img src={category.imageUrl} alt={category.name} />
                ) : (
                  <div className={styles.emptyImage}>
                    <span>NO IMAGE</span>
                  </div>
                )}

                <span className={styles.count}>
                  {productCount}{" "}
                  {productCount === 1 ? "product" : "products"}
                </span>

                <span className={styles.choose}>Choose image</span>
              </div>

              <div className={styles.meta}>
                <div>
                  <span>{category.slug}</span>
                  <strong>{category.name}</strong>
                </div>
                <span>
                  {category.imageUrl ? "Image set" : "Needs image"}
                </span>
              </div>
            </button>
          );
        })}
      </section>

      {active && (
        <div className={styles.backdrop} onClick={() => setActive(null)}>
          <aside
            className={styles.drawer}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.drawerHead}>
              <div>
                <span>STEP 02 · CATEGORY IMAGE</span>
                <h2>{active.name}</h2>
                <p>Choose one image from your Media Library.</p>
              </div>

              <button
                type="button"
                className={styles.close}
                onClick={() => setActive(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {active.imageUrl && (
              <div className={styles.current}>
                <img
                  src={active.imageUrl}
                  alt={`${active.name} current image`}
                />
                <div>
                  <span>CURRENT IMAGE</span>
                  <strong>Assigned to storefront</strong>
                </div>
              </div>
            )}

            <div className={styles.search}>
              <span>⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search media"
                aria-label="Search media"
              />
            </div>

            <div className={styles.mediaGrid}>
              {filteredMedia.map((item) => (
                <button
                  type="button"
                  key={item.filename}
                  className={`${styles.mediaCard} ${
                    active.imageUrl === item.url ? styles.selected : ""
                  }`}
                  disabled={saving}
                  onClick={() => void saveImage(item.url)}
                >
                  <div className={styles.mediaImage}>
                    <img
                      src={item.url}
                      alt={item.title || item.originalName}
                    />
                    {active.imageUrl === item.url && (
                      <span>APPLIED</span>
                    )}
                  </div>

                  <strong>{item.title || item.originalName}</strong>
                  <small>
                    {item.width && item.height
                      ? `${item.width}×${item.height}`
                      : item.mimeType}
                  </small>
                </button>
              ))}
            </div>

            {!filteredMedia.length && (
              <div className={styles.noMedia}>
                <span>MEDIA LIBRARY</span>
                <strong>No matching images.</strong>
                <p>Upload an image in Admin → Media first.</p>
              </div>
            )}

            <div className={styles.footer}>
              <button
                type="button"
                className={styles.remove}
                disabled={!active.imageUrl || saving}
                onClick={() => void removeImage()}
              >
                Remove image
              </button>

              <a href="/admin/media">Open Media Library ↗</a>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
