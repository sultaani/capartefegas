"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-white border border-neutral-200 p-8">
        <div className="font-heading text-xl font-bold">CAPARTEFEGAS</div>
        <div className="font-mono text-[11px] text-neutral-400 tracking-widest uppercase mt-1 mb-6">Admin Console</div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="block">
            <span className="block text-xs text-neutral-500 mb-1">Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="admin@capartefegas.com" />
          </label>
          <label className="block">
            <span className="block text-xs text-neutral-500 mb-1">Password</span>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="••••••••" />
          </label>
          {error && <div className="text-sm text-red-700">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full mt-2 px-4 py-2.5 bg-neutral-900 text-white text-sm hover:bg-amber-800 disabled:bg-neutral-300 cursor-pointer">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
