"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const INPUT =
  "w-full border border-neutral-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-5 py-12 sm:py-16">
      <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">Contact</div>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-6">Get in Touch</h1>
      {status === "done" ? (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3">
          <Check className="w-4 h-4 shrink-0" />
          Message sent. We&apos;ll get back to you shortly.
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={INPUT}
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={INPUT}
          />
          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className={INPUT}
          />
          <textarea
            required
            placeholder="Message"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            className={`${INPUT} h-28`}
          />
          {status === "error" && (
            <div className="text-sm text-red-700">Something went wrong — please try again.</div>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-4 bg-neutral-900 text-white text-sm uppercase tracking-wide hover:bg-amber-800 disabled:bg-neutral-300 cursor-pointer transition-colors"
          >
            {status === "loading" ? "Sending…" : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
