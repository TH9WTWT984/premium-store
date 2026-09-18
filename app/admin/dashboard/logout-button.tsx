"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return <button className="btn" disabled={loading} onClick={async () => { setLoading(true); await fetch("/api/admin/auth/logout", { method: "POST" }); router.push("/admin/login"); router.refresh(); }}>{loading ? "Signing out…" : "Sign out"}</button>;
}
