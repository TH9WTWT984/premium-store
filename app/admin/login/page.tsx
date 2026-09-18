"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to sign in.");
      router.push("/admin/dashboard"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in."); } finally { setLoading(false); }
  }

  return <main className="container section" style={{ maxWidth: 520 }}><div className="eyebrow">Store administration</div><h1 className="serif" style={{ fontSize: 55, fontWeight: 500 }}>Admin sign in</h1><form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 30 }}><input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" autoComplete="username" required /><input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required />{error && <p className="form-error">{error}</p>}<button className="btn btn-dark" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button></form></main>;
}
