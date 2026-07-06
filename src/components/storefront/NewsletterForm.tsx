"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">Newsletter</div>
      {status === "done" ? (
        <div className="flex items-center justify-center gap-2 text-sm"><Check className="w-4 h-4" /> Thank you for subscribing.</div>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email address"
            className="flex-1 border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <button type="submit" disabled={status === "loading"} className="px-6 py-3 bg-neutral-900 text-white text-sm uppercase tracking-wide hover:bg-amber-800 disabled:bg-neutral-300 cursor-pointer">
            Subscribe
          </button>
        </form>
      )}
      {status === "error" && <div className="text-xs text-red-700 mt-2">Something went wrong — please try again.</div>}
    </div>
  );
}
