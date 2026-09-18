"use client";

import { useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { products: number };
};

type Draft = { name: string; slug: string; description: string; imageUrl: string };

const emptyDraft = (): Draft => ({ name: "", slug: "", description: "", imageUrl: "" });

export default function CategoryManager({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function beginEdit(category: Category) {
    setEditingId(category.id);
    setDraft({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
    });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft());
    setError("");
  }

  async function submitCategory(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const endpoint = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const response = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save category.");
      }

      if (editingId) {
        setCategories((items) =>
          items.map((item) =>
            item.id === editingId
              ? { ...item, ...payload.category }
              : item,
          ),
        );
      } else {
        const createdResponse = await fetch(`/api/admin/categories/${payload.id}`);
        const created = await createdResponse.json();
        if (!createdResponse.ok) throw new Error(created.error || "Unable to load category.");
        setCategories((items) => [...items, created]);
      }

      cancelEdit();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save category.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(category: Category) {
    setError("");
    const response = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...category, isActive: !category.isActive }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to update category.");
      return;
    }

    setCategories((items) =>
      items.map((item) => item.id === category.id ? { ...item, ...payload.category } : item),
    );
  }

  async function remove(category: Category) {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    setError("");

    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to delete category.");
      return;
    }

    setCategories((items) => items.filter((item) => item.id !== category.id));
    if (editingId === category.id) cancelEdit();
  }

  return (
    <div className="category-manager">
      <div className="admin-grid-two">
        <form className="admin-panel admin-category-form" onSubmit={submitCategory}>
          <div className="eyebrow">{editingId ? "Edit category" : "New category"}</div>
          <h2 className="serif admin-panel-title">
            {editingId ? "Refine this collection." : "Create a collection."}
          </h2>
          <div className="admin-field-grid">
            <label className="admin-field"><span>Name</span><input className="field" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
            <label className="admin-field"><span>Slug</span><input className="field" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></label>
            <label className="admin-field full"><span>Description</span><textarea className="field" rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
            <label className="admin-field full"><span>Image URL</span><input className="field" value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="https://…"/></label>
          </div>
          <div className="admin-category-actions">
            <button className="btn btn-dark" disabled={saving}>{saving ? "Saving…" : editingId ? "Save category" : "Create category"}</button>
            {editingId && <button type="button" className="btn btn-light" onClick={cancelEdit}>Cancel edit</button>}
          </div>
        </form>

        <div className="admin-panel admin-panel-image">
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85" alt="ATELIER collection"/>
          <div className="admin-image-overlay"><div className="eyebrow">Collections</div><h2 className="serif admin-panel-title">A strong taxonomy keeps the catalog calm.</h2></div>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="admin-panel admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Category</th><th>Products</th><th>State</th><th>Actions</th></tr></thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>
                  <div className="admin-product-cell">
                    {category.imageUrl && <div className="admin-thumb"><img src={category.imageUrl} alt={category.name}/></div>}
                    <div><strong>{category.name}</strong><div className="admin-muted">/{category.slug}</div></div>
                  </div>
                </td>
                <td>{category._count.products}</td>
                <td><button type="button" className={`status-button ${category.isActive ? "is-active" : ""}`} onClick={() => toggle(category)}>{category.isActive ? "Active" : "Hidden"}</button></td>
                <td><div className="admin-row-actions"><button type="button" className="admin-row-link" onClick={() => beginEdit(category)}>Edit</button><button type="button" className="admin-danger-link" onClick={() => remove(category)}>Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
