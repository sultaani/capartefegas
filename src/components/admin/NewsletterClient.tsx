"use client";

import { useState } from "react";
import { Trash2, Download, Users } from "lucide-react";
import { GhostButton } from "./ui";

type Subscriber = { id: number; email: string; subscribedAt: string };

export function NewsletterClient({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);

  async function remove(id: number) {
    await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  }

  function exportCsv() {
    const rows = ["email,date_subscribed", ...subscribers.map((s) => `${s.email},${new Date(s.subscribedAt).toISOString().slice(0, 10)}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "capartefegas-subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="font-heading text-2xl font-bold">Newsletter Subscribers</div>
        <GhostButton onClick={exportCsv}><Download className="w-4 h-4" /> Export CSV</GhostButton>
      </div>
      <div className="bg-white border border-neutral-200 max-w-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 font-mono text-[11px] uppercase tracking-wide border-b border-neutral-200">
              <th className="px-4 py-3">Email</th><th className="px-4 py-3">Subscribed</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100 last:border-b-0">
                <td className="px-4 py-2">{s.email}</td>
                <td className="px-4 py-2 text-neutral-500">{new Date(s.subscribedAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-right"><button onClick={() => remove(s.id)} aria-label="Remove" className="p-1 hover:bg-neutral-100 cursor-pointer"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 text-sm text-neutral-500 mt-3"><Users className="w-4 h-4" /> {subscribers.length} subscribers</div>
    </div>
  );
}
