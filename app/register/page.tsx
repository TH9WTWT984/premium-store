"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to create account.");
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="container section" style={{ maxWidth: 560 }}><div className="eyebrow">Account</div><h1 className="serif" style={{ fontSize: 52, fontWeight: 500 }}>Create account</h1><form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 30 }}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><input className="field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" autoComplete="given-name" required /><input className="field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" autoComplete="family-name" /></div><input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" autoComplete="email" required /><input className="field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (8+ characters)" autoComplete="new-password" required minLength={8} />{error && <p className="form-error">{error}</p>}<button className="btn btn-dark" type="submit" disabled={loading}>{loading ? "Creating…" : "Create account"}</button></form><p style={{ color: "var(--muted)" }}>Already have an account? <Link className="link" href="/login">Sign in</Link></p></main>;
}
