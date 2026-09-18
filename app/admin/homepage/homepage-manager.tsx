"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./homepage-manager.module.css";

type TransitionName = "slide" | "fade" | "slide-up" | "slide-down" | "none";
type AnnouncementMessage = { id: string; text: string; enabled: boolean };
type AnnouncementConfig = { version: 1; messages: AnnouncementMessage[]; intervalMs: number; transition: TransitionName; transitionMs: number; pauseOnHover: boolean; showProgress: boolean; backgroundColor: string; textColor: string; borderColor: string };
type FontPreset = "editorial" | "modern" | "classic" | "minimal" | "display";
type ThemeConfig = {
  version: 1;
  palette: string[];
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  accent: string;
  border: string;
  headingFont: FontPreset;
  bodyFont: FontPreset;
  headingColor: string;
  bodyColor: string;
};
type Homepage = {
  announcement: string; heroEyebrow: string; heroTitle: string; heroExcerpt: string; heroCtaLabel: string; heroCtaHref: string; heroImageUrl: string;
  collectionEyebrow: string; collectionTitle: string; collectionLinkLabel: string;
  storyEyebrow: string; storyTitle: string; storyExcerpt: string; storyCtaLabel: string; storyCtaHref: string;
  newsletterEyebrow: string; newsletterTitle: string; newsletterText: string; newsletterButtonLabel: string;
  themeConfig?: string;
};

const fallback: Homepage = {
  announcement: "",
  heroEyebrow: "The ATELIER collection", heroTitle: "Objects with a quiet point of view.", heroExcerpt: "Considered essentials for everyday living. Designed with restraint, made to last, and selected for the spaces and rituals that matter.", heroCtaLabel: "Explore the collection", heroCtaHref: "/shop", heroImageUrl: "",
  collectionEyebrow: "Live from the catalog", collectionTitle: "Shop by collection", collectionLinkLabel: "View all",
  storyEyebrow: "Our philosophy", storyTitle: "Less, but better.", storyExcerpt: "We believe the things you live with should earn their place. Our collection is deliberately edited: tactile materials, enduring forms, and useful objects with a little soul.", storyCtaLabel: "Read our story", storyCtaHref: "/about",
  newsletterEyebrow: "Stay in the know", newsletterTitle: "A considered note, occasionally.", newsletterText: "New collections, journal stories and private offers. No noise.", newsletterButtonLabel: "Subscribe",
  themeConfig: "",
};

const defaultAnnouncement: AnnouncementConfig = {
  version: 1,
  messages: [
    { id: "a1", text: "BUY 3 @ ₹999", enabled: true },
    { id: "a2", text: "Complimentary shipping on orders over ₹5,000", enabled: true },
  ],
  intervalMs: 4200,
  transition: "slide",
  transitionMs: 520,
  pauseOnHover: true,
  showProgress: false,
  backgroundColor: "#171714",
  textColor: "#FFFFFF",
  borderColor: "#171714",
};

const defaultTheme: ThemeConfig = {
  version: 1,
  palette: ["#171714", "#F7F5F0", "#E4DED5", "#9B8E82", "#A63D2F"],
  background: "#F7F5F0",
  surface: "#FFFDF9",
  text: "#171714",
  mutedText: "#6F665E",
  accent: "#A63D2F",
  border: "#D8D0C7",
  headingFont: "editorial",
  bodyFont: "modern",
  headingColor: "#171714",
  bodyColor: "#3E3833",
};

const fontOptions: Record<FontPreset, { label: string; stack: string }> = {
  editorial: { label: "Editorial Serif", stack: "Georgia, 'Times New Roman', serif" },
  modern: { label: "Modern Sans", stack: "Arial, Helvetica, sans-serif" },
  classic: { label: "Classic Serif", stack: "'Trebuchet MS', Georgia, serif" },
  minimal: { label: "Minimal Sans", stack: "Verdana, Geneva, sans-serif" },
  display: { label: "Display Serif", stack: "'Palatino Linotype', Palatino, Georgia, serif" },
};

function parseAnnouncement(raw: string): AnnouncementConfig {
  try {
    const parsed = JSON.parse(raw) as Partial<AnnouncementConfig>;
    if (Array.isArray(parsed.messages)) return { ...defaultAnnouncement, ...parsed, messages: parsed.messages.map((m, i) => ({ id: m.id ?? `a-${i}`, text: m.text ?? "", enabled: m.enabled !== false })) };
  } catch { /* legacy string */ }
  const legacy = raw.split(/\||\n+/).map((text, i) => ({ id: `legacy-${i}`, text: text.trim(), enabled: true })).filter((m) => m.text);
  return { ...defaultAnnouncement, messages: legacy.length ? legacy : defaultAnnouncement.messages };
}

function parseTheme(raw?: string): ThemeConfig {
  try {
    const parsed = JSON.parse(raw || "") as Partial<ThemeConfig>;
    return {
      ...defaultTheme,
      ...parsed,
      palette: Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette.filter((c): c is string => typeof c === "string") : defaultTheme.palette,
    };
  } catch { return defaultTheme; }
}

function normalizeHex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value.toUpperCase() : "#171714";
}

function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b); const min = Math.min(r, g, b); const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min; const s = l > 0.5 ? d / (2 - max - min) : d / (max + min); let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h /= 6; return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number) {
  const sat = s / 100; const light = l / 100; const c = (1 - Math.abs(2 * light - 1)) * sat; const x = c * (1 - Math.abs(((h / 60) % 2) - 1)); const m = light - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  return `#${[r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function generatePalette(seed: string) {
  const safe = normalizeHex(seed); const [h, s, l] = hexToHsl(safe);
  return [
    safe,
    hslToHex((h + 28) % 360, Math.min(70, s + 8), Math.min(88, l + 26)),
    hslToHex((h + 180) % 360, Math.max(15, s - 8), Math.max(15, l - 4)),
    hslToHex((h + 205) % 360, Math.max(18, s - 2), Math.min(74, l + 8)),
    hslToHex((h + 330) % 360, Math.min(80, s + 10), Math.max(26, l - 14)),
  ];
}

export default function HomePageManager() {
  const [form, setForm] = useState<Homepage>(fallback);
  const [announcement, setAnnouncement] = useState<AnnouncementConfig>(defaultAnnouncement);
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewMessages = useMemo(() => announcement.messages.filter((m) => m.enabled && m.text.trim()), [announcement.messages]);

  useEffect(() => {
    fetch("/api/admin/homepage", { cache: "no-store" }).then(r => r.json()).then(d => {
      if (d.homepage) { setForm(d.homepage); setAnnouncement(parseAnnouncement(d.homepage.announcement || "")); setTheme(parseTheme(d.homepage.themeConfig)); }
    });
  }, []);
  useEffect(() => { if (previewIndex >= previewMessages.length) setPreviewIndex(0); }, [previewIndex, previewMessages.length]);
  useEffect(() => {
    if (previewMessages.length <= 1) return;
    const timer = window.setInterval(() => setPreviewIndex(v => (v + 1) % previewMessages.length), Math.max(2200, announcement.intervalMs));
    return () => window.clearInterval(timer);
  }, [announcement.intervalMs, previewMessages.length]);

  function update<K extends keyof Homepage>(key: K, value: Homepage[K]) { setForm(v => ({ ...v, [key]: value })); setMessage(""); }
  function updateAnnouncement<K extends keyof AnnouncementConfig>(key: K, value: AnnouncementConfig[K]) { setAnnouncement(v => ({ ...v, [key]: value })); setMessage(""); }
  function updateMessage(id: string, patch: Partial<AnnouncementMessage>) { setAnnouncement(v => ({ ...v, messages: v.messages.map(m => m.id === id ? { ...m, ...patch } : m) })); setMessage(""); }
  function updateTheme<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) { setTheme(v => ({ ...v, [key]: value })); setMessage(""); }
  function setPaletteColor(index: number, color: string) { setTheme(v => ({ ...v, palette: v.palette.map((c, i) => i === index ? normalizeHex(color) : c) })); setMessage(""); }
  function addPaletteColor() { setTheme(v => ({ ...v, palette: [...v.palette, "#C7B8A6"] })); }
  function removePaletteColor(index: number) { setTheme(v => ({ ...v, palette: v.palette.filter((_, i) => i !== index).length ? v.palette.filter((_, i) => i !== index) : v.palette })); }
  function generateFromSeed(seed: string) { setTheme(v => ({ ...v, palette: generatePalette(seed) })); setMessage(""); }
  function addAnnouncement() { setAnnouncement(v => ({ ...v, messages: [...v.messages, { id: `a-${Date.now()}`, text: "New announcement", enabled: true }] })); }
  function removeAnnouncement(id: string) { setAnnouncement(v => ({ ...v, messages: v.messages.filter(m => m.id !== id) })); }

  async function save() {
    const active = announcement.messages.filter(m => m.text.trim());
    if (active.some(m => m.text.length > 120)) { setMessage("Keep each announcement under 120 characters."); return; }
    setSaving(true); setMessage("");
    const payload = { ...form, announcement: JSON.stringify({ ...announcement, messages: active }), themeConfig: JSON.stringify(theme) };
    const r = await fetch("/api/admin/homepage", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json(); setSaving(false);
    if (!r.ok) { setMessage(d.error || "Could not save."); return; }
    setForm(d.homepage); setAnnouncement(parseAnnouncement(d.homepage.announcement || "")); setTheme(parseTheme(d.homepage.themeConfig)); setMessage("Homepage saved and live.");
  }

  const themeVars = {
    "--admin-accent": theme.accent,
    "--admin-bg": theme.background,
    "--admin-surface": theme.surface,
  } as CSSProperties;

  return <div className={styles.wrap} style={themeVars}>
    <header className={styles.hero}><div><p className={styles.kicker}>HOME STUDIO</p><h1>Shape the first impression.</h1><p className={styles.sub}>Control the words customers meet first — and tune the visual language of the storefront without touching code.</p></div><div className={styles.actions}><a href="/" target="_blank" rel="noreferrer" className={styles.preview}>Preview storefront ↗</a><button className={styles.saveTop} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div></header>

    <section className={styles.themeStudio}>
      <div className={styles.themeHead}><div><p className={styles.announcementEyebrow}>Brand studio</p><h2>Build the visual language.</h2><p>Pick a palette, set typography, and tune the text colors that carry the storefront. Every choice is saved with the homepage.</p></div><div className={styles.themeMood}><div className={styles.moodBig} style={{ background: theme.palette[0] || theme.text }}><span>ATELIER</span></div><div className={styles.moodSwatches}>{theme.palette.slice(0, 5).map((color, i) => <span key={`${color}-${i}`} style={{ background: color }} />)}</div></div></div>
      <div className={styles.themeGrid}>
        <div className={styles.themeCard}><div className={styles.themeCardHead}><div><p className={styles.mini}>01 · PALETTE</p><h3>Palette generator</h3><p>Start from one color and generate a balanced five-color set.</p></div><button className={styles.ghostButton} onClick={() => generateFromSeed(theme.palette[0] || "#171714")}>Regenerate</button></div>
          <div className={styles.seedRow}><label className={styles.field}><span>Seed color</span><div className={styles.colorInput}><input type="color" value={normalizeHex(theme.palette[0] || "#171714")} onChange={e => generateFromSeed(e.target.value)} /><input value={theme.palette[0] || "#171714"} maxLength={7} onChange={e => setPaletteColor(0, e.target.value)} /></div></label><div className={styles.paletteHint}>Click any swatch to edit it. Add your own colors below.</div></div>
          <div className={styles.paletteGrid}>{theme.palette.map((color, i) => <div className={styles.paletteItem} key={`${color}-${i}`}><input className={styles.swatch} type="color" value={normalizeHex(color)} onChange={e => setPaletteColor(i, e.target.value)} aria-label={`Palette color ${i + 1}`} /><div><strong>Color {String(i + 1).padStart(2, "0")}</strong><span>{normalizeHex(color)}</span></div>{theme.palette.length > 1 && <button className={styles.removeColor} onClick={() => removePaletteColor(i)} aria-label={`Remove color ${i + 1}`}>×</button>}</div>)}</div>
          <button className={styles.addColor} onClick={addPaletteColor}>+ Add color</button>
        </div>

        <div className={styles.themeCard}><div className={styles.themeCardHead}><div><p className={styles.mini}>02 · TYPE</p><h3>Typography</h3><p>These controls change the typography used across the storefront. The preview below updates instantly.</p></div></div>
          <div className={styles.typeShowcase}>
            <div className={styles.typeSample}><span className={styles.typeSampleLabel}>HEADING PREVIEW</span><h4 style={{ fontFamily: fontOptions[theme.headingFont].stack, color: theme.headingColor }}>Objects with a point of view.</h4></div>
            <div className={styles.typeSample}><span className={styles.typeSampleLabel}>BODY PREVIEW</span><p style={{ fontFamily: fontOptions[theme.bodyFont].stack, color: theme.bodyColor }}>Considered essentials, clear language and comfortable reading. This is exactly how your selected body font will appear on the storefront.</p></div>
          </div>
          <div className={styles.fontChoiceGrid}>
            <label className={styles.field}><span>Heading font</span><select value={theme.headingFont} onChange={e => updateTheme("headingFont", e.target.value as FontPreset)}>{Object.entries(fontOptions).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
            <label className={styles.field}><span>Body font</span><select value={theme.bodyFont} onChange={e => updateTheme("bodyFont", e.target.value as FontPreset)}>{Object.entries(fontOptions).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
          </div>
          <div className={styles.typeHint}>Changes are live in this preview now. Click <strong>Save &amp; publish homepage</strong> to apply them to the customer-facing homepage.</div>
        </div>
      </div>

      <div className={styles.colorRoles}><div><p className={styles.mini}>03 · TEXT & UI COLORS</p><h3>Choose the voice of the page.</h3><p>These control the main text hierarchy and supporting interface colors.</p></div><div className={styles.roleGrid}>
        {[['headingColor','Heading text'],['bodyColor','Body text'],['mutedText','Muted text'],['accent','Accent / links'],['background','Page background'],['surface','Cards / surfaces'],['border','Borders / rules']].map(([key, label]) => <label className={styles.role} key={key}><span>{label}</span><div className={styles.colorInput}><input type="color" value={normalizeHex(theme[key as keyof ThemeConfig] as string)} onChange={e => updateTheme(key as keyof ThemeConfig, e.target.value)} /><input value={theme[key as keyof ThemeConfig] as string} onChange={e => updateTheme(key as keyof ThemeConfig, e.target.value as never)} maxLength={7} /></div></label>)}
      </div></div>
    </section>

    <section className={styles.announcementStudio}><div className={styles.announcementHead}><div><p className={styles.announcementEyebrow}>Announcement bar</p><h2>Give each message its own moment.</h2><p>Stack multiple offers, then choose how they move. No code edits.</p></div><div className={styles.announcementPreview}><div className={styles.announcementPreviewBar} style={{ background: announcement.backgroundColor, color: announcement.textColor, borderColor: announcement.borderColor }}><span>{previewMessages[previewIndex]?.text || "Add an announcement"}</span></div></div></div><div className={styles.announcementBody}><div className={styles.announcementRows}>{announcement.messages.map((item, index) => <div className={styles.announcementRow} key={item.id}><div className={styles.announcementIndex}>{String(index + 1).padStart(2, "0")}</div><input value={item.text} maxLength={120} onChange={e => updateMessage(item.id, { text: e.target.value })} /><label className={styles.announcementSwitch}><input type="checkbox" checked={item.enabled} onChange={e => updateMessage(item.id, { enabled: e.target.checked })} /></label><button type="button" className={styles.announcementRemove} disabled={announcement.messages.length <= 1} onClick={() => removeAnnouncement(item.id)}>×</button></div>)}</div><div className={styles.announcementTools}><button type="button" className={styles.announcementAdd} onClick={addAnnouncement}>+ Add announcement</button><span className={styles.announcementCount}>{previewMessages.length} live · {announcement.messages.length} total</span></div><div className={styles.announcementControls}><label className={styles.announcementControl}><span>Transition</span><select value={announcement.transition} onChange={e => updateAnnouncement("transition", e.target.value as TransitionName)}><option value="slide">Slide horizontally</option><option value="fade">Soft fade</option><option value="slide-up">Slide up</option><option value="slide-down">Slide down</option><option value="none">Instant</option></select></label><label className={styles.announcementControl}><span>Show every</span><input type="number" min={3} max={15} step={0.5} value={announcement.intervalMs / 1000} onChange={e => updateAnnouncement("intervalMs", Math.round(Math.min(15, Math.max(3, Number(e.target.value) || 4.2)) * 1000))} /></label><label className={styles.announcementControl}><span>Animation speed</span><select value={announcement.transitionMs} onChange={e => updateAnnouncement("transitionMs", Number(e.target.value))}><option value={320}>Fast · 320ms</option><option value={520}>Balanced · 520ms</option><option value={760}>Smooth · 760ms</option></select></label><label className={styles.announcementCheck}><input type="checkbox" checked={announcement.pauseOnHover} onChange={e => updateAnnouncement("pauseOnHover", e.target.checked)} /> Pause on hover</label></div>
        <div className={styles.announcementAppearance}><div className={styles.announcementAppearanceHead}><div><p className={styles.mini}>APPEARANCE</p><h3>Choose the bar{"'"}s colors.</h3><p>Set the announcement background, text and divider colors without touching code.</p></div><div className={styles.announcementPresets}><button type="button" onClick={() => setAnnouncement(v => ({ ...v, backgroundColor: "#171714", textColor: "#FFFFFF", borderColor: "#171714" }))}>Ink</button><button type="button" onClick={() => setAnnouncement(v => ({ ...v, backgroundColor: "#F7F5F0", textColor: "#171714", borderColor: "#D8D0C7" }))}>Paper</button><button type="button" onClick={() => setAnnouncement(v => ({ ...v, backgroundColor: theme.accent, textColor: "#FFFFFF", borderColor: theme.accent }))}>Brand accent</button></div></div><div className={styles.announcementColors}><ColorField label="Bar background" value={announcement.backgroundColor} onChange={v => updateAnnouncement("backgroundColor", v)} /><ColorField label="Text color" value={announcement.textColor} onChange={v => updateAnnouncement("textColor", v)} /><ColorField label="Divider color" value={announcement.borderColor} onChange={v => updateAnnouncement("borderColor", v)} /></div></div></div></section>

    <section className={styles.section}><div className={styles.sectionHead}><div><p className={styles.mini}>04 · HERO</p><h2>The opening moment</h2><p>Set the tone, headline and primary action above the fold.</p></div></div><div className={styles.card}><div className={styles.two}><Field label="Eyebrow" value={form.heroEyebrow} onChange={v=>update("heroEyebrow",v)} /><Field label="CTA label" value={form.heroCtaLabel} onChange={v=>update("heroCtaLabel",v)} /></div><Field label="Hero title" value={form.heroTitle} onChange={v=>update("heroTitle",v)} large /><Field label="Hero excerpt" value={form.heroExcerpt} onChange={v=>update("heroExcerpt",v)} textarea /><div className={styles.two}><Field label="CTA link" value={form.heroCtaHref} onChange={v=>update("heroCtaHref",v)} /><Field label="Hero image URL" value={form.heroImageUrl} onChange={v=>update("heroImageUrl",v)} /></div></div></section>
    <section className={styles.section}><div className={styles.sectionHead}><div><p className={styles.mini}>05 · COLLECTIONS</p><h2>Lead customers into the catalog</h2></div></div><div className={styles.card}><div className={styles.two}><Field label="Eyebrow" value={form.collectionEyebrow} onChange={v=>update("collectionEyebrow",v)} /><Field label="Link label" value={form.collectionLinkLabel} onChange={v=>update("collectionLinkLabel",v)} /></div><Field label="Section title" value={form.collectionTitle} onChange={v=>update("collectionTitle",v)} large /></div></section>
    <section className={styles.section}><div className={styles.sectionHead}><div><p className={styles.mini}>06 · STORY</p><h2>Give the brand some depth</h2></div></div><div className={styles.card}><div className={styles.two}><Field label="Eyebrow" value={form.storyEyebrow} onChange={v=>update("storyEyebrow",v)} /><Field label="CTA label" value={form.storyCtaLabel} onChange={v=>update("storyCtaLabel",v)} /></div><Field label="Story title" value={form.storyTitle} onChange={v=>update("storyTitle",v)} large /><Field label="Story copy" value={form.storyExcerpt} onChange={v=>update("storyExcerpt",v)} textarea /><Field label="CTA link" value={form.storyCtaHref} onChange={v=>update("storyCtaHref",v)} /></div></section>
    <section className={styles.section}><div className={styles.sectionHead}><div><p className={styles.mini}>07 · NEWSLETTER</p><h2>End with an invitation</h2></div></div><div className={styles.card}><div className={styles.two}><Field label="Eyebrow" value={form.newsletterEyebrow} onChange={v=>update("newsletterEyebrow",v)} /><Field label="Button label" value={form.newsletterButtonLabel} onChange={v=>update("newsletterButtonLabel",v)} /></div><Field label="Headline" value={form.newsletterTitle} onChange={v=>update("newsletterTitle",v)} large /><Field label="Supporting text" value={form.newsletterText} onChange={v=>update("newsletterText",v)} textarea /></div></section>
    {message && <div className={styles.toast}>{message}</div>}
    <div className={styles.bottom}><button className={styles.saveBottom} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save & publish homepage"}</button></div>
  </div>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const safe = normalizeHex(value);
  return <label className={styles.announcementColorField}><span>{label}</span><div className={styles.colorInput}><input type="color" value={safe} onChange={e => onChange(e.target.value.toUpperCase())} /><input value={value} maxLength={7} onChange={e => onChange(e.target.value)} placeholder="#171714" /></div></label>;
}

function Field({ label, value, onChange, textarea, large }: { label:string; value:string; onChange:(v:string)=>void; textarea?:boolean; large?:boolean }) { return <label className={styles.field}><span>{label}</span>{textarea ? <textarea className={large ? styles.large : ""} value={value} onChange={e=>onChange(e.target.value)} rows={5} /> : <input className={large ? styles.large : ""} value={value} onChange={e=>onChange(e.target.value)} />}</label>; }
