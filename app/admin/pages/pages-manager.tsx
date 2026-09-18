"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./pages-manager.module.css";

type Page = { id: string; slug: string; title: string; eyebrow: string | null; excerpt: string | null; content: string; seoTitle: string | null; seoDescription: string | null; status: "DRAFT" | "PUBLISHED"; updatedAt: string };
type FormState = { slug: string; title: string; eyebrow: string; excerpt: string; content: string; seoTitle: string; seoDescription: string; status: "DRAFT" | "PUBLISHED" };

const templates = [
  { slug: "about", title: "About ATELIER", eyebrow: "The ATELIER Standard", excerpt: "Share the story, point of view, and values behind the brand.", content: "Write your About page here…" },
  { slug: "faq", title: "Frequently Asked Questions", eyebrow: "Need to know", excerpt: "Answer the questions customers ask before and after they buy.", content: "WHAT IS YOUR DELIVERY TIME?\n\nWrite the answer here.\n\nHOW CAN I CONTACT SUPPORT?\n\nWrite the answer here." },
  { slug: "contact", title: "Contact ATELIER", eyebrow: "Let's talk", excerpt: "Give customers a clear, polished path to reach the team.", content: "CUSTOMER SUPPORT\n\nEmail: hello@atelier.example\nPhone: +91 98765 43210\nBusiness hours: Monday – Saturday, 10:00 AM – 6:00 PM IST" },
  { slug: "shipping", title: "Shipping & Delivery", eyebrow: "Delivery, clearly explained", excerpt: "Set expectations for processing, delivery, and tracking.", content: "Write your shipping policy here…" },
  { slug: "returns", title: "Returns & Exchanges", eyebrow: "A considered experience", excerpt: "Explain eligibility, timelines, and the return process clearly.", content: "Write your returns policy here…" },
  { slug: "privacy", title: "Privacy Policy", eyebrow: "Your privacy matters", excerpt: "Explain how customer information is collected and used.", content: "Write your privacy policy here…" },
  { slug: "terms", title: "Terms & Conditions", eyebrow: "The agreement between us", excerpt: "Define the rules for using the store and placing orders.", content: "Write your terms here…" },
  { slug: "refund", title: "Refund Policy", eyebrow: "Refunds, without the confusion", excerpt: "Make refund eligibility and timing clear before customers need it.", content: "Write your refund policy here…" },
];

const blank: FormState = { slug: "", title: "", eyebrow: "", excerpt: "", content: "", seoTitle: "", seoDescription: "", status: "DRAFT" };

export default function PagesManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [active, setActive] = useState<Page | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  async function load(selectFirst = false) {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/pages", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load pages.");
      const nextPages: Page[] = d.pages ?? [];
      setPages(nextPages);
      if (selectFirst && nextPages[0]) choose(nextPages[0]);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not load pages.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const published = useMemo(() => pages.filter((p) => p.status === "PUBLISHED").length, [pages]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => `${p.title} ${p.slug} ${p.excerpt ?? ""}`.toLowerCase().includes(q));
  }, [pages, query]);

  function choose(page: Page) {
    setActive(page);
    setForm({ slug: page.slug, title: page.title, eyebrow: page.eyebrow ?? "", excerpt: page.excerpt ?? "", content: page.content, seoTitle: page.seoTitle ?? "", seoDescription: page.seoDescription ?? "", status: page.status });
    setMessage("");
  }
  function newPage(template?: typeof templates[number]) { setActive(null); setForm(template ? { ...blank, ...template } : { ...blank }); setMessage(""); }
  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((f) => ({ ...f, [key]: value })); }

  async function save() {
    setSaving(true); setMessage("");
    try {
      const r = await fetch(active ? `/api/admin/pages/${active.id}` : "/api/admin/pages", { method: active ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save page.");
      setMessage(form.status === "PUBLISHED" ? "Published — the storefront now uses this version." : "Draft saved — customers will not see it yet.");
      await load();
      choose(d.page);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save page.");
    } finally { setSaving(false); }
  }

  async function remove() {
    if (!active || !window.confirm(`Delete “${active.title}”?`)) return;
    const r = await fetch(`/api/admin/pages/${active.id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setMessage(d.error || "Could not delete page."); return; }
    setActive(null); setForm(blank); setMessage("Page deleted."); await load();
  }

  return <div className={styles.wrap}>
    <div className={styles.hero}>
      <div>
        <p className={styles.kicker}>CONTENT STUDIO</p>
        <h1>Shape the words your customers see.</h1>
        <p className={styles.sub}>Edit the story, service, and policy pages from one calm workspace. Structure stays consistent; your content changes instantly when published.</p>
      </div>
      <div className={styles.heroActions}>
        <button className={styles.secondary} onClick={() => load()}>Refresh</button>
        <button className={styles.primary} onClick={() => newPage()}>New page <span>+</span></button>
      </div>
    </div>

    <div className={styles.metrics}>
      <div><span>Published</span><strong>{published}</strong><small>Live on the storefront</small></div>
      <div><span>Drafts</span><strong>{pages.length - published}</strong><small>Private until published</small></div>
      <div><span>Page library</span><strong>{pages.length}</strong><small>{templates.length} starter structures available</small></div>
    </div>

    <div className={styles.workspace}>
      <section className={styles.library}>
        <div className={styles.sectionHead}>
          <div><p className={styles.mini}>PAGE LIBRARY</p><h2>Choose a page</h2></div>
          <label className={styles.search}><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a page…" /></label>
        </div>

        {loading ? <div className={styles.empty}>Loading your page library…</div> : filtered.length === 0 ? <div className={styles.empty}><strong>No page found.</strong><span>Try another search or start a new page.</span></div> : <div className={styles.cards}>{filtered.map((p) => <article key={p.id} className={`${styles.card} ${active?.id === p.id ? styles.selected : ""}`}>
          <button className={styles.cardMain} onClick={() => choose(p)} aria-label={`Edit ${p.title}`}>
            <div className={styles.cardTop}><span className={`${styles.pill} ${p.status === "PUBLISHED" ? styles.live : styles.draft}`}>{p.status === "PUBLISHED" ? "LIVE" : "DRAFT"}</span><span className={styles.path}>/{p.slug}</span></div>
            <h3>{p.title}</h3>
            <p>{p.excerpt || "Add a short excerpt to introduce this page."}</p>
            <div className={styles.cardFoot}><span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span></div>
          </button>
          {p.status === "PUBLISHED" && <Link className={styles.open} href={`/${p.slug}`} target="_blank">Open storefront <span>↗</span></Link>}
        </article>)}</div>}

        <div className={styles.templates}>
          <div className={styles.sectionHead}><div><p className={styles.mini}>STARTER STRUCTURES</p><h2>Start from something elegant</h2></div></div>
          <div className={styles.templateGrid}>{templates.map((t) => <button key={t.slug} className={styles.template} onClick={() => newPage(t)}><span>{t.slug}</span><strong>{t.title}</strong><small>{t.excerpt}</small><em>Use structure <b>↗</b></em></button>)}</div>
        </div>
      </section>

      <aside className={styles.editor}>
        <div className={styles.editorTop}><div><p className={styles.mini}>{active ? "EDITING" : "NEW PAGE"}</p><h2>{active ? active.title : "A new page"}</h2></div>{active && <button className={styles.danger} onClick={remove}>Delete</button>}</div>
        <div className={styles.form}>
          {message && <div className={styles.notice}>{message}</div>}
          <label>Page title<input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="About ATELIER" /></label>
          <div className={styles.two}><label>Slug<input value={form.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="about" /></label><label>Status<select value={form.status} onChange={(e) => update("status", e.target.value as FormState["status"])}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></label></div>
          <label>Eyebrow <small>Small editorial label above the main heading.</small><input value={form.eyebrow} onChange={(e) => update("eyebrow", e.target.value)} placeholder="THE ATELIER STANDARD" /></label>
          <label>Excerpt <small>Short summary used in the page hero and previews.</small><textarea rows={3} value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} placeholder="A concise introduction to the page…" /></label>
          <label>Page content <small>Use blank lines between sections. Simple ALL-CAPS lines become section headings on the storefront.</small><textarea className={styles.content} rows={16} value={form.content} onChange={(e) => update("content", e.target.value)} placeholder="Write the page content here…" /></label>
          <details className={styles.seo}><summary>SEO settings <span>Optional</span></summary><label>SEO title<input value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} placeholder="About ATELIER | Premium Clothing" /></label><label>SEO description<textarea rows={3} value={form.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} placeholder="Describe this page for search engines…" /></label></details>
          <div className={styles.saveRow}><button className={styles.save} disabled={saving} onClick={save}>{saving ? "Saving…" : form.status === "PUBLISHED" ? "Save & publish" : "Save draft"}</button>{active?.status === "PUBLISHED" && <Link className={styles.preview} href={`/${active.slug}`} target="_blank">Preview live page ↗</Link>}</div>
        </div>
      </aside>
    </div>
  </div>;
}
