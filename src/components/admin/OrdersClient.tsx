"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Modal, SectionLabel, StatusBadge, inputClass } from "./ui";

function formatNaira(n: number) {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

type OrderItem = { id: number; nameSnapshot: string; priceSnapshot: string; color: string; size: string; quantity: number; customRequestType: string | null; customRequestNote: string | null };
type Order = {
  id: number; orderNumber: string; status: string; customerFirstName: string; customerLastName: string;
  customerPhone: string; deliveryState: string; deliveryCity: string; subtotal: string; notes: string | null;
  createdAt: string; items: OrderItem[];
};

export function OrdersClient({ initialOrders, shippingRates }: { initialOrders: Order[]; shippingRates: Record<string, number> }) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = orders.filter((o) =>
    (statusFilter === "All" || o.status === statusFilter) &&
    (`${o.customerFirstName} ${o.customerLastName}`.toLowerCase().includes(query.toLowerCase()) || o.orderNumber.toLowerCase().includes(query.toLowerCase()))
  );

  const selected = orders.find((o) => o.id === selectedId);

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  return (
    <div>
      <div className="font-heading text-2xl font-bold mb-6">Orders</div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customer or order number" className={`${inputClass} pl-9`} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} w-auto`}>
          <option>All</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500 font-mono text-[11px] uppercase tracking-wide">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const fee = shippingRates[o.deliveryState] ?? shippingRates["Other"] ?? 0;
              return (
                <tr key={o.id} onClick={() => setSelectedId(o.id)} className="border-b border-neutral-100 last:border-b-0 cursor-pointer hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                  <td className="px-4 py-3">{o.customerFirstName} {o.customerLastName}</td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-neutral-500">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="px-4 py-3">{formatNaira(Number(o.subtotal) + fee)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-400">No orders match this filter.</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal title={selected.orderNumber} onClose={() => setSelectedId(null)} wide>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <SectionLabel>Customer</SectionLabel>
              <div className="text-sm mb-1">{selected.customerFirstName} {selected.customerLastName}</div>
              <div className="text-sm text-neutral-500 mb-4">{selected.customerPhone}</div>

              <SectionLabel>Delivery</SectionLabel>
              <div className="text-sm text-neutral-600 mb-4">{selected.deliveryCity}, {selected.deliveryState} • {new Date(selected.createdAt).toLocaleDateString()}</div>

              <SectionLabel>Status</SectionLabel>
              <select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)} className={inputClass}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
              </select>
              <div className="text-xs text-neutral-400 mt-2">Revenue is only recognized once an order reaches <span className="font-medium">Delivered</span>.</div>

              {selected.notes && (
                <div className="mt-4">
                  <SectionLabel>Customer Note</SectionLabel>
                  <div className="text-sm text-amber-800 bg-amber-50 p-3">{selected.notes}</div>
                </div>
              )}
            </div>

            <div>
              <SectionLabel>Items</SectionLabel>
              <div className="flex flex-col gap-2 mb-4">
                {selected.items.map((it) => (
                  <div key={it.id} className="text-sm border-b border-neutral-100 pb-2">
                    <div className="flex justify-between">
                      <span>{it.nameSnapshot} <span className="text-neutral-400">({it.color}/{it.size}) x{it.quantity}</span></span>
                      <span>{formatNaira(Number(it.priceSnapshot) * it.quantity)}</span>
                    </div>
                    {it.customRequestType && it.customRequestType !== "None" && (
                      <div className="text-xs text-amber-800 mt-1">{it.customRequestType}{it.customRequestNote ? ` — ${it.customRequestNote}` : ""}</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatNaira(Number(selected.subtotal))}</span></div>
                <div className="flex justify-between"><span>Shipping ({selected.deliveryState})</span><span>{formatNaira(shippingRates[selected.deliveryState] ?? shippingRates["Other"] ?? 0)}</span></div>
                <div className="flex justify-between font-bold border-t border-neutral-200 pt-1 mt-1"><span>Total</span><span>{formatNaira(Number(selected.subtotal) + (shippingRates[selected.deliveryState] ?? shippingRates["Other"] ?? 0))}</span></div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
