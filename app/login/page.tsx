"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to sign in.");
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="container section" style={{ maxWidth: 560 }}><div className="eyebrow">Account</div><h1 className="serif" style={{ fontSize: 52, fontWeight: 500 }}>Sign in</h1><form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 30 }}><input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required /><input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required />{error && <p className="form-error">{error}</p>}<button className="btn btn-dark" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button></form><p style={{ color: "var(--muted)" }}>New here? <Link className="link" href="/register">Create an account</Link></p></main>;
}
