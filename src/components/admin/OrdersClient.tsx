"use client";
import { useState } from "react";
import { Search, CreditCard, MessageCircle } from "lucide-react";
import { Modal, SectionLabel, StatusBadge, inputClass } from "./ui";
const fmt = (n:number) => "₦"+Math.round(n).toLocaleString("en-NG");
const ORDER_STATUSES = ["pending","pending_payment","confirmed","processing","shipped","delivered","cancelled"];
const PAY_BADGE:Record<string,string> = { unpaid:"bg-neutral-100 text-neutral-600", pending:"bg-amber-50 text-amber-800", paid:"bg-green-50 text-green-700", failed:"bg-red-50 text-red-700" };
type Item = { id:number;nameSnapshot:string;priceSnapshot:string;color:string;size:string;quantity:number;customRequestType:string|null;customRequestNote:string|null };
type Order = { id:number;orderNumber:string;status:string;paymentMethod:string;paymentStatus:string;paymentReference:string|null;customerFirstName:string;customerLastName:string;customerPhone:string;deliveryState:string;deliveryCity:string;subtotal:string;notes:string|null;createdAt:string;items:Item[] };
export function OrdersClient({ initialOrders, shippingRates }:{ initialOrders:Order[]; shippingRates:Record<string,number> }) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState("All");
  const [payFilter, setPayFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number|null>(null);
  const filtered = orders.filter(o=>(statusFilter==="All"||o.status===statusFilter)&&(payFilter==="All"||o.paymentMethod===payFilter)&&(`${o.customerFirstName} ${o.customerLastName}`.toLowerCase().includes(query.toLowerCase())||o.orderNumber.toLowerCase().includes(query.toLowerCase())));
  const selected = orders.find(o=>o.id===selectedId);
  const fee = (state:string) => shippingRates[state]??shippingRates["Other"]??0;
  async function updateStatus(id:number, status:string) {
    const res = await fetch(`/api/admin/orders/${id}`,{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ status }) });
    if (res.ok) setOrders(p=>p.map(o=>o.id===id?{...o,status}:o));
  }
  return (
    <div>
      <div className="font-heading text-2xl font-bold mb-6">Orders</div>
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search customer or order number" className={`${inputClass} pl-9`}/></div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className={`${inputClass} w-auto`}><option value="All">All statuses</option>{ORDER_STATUSES.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}</select>
        <select value={payFilter} onChange={e=>setPayFilter(e.target.value)} className={`${inputClass} w-auto`}><option value="All">All methods</option><option value="opay">OPay</option><option value="whatsapp">WhatsApp</option></select>
      </div>
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead><tr className="border-b border-neutral-200 text-left text-neutral-500 font-mono text-[11px] uppercase tracking-wide"><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody>
            {filtered.map(o=>(
              <tr key={o.id} onClick={()=>setSelectedId(o.id)} className="border-b border-neutral-100 last:border-b-0 cursor-pointer hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                <td className="px-4 py-3">{o.customerFirstName} {o.customerLastName}</td>
                <td className="px-4 py-3 text-neutral-500 text-xs">{new Date(o.createdAt).toLocaleDateString("en-NG")}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-1.5">{o.paymentMethod==="opay"?<CreditCard className="w-3.5 h-3.5 text-neutral-400"/>:<MessageCircle className="w-3.5 h-3.5 text-neutral-400"/>}<span className={`px-1.5 py-0.5 text-[10px] uppercase tracking-wide font-medium ${PAY_BADGE[o.paymentStatus]}`}>{o.paymentStatus}</span></div></td>
                <td className="px-4 py-3">{fmt(Number(o.subtotal)+fee(o.deliveryState))}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status}/></td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-400">No orders match this filter.</td></tr>}
          </tbody>
        </table>
      </div>
      {selected&&<Modal title={selected.orderNumber} onClose={()=>setSelectedId(null)} wide>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <SectionLabel>Customer</SectionLabel>
            <div className="text-sm mb-0.5">{selected.customerFirstName} {selected.customerLastName}</div>
            <div className="text-sm text-neutral-500 mb-4">{selected.customerPhone}</div>
            <SectionLabel>Delivery</SectionLabel>
            <div className="text-sm text-neutral-600 mb-4">{selected.deliveryCity}, {selected.deliveryState} • {new Date(selected.createdAt).toLocaleDateString("en-NG")}</div>
            <SectionLabel>Payment</SectionLabel>
            <div className="flex items-center gap-2 mb-2">{selected.paymentMethod==="opay"?<><CreditCard className="w-4 h-4"/><span className="text-sm">OPay</span></>:<><MessageCircle className="w-4 h-4"/><span className="text-sm">WhatsApp Order</span></>}<span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium ${PAY_BADGE[selected.paymentStatus]}`}>{selected.paymentStatus}</span></div>
            {selected.paymentReference&&<div className="font-mono text-xs text-neutral-400 mb-4">Ref: {selected.paymentReference}</div>}
            <SectionLabel>Order Status</SectionLabel>
            <select value={selected.status} onChange={e=>updateStatus(selected.id,e.target.value)} className={inputClass}>{ORDER_STATUSES.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}</select>
            <div className="text-xs text-neutral-400 mt-2">Revenue is only counted once status reaches <span className="font-medium">Delivered</span>.</div>
            {selected.notes&&<div className="mt-4"><SectionLabel>Customer Note</SectionLabel><div className="text-sm text-amber-800 bg-amber-50 p-3">{selected.notes}</div></div>}
          </div>
          <div>
            <SectionLabel>Items</SectionLabel>
            <div className="flex flex-col gap-3 mb-4">{selected.items.map(it=><div key={it.id} className="text-sm border-b border-neutral-100 pb-2"><div className="flex justify-between"><span>{it.nameSnapshot} <span className="text-neutral-400">({it.color}/{it.size}) ×{it.quantity}</span></span><span>{fmt(Number(it.priceSnapshot)*it.quantity)}</span></div>{it.customRequestType&&it.customRequestType!=="None"&&<div className="text-xs text-amber-800 mt-1">{it.customRequestType}{it.customRequestNote?` — ${it.customRequestNote}`:""}</div>}</div>)}</div>
            <div className="flex flex-col gap-1 text-sm border-t border-neutral-200 pt-3">
              <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>{fmt(Number(selected.subtotal))}</span></div>
              <div className="flex justify-between text-neutral-500"><span>Shipping ({selected.deliveryState})</span><span>{fmt(fee(selected.deliveryState))}</span></div>
              <div className="flex justify-between font-bold border-t border-neutral-200 pt-1 mt-1"><span>Total</span><span>{fmt(Number(selected.subtotal)+fee(selected.deliveryState))}</span></div>
            </div>
          </div>
        </div>
      </Modal>}
    </div>
  );
}
