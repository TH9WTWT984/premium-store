"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./media-library.module.css";

type MediaItem = {
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  title: string;
  altText: string;
  caption: string;
  description: string;
  folder: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  usage: number;
  usageSources: string[];
};

const FILTERS = ["all", "image"] as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function MediaLibrary() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load media.");
      setItems(payload.items || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load media.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = items.filter((item) => {
      const haystack = `${item.filename} ${item.originalName} ${item.title} ${item.altText} ${item.caption} ${item.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !normalized || haystack.includes(normalized);
      const matchesFilter = filter === "all" || item.mimeType.startsWith("image/");
      return matchesQuery && matchesFilter;
    });

    result.sort((a, b) => {
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "size") return b.sizeBytes - a.sizeBytes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [items, query, filter, sort]);

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    setError("");
    setMessage(`Uploading ${files.length} ${files.length === 1 ? "file" : "files"}…`);

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const form = new FormData();
          form.append("file", file);
          const response = await fetch("/api/admin/media", {
            method: "POST",
            body: form,
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(payload.error || `Unable to upload ${file.name}.`);
          return payload.item as MediaItem;
        }),
      );

      setItems((current) => [...results, ...current]);
      setMessage(`${results.length} ${results.length === 1 ? "file" : "files"} uploaded.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
      setMessage("");
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    uploadFiles(Array.from(event.target.files || []));
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    uploadFiles(Array.from(event.dataTransfer.files || []));
  }

  async function saveMetadata(patch: Partial<MediaItem>) {
    if (!selected) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/media/${encodeURIComponent(selected.filename)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to save media metadata.");
      setItems((current) =>
        current.map((item) => (item.filename === selected.filename ? payload.item : item)),
      );
      setSelected(payload.item);
      setMessage("Media details saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save media metadata.");
    }
  }

  async function deleteMedia(item: MediaItem) {
    const used = item.usage > 0;
    const prompt = used
      ? `${item.title || item.originalName} is used in ${item.usage} place(s). Delete it anyway?`
      : `Delete ${item.title || item.originalName}?`;
    if (!window.confirm(prompt)) return;

    setError("");
    try {
      const response = await fetch(`/api/admin/media/${encodeURIComponent(item.filename)}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to delete media.");
      setItems((current) => current.filter((entry) => entry.filename !== item.filename));
      if (selected?.filename === item.filename) setSelected(null);
      setMessage("Media deleted.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete media.");
    }
  }

  return (
    <div className={styles.shell}>
      <section
        className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <div>
          <span className={styles.dropEyebrow}>MEDIA VAULT</span>
          <h2>Bring the collection to life.</h2>
          <p>Drop JPG, PNG, WebP or GIF files here. Maximum 8 MB per image.</p>
        </div>
        <button type="button" className="btn btn-dark" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : "Upload media"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={onInputChange}
        />
      </section>

      {(message || error) && (
        <div className={`${styles.notice} ${error ? styles.noticeError : ""}`} role="status">
          <span>{error || message}</span>
          <button type="button" onClick={() => { setMessage(""); setError(""); }}>×</button>
        </div>
      )}

      <section className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search media"
            aria-label="Search media"
          />
        </div>

        <div className={styles.filters}>
          {FILTERS.map((item) => (
            <button
              type="button"
              key={item}
              className={filter === item ? styles.filterActive : ""}
              onClick={() => setFilter(item)}
            >
              {item === "all" ? "All" : "Images"}
            </button>
          ))}
        </div>

        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort media">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
          <option value="size">Largest</option>
        </select>

        <div className={styles.viewToggle}>
          <button type="button" className={view === "grid" ? styles.viewActive : ""} onClick={() => setView("grid")}>Grid</button>
          <button type="button" className={view === "list" ? styles.viewActive : ""} onClick={() => setView("list")}>List</button>
        </div>
      </section>

      <section className={`${view === "grid" ? styles.grid : styles.list}`}>
        {filtered.map((item) => (
          <article
            className={styles.mediaCard}
            key={item.filename}
            onClick={() => setSelected(item)}
          >
            <div className={styles.thumb}>
              <img src={item.url} alt={item.altText || item.title || item.originalName} />
              <span className={styles.typeBadge}>{item.mimeType.replace("image/", "").toUpperCase()}</span>
              {item.usage > 0 && <span className={styles.usedBadge}>{item.usage} use{item.usage === 1 ? "" : "s"}</span>}
            </div>
            <div className={styles.cardInfo}>
              <div>
                <strong>{item.title || item.originalName}</strong>
                <span>{formatBytes(item.sizeBytes)} · {item.width && item.height ? `${item.width}×${item.height}` : "dimensions pending"}</span>
              </div>
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </article>
        ))}

        {!filtered.length && (
          <div className={styles.empty}>
            <span>MEDIA LIBRARY</span>
            <h3>No media matches this view.</h3>
            <p>Upload your first image or adjust your search.</p>
          </div>
        )}
      </section>

      {selected && (
        <div className={styles.modalBackdrop} onClick={() => setSelected(null)}>
          <aside className={styles.drawer} onClick={(event) => event.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div>
                <span className={styles.dropEyebrow}>MEDIA DETAILS</span>
                <h2>{selected.title || selected.originalName}</h2>
              </div>
              <button type="button" className={styles.close} onClick={() => setSelected(null)}>×</button>
            </div>

            <div className={styles.largePreview}>
              <img src={selected.url} alt={selected.altText || selected.title || selected.originalName} />
            </div>

            <div className={styles.details}>
              <label>
                <span>Title</span>
                <input
                  defaultValue={selected.title}
                  onBlur={(event) => saveMetadata({ title: event.target.value })}
                />
              </label>
              <label>
                <span>Alt text</span>
                <input
                  defaultValue={selected.altText}
                  placeholder="Describe the image for accessibility"
                  onBlur={(event) => saveMetadata({ altText: event.target.value })}
                />
              </label>
              <label>
                <span>Caption</span>
                <input
                  defaultValue={selected.caption}
                  onBlur={(event) => saveMetadata({ caption: event.target.value })}
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  rows={4}
                  defaultValue={selected.description}
                  onBlur={(event) => saveMetadata({ description: event.target.value })}
                />
              </label>
              <label>
                <span>Tags</span>
                <input
                  defaultValue={selected.tags.join(", ")}
                  placeholder="product, homepage, campaign"
                  onBlur={(event) =>
                    saveMetadata({
                      tags: event.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>

              <div className={styles.metaGrid}>
                <div><span>File</span><strong>{selected.originalName}</strong></div>
                <div><span>Size</span><strong>{formatBytes(selected.sizeBytes)}</strong></div>
                <div><span>Type</span><strong>{selected.mimeType}</strong></div>
                <div><span>Usage</span><strong>{selected.usage} location{selected.usage === 1 ? "" : "s"}</strong></div>
              </div>

              {selected.usageSources.length > 0 && (
                <div className={styles.usage}>
                  <span>USED IN</span>
                  {selected.usageSources.map((source) => <strong key={source}>{source}</strong>)}
                </div>
              )}

              <button type="button" className={styles.deleteButton} onClick={() => deleteMedia(selected)}>
                Delete media
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
