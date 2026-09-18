"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProductMediaPicker from "./product-media-picker";

export type CategoryOption = { id: string; name: string };
export type ImageDraft = {
  id?: string;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
};
export type VariantDraft = {
  id?: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
  isActive: boolean;
};
export type ProductDraft = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  images: ImageDraft[];
  variants: VariantDraft[];
};

const blankVariant = (): VariantDraft => ({
  name: "",
  sku: "",
  price: "",
  stock: "0",
  isActive: true,
});

const blankImage = (primary = false, sortOrder = 0): ImageDraft => ({
  url: "",
  alt: "",
  sortOrder,
  isPrimary: primary,
});

export default function ProductForm({
  categories,
  initial,
}: {
  categories: CategoryOption[];
  initial: ProductDraft;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductDraft>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const isEditing = Boolean(initial.id);

  const previewImage = useMemo(
    () =>
      form.images.find((image) => image.isPrimary && image.url)?.url ||
      form.images.find((image) => image.url)?.url ||
      "",
    [form.images],
  );

  function update<K extends keyof ProductDraft>(
    key: K,
    value: ProductDraft[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setImage(index: number, patch: Partial<ImageDraft>) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, i) =>
        i === index ? { ...image, ...patch } : image,
      ),
    }));
  }

  function setVariant(index: number, patch: Partial<VariantDraft>) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, i) =>
        i === index ? { ...variant, ...patch } : variant,
      ),
    }));
  }

  function addImagesFromMedia(
    selected: { url: string; alt: string; title: string }[],
  ) {
    setForm((current) => {
      const existingUrls = new Set(
        current.images.map((image) => image.url).filter(Boolean),
      );

      const additions = selected
        .filter((item) => item.url && !existingUrls.has(item.url))
        .map((item, offset) =>
          blankImage(
            current.images.length === 0 && offset === 0,
            current.images.length + offset,
          ),
        )
        .map((draft, index) => ({
          ...draft,
          url: selected.filter(
            (item) => item.url && !existingUrls.has(item.url),
          )[index].url,
          alt:
            selected.filter(
              (item) => item.url && !existingUrls.has(item.url),
            )[index].alt || "",
        }));

      return {
        ...current,
        images: [...current.images.filter((image) => image.url), ...additions].map(
          (image, index) => ({
            ...image,
            sortOrder: index,
            isPrimary: index === 0 ? image.isPrimary || current.images.length === 0 : image.isPrimary,
          }),
        ),
      };
    });
    setMediaPickerOpen(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const normalizedImages = form.images
      .filter((image) => image.url.trim())
      .map((image, index) => ({
        ...image,
        url: image.url.trim(),
        sortOrder: index,
        isPrimary: index ===
          form.images.findIndex((entry) => entry.isPrimary && entry.url),
      }));

    if (normalizedImages.length > 0 && !normalizedImages.some((image) => image.isPrimary)) {
      normalizedImages[0].isPrimary = true;
    }

    const payloadForm = {
      ...form,
      images: normalizedImages,
      variants: form.variants.map((variant) => ({
        ...variant,
        price: variant.price.trim(),
        stock: variant.stock.trim(),
      })),
    };

    try {
      const endpoint = isEditing
        ? `/api/admin/products/${initial.id}`
        : "/api/admin/products";

      const response = await fetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadForm),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save product.");
      }

      router.push(`/admin/products/${payload.id}/edit`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to save product.",
      );
      setSaving(false);
    }
  }

  async function archiveProduct() {
    if (
      !initial.id ||
      !window.confirm(
        "Archive this product? It will stay in the database and disappear from the active storefront.",
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/products/${initial.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to archive product.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to archive product.",
      );
      setSaving(false);
    }
  }

  return (
    <>
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form-grid">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <div className="eyebrow">Core details</div>
                <h2 className="serif admin-panel-title">Product information</h2>
              </div>
            </div>

            <div className="admin-field-grid">
              <label className="admin-field full">
                <span>Name</span>
                <input className="field" required value={form.name} onChange={(e) => update("name", e.target.value)} />
              </label>

              <label className="admin-field">
                <span>Slug</span>
                <input className="field" required value={form.slug} onChange={(e) => update("slug", e.target.value)} />
              </label>

              <label className="admin-field">
                <span>Category</span>
                <select className="field" required value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span>SKU</span>
                <input className="field" value={form.sku} onChange={(e) => update("sku", e.target.value)} />
              </label>

              <label className="admin-field">
                <span>Status</span>
                <select className="field" value={form.status} onChange={(e) => update("status", e.target.value as ProductDraft["status"])}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </label>

              <label className="admin-field">
                <span>Price (INR)</span>
                <input className="field" type="number" min="0" step="0.01" required value={form.price} onChange={(e) => update("price", e.target.value)} />
              </label>

              <label className="admin-field">
                <span>Compare-at price</span>
                <input className="field" type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={(e) => update("compareAtPrice", e.target.value)} />
              </label>

              <label className="admin-check">
                <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
                <span>Feature this product on the storefront</span>
              </label>

              <label className="admin-field full">
                <span>Short description</span>
                <input className="field" value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} />
              </label>

              <label className="admin-field full">
                <span>Description</span>
                <textarea className="field" rows={7} required value={form.description} onChange={(e) => update("description", e.target.value)} />
              </label>
            </div>
          </div>

          <div className="admin-panel admin-preview-panel">
            <div className="eyebrow">Live preview</div>
            <div className="admin-preview-image">
              {previewImage ? (
                <img src={previewImage} alt={form.name || "Product preview"} />
              ) : (
                <span>Select a product image below</span>
              )}
            </div>
            <div className="admin-preview-copy">
              <div className="admin-muted">
                {categories.find((category) => category.id === form.categoryId)?.name || "Category"}
              </div>
              <h3 className="serif">{form.name || "Untitled product"}</h3>
              <strong>
                ₹{Number(form.price || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </div>

        <div className="admin-panel product-media-panel">
          <div className="admin-panel-head">
            <div>
              <div className="eyebrow">Imagery</div>
              <h2 className="serif admin-panel-title">Product images</h2>
              <p className="admin-muted">
                Build the gallery from your central Media Library, then choose
                the image customers see first.
              </p>
            </div>

            <div className="product-media-actions">
              <button
                type="button"
                className="btn btn-dark"
                onClick={() => setMediaPickerOpen(true)}
              >
                Add from Media Library
              </button>
              <button
                type="button"
                className="btn btn-light"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    images: [
                      ...current.images,
                      blankImage(current.images.length === 0, current.images.length),
                    ],
                  }))
                }
              >
                Add URL image
              </button>
            </div>
          </div>

          {form.images.length === 0 ? (
            <div className="admin-empty compact">
              No product images yet. Choose images from the Media Library or
              add a public image URL.
            </div>
          ) : (
            <div className="product-image-list">
              {form.images.map((image, index) => (
                <div className="product-image-row" key={`${image.url}-${index}`}>
                  <div className="product-image-preview">
                    {image.url ? (
                      <img src={image.url} alt={image.alt || form.name} />
                    ) : (
                      <span>Preview</span>
                    )}
                    <span className="product-image-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {image.isPrimary && (
                      <span className="product-image-primary">PRIMARY</span>
                    )}
                  </div>

                  <div className="product-image-fields">
                    <label className="admin-field">
                      <span>Image URL</span>
                      <input
                        className="field"
                        value={image.url}
                        onChange={(e) => setImage(index, { url: e.target.value })}
                      />
                    </label>

                    <label className="admin-field">
                      <span>Alt text</span>
                      <input
                        className="field"
                        value={image.alt}
                        placeholder="Describe the image"
                        onChange={(e) => setImage(index, { alt: e.target.value })}
                      />
                    </label>
                  </div>

                  <div className="product-image-controls">
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={image.isPrimary}
                        onChange={() =>
                          setForm((current) => ({
                            ...current,
                            images: current.images.map((item, i) => ({
                              ...item,
                              isPrimary: i === index,
                            })),
                          }))
                        }
                      />
                      <span>Primary</span>
                    </label>

                    <div className="product-image-move">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() =>
                          setForm((current) => {
                            const next = [...current.images];
                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                            return {
                              ...current,
                              images: next.map((item, i) => ({ ...item, sortOrder: i })),
                            };
                          })
                        }
                        aria-label="Move image up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === form.images.length - 1}
                        onClick={() =>
                          setForm((current) => {
                            const next = [...current.images];
                            [next[index + 1], next[index]] = [next[index], next[index + 1]];
                            return {
                              ...current,
                              images: next.map((item, i) => ({ ...item, sortOrder: i })),
                            };
                          })
                        }
                        aria-label="Move image down"
                      >
                        ↓
                      </button>
                    </div>

                    <button
                      type="button"
                      className="admin-danger-link"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          images: current.images
                            .filter((_, i) => i !== index)
                            .map((item, i) => ({
                              ...item,
                              sortOrder: i,
                              isPrimary: i === 0 && current.images[index]?.isPrimary
                                ? true
                                : item.isPrimary,
                            })),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <div className="eyebrow">Variants</div>
              <h2 className="serif admin-panel-title">Options & inventory</h2>
            </div>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setForm((current) => ({ ...current, variants: [...current.variants, blankVariant()] }))}
            >
              Add variant
            </button>
          </div>

          <div className="admin-variant-list">
            {form.variants.map((variant, index) => (
              <div className="admin-variant-row" key={index}>
                <input className="field" placeholder="Name · e.g. Black / M" value={variant.name} onChange={(e) => setVariant(index, { name: e.target.value })} />
                <input className="field" placeholder="Variant SKU" value={variant.sku} onChange={(e) => setVariant(index, { sku: e.target.value })} />
                <input className="field" type="number" min="0" step="0.01" placeholder="Price" value={variant.price} onChange={(e) => setVariant(index, { price: e.target.value })} />
                <input className="field" type="number" min="0" step="1" placeholder="Stock" value={variant.stock} onChange={(e) => setVariant(index, { stock: e.target.value })} />
                <label className="admin-check">
                  <input type="checkbox" checked={variant.isActive} onChange={(e) => setVariant(index, { isActive: e.target.checked })} />
                  <span>Active</span>
                </label>
                <button type="button" className="admin-danger-link" onClick={() => setForm((current) => ({ ...current, variants: current.variants.filter((_, i) => i !== index) }))}>
                  Remove
                </button>
              </div>
            ))}
            {form.variants.length === 0 && (
              <div className="admin-empty compact">
                No variants. Add one for sizes, colors or another inventory unit.
              </div>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <div className="eyebrow">Search</div>
              <h2 className="serif admin-panel-title">SEO metadata</h2>
            </div>
          </div>

          <div className="admin-field-grid">
            <label className="admin-field full">
              <span>SEO title</span>
              <input className="field" value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} />
            </label>
            <label className="admin-field full">
              <span>SEO description</span>
              <textarea className="field" rows={4} value={form.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} />
            </label>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="admin-form-actions">
          <div>
            {isEditing && (
              <button
                type="button"
                className="admin-danger-button"
                onClick={archiveProduct}
                disabled={saving}
              >
                Archive product
              </button>
            )}
          </div>

          <div className="admin-action-right">
            <a className="btn btn-light" href="/admin/products">Cancel</a>
            <button className="btn btn-dark" disabled={saving}>
              {saving ? "Saving…" : isEditing ? "Save changes" : "Create product"}
            </button>
          </div>
        </div>
      </form>

      {mediaPickerOpen && (
        <ProductMediaPicker
          selectedUrls={form.images.map((image) => image.url).filter(Boolean)}
          onClose={() => setMediaPickerOpen(false)}
          onConfirm={addImagesFromMedia}
        />
      )}
    </>
  );
}
