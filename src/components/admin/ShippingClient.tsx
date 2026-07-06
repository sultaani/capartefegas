"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PrimaryButton, inputClass } from "./ui";

export function ShippingClient({ initialRates }: { initialRates: { state: string; fee: number }[] }) {
  const [rates, setRates] = useState(initialRates);
  const [newState, setNewState] = useState("");
  const [newFee, setNewFee] = useState("");

  async function update(state: string, fee: number) {
    setRates((prev) => prev.map((r) => (r.state === state ? { ...r, fee } : r)));
    await fetch("/api/admin/shipping-rates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state, fee }) });
  }

  async function remove(state: string) {
    await fetch("/api/admin/shipping-rates", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state }) });
    setRates((prev) => prev.filter((r) => r.state !== state));
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!newState.trim()) return;
    const fee = Number(newFee) || 0;
    await fetch("/api/admin/shipping-rates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: newState.trim(), fee }) });
    setRates((prev) => [...prev, { state: newState.trim(), fee }]);
    setNewState(""); setNewFee("");
  }

  return (
    <div>
      <div className="font-heading text-2xl font-bold mb-6">Shipping Fees by State</div>
      <div className="bg-white border border-neutral-200 max-w-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 font-mono text-[11px] uppercase tracking-wide border-b border-neutral-200">
              <th className="px-4 py-3">State</th><th className="px-4 py-3">Fee (₦)</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.state} className="border-b border-neutral-100 last:border-b-0">
                <td className="px-4 py-2">{r.state}</td>
                <td className="px-4 py-2"><input type="number" value={r.fee} onChange={(e) => update(r.state, Number(e.target.value))} className={`${inputClass} w-28`} /></td>
                <td className="px-4 py-2 text-right">
                  {r.state !== "Other" && <button onClick={() => remove(r.state)} aria-label="Remove" className="p-1 hover:bg-neutral-100 cursor-pointer"><Trash2 className="w-4 h-4" /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={add} className="flex gap-2 p-4 border-t border-neutral-200">
          <input value={newState} onChange={(e) => setNewState(e.target.value)} placeholder="New state" className={inputClass} />
          <input value={newFee} onChange={(e) => setNewFee(e.target.value)} type="number" placeholder="Fee" className={`${inputClass} w-28`} />
          <PrimaryButton type="submit"><Plus className="w-4 h-4" /></PrimaryButton>
        </form>
      </div>
      <div className="text-xs text-neutral-400 mt-3 max-w-xl">&quot;Other&quot; is the fallback fee used for any state not listed here.</div>
    </div>
  );
}
