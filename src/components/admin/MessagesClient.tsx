"use client";

import { useState } from "react";
import { inputClass, PrimaryButton } from "./ui";

type Message = { id: number; name: string; email: string; subject: string | null; body: string; status: string; adminReply: string | null; createdAt: string };

export function MessagesClient({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const selected = messages.find((m) => m.id === selectedId);

  async function markReplied() {
    if (!selected) return;
    const res = await fetch(`/api/admin/messages/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "replied", adminReply: reply }) });
    if (res.ok) {
      setMessages((prev) => prev.map((m) => (m.id === selected.id ? { ...m, status: "replied", adminReply: reply } : m)));
      setReply("");
      setSelectedId(null);
    }
  }

  return (
    <div>
      <div className="font-heading text-2xl font-bold mb-6">Messages</div>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-1 bg-white border border-neutral-200 divide-y divide-neutral-100 max-h-[520px] overflow-y-auto">
          {messages.map((m) => (
            <button key={m.id} onClick={() => setSelectedId(m.id)} className={`w-full text-left p-4 cursor-pointer hover:bg-neutral-50 ${selectedId === m.id ? "bg-neutral-50" : ""}`}>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">{m.name}</span>
                {m.status === "new" && <span className="w-2 h-2 rounded-full bg-amber-700 mt-1" />}
              </div>
              <div className="text-xs text-neutral-500">{m.subject}</div>
              <div className="text-[11px] text-neutral-400 mt-1">{new Date(m.createdAt).toLocaleDateString()}</div>
            </button>
          ))}
          {messages.length === 0 && <div className="p-4 text-sm text-neutral-400">No messages yet.</div>}
        </div>

        <div className="md:col-span-2 bg-white border border-neutral-200 p-6">
          {!selected ? (
            <div className="text-neutral-400 text-sm">Select a message to read it.</div>
          ) : (
            <div>
              <div className="font-heading font-bold">{selected.subject}</div>
              <div className="text-xs text-neutral-500 mb-4">{selected.name} • {selected.email} • {new Date(selected.createdAt).toLocaleDateString()}</div>
              <p className="text-sm text-neutral-700 mb-6">{selected.body}</p>
              {selected.adminReply && (
                <div className="text-sm bg-neutral-50 p-3 mb-4"><span className="text-xs text-neutral-400 block mb-1">Previous reply</span>{selected.adminReply}</div>
              )}
              <div className="font-mono text-xs tracking-widest text-neutral-500 uppercase mb-3">Reply</div>
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} className={`${inputClass} h-28 mb-3`} placeholder="Type your reply…" />
              <PrimaryButton onClick={markReplied}>Send &amp; Mark Replied</PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
