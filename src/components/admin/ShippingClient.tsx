"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PrimaryButton, inputClass } from "./ui";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
type Rate = { state:string; fee:number };
export function ShippingClient({ initialRates }:{ initialRates:Rate[] }) {
  const [rates, setRates] = useState(initialRates);
  const [newState, setNewState] = useState(""); const [newFee, setNewFee] = useState("");

  async function update(state:string, fee:number) {
    setRates(p=>p.map(r=>r.state===state?{...r,fee}:r));
    await fetch("/api/admin/shipping-rates",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ state, fee }) });
  }
  async function remove(state:string) {
    await fetch("/api/admin/shipping-rates",{ method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ state }) });
    setRates(p=>p.filter(r=>r.state!==state));
  }
  async function addMissing(state:string) {
    const fallback = rates.find(r=>r.state==="Other")?.fee??5000;
    await fetch("/api/admin/shipping-rates",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ state, fee:fallback }) });
    setRates(p=>[...p,{ state, fee:fallback }].sort((a,b)=>a.state==="Other"?1:b.state==="Other"?-1:a.state.localeCompare(b.state)));
  }
  async function addCustom(e:React.FormEvent) {
    e.preventDefault(); if (!newState.trim()) return;
    const fee = Number(newFee)||0;
    await fetch("/api/admin/shipping-rates",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ state:newState.trim(), fee }) });
    setRates(p=>[...p,{ state:newState.trim(), fee }].sort((a,b)=>a.state==="Other"?1:b.state==="Other"?-1:a.state.localeCompare(b.state)));
    setNewState(""); setNewFee("");
  }
  const rateMap = Object.fromEntries(rates.map(r=>[r.state,r.fee]));
  const missing = NIGERIAN_STATES.filter(s=>!rateMap[s]);
  const sorted = [...rates].sort((a,b)=>a.state==="Other"?1:b.state==="Other"?-1:a.state.localeCompare(b.state));
  return (
    <div>
      <div className="font-heading text-2xl font-bold mb-2">Shipping Fees by State</div>
      <p className="text-sm text-neutral-500 mb-6">All 36 states + FCT are listed. <span className="font-medium">Other</span> is the fallback rate — keep it as the highest.</p>
      <div className="bg-white border border-neutral-200 overflow-x-auto max-w-xl">
        <table className="w-full text-sm min-w-[380px]">
          <thead><tr className="text-left text-neutral-500 font-mono text-[11px] uppercase tracking-wide border-b border-neutral-200"><th className="px-4 py-3">State</th><th className="px-4 py-3">Fee (₦)</th><th className="px-4 py-3 w-10"></th></tr></thead>
          <tbody>
            {sorted.map(r=>(
              <tr key={r.state} className="border-b border-neutral-100 last:border-b-0">
                <td className="px-4 py-2">{r.state}{r.state==="Other"&&<span className="ml-2 text-[10px] text-neutral-400 uppercase">fallback</span>}</td>
                <td className="px-4 py-2"><input type="number" value={r.fee} onChange={e=>setRates(p=>p.map(x=>x.state===r.state?{...x,fee:Number(e.target.value)}:x))} onBlur={e=>update(r.state,Number(e.target.value))} className={`${inputClass} w-28`}/></td>
                <td className="px-4 py-2">{r.state!=="Other"&&<button onClick={()=>remove(r.state)} aria-label="Remove" className="p-1 hover:bg-neutral-100 cursor-pointer text-neutral-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {missing.length>0&&<div className="mt-5 max-w-xl"><div className="text-sm font-medium mb-2 text-neutral-700">Missing states ({missing.length}) — click to add at fallback rate:</div><div className="flex flex-wrap gap-2">{missing.map(s=><button key={s} onClick={()=>addMissing(s)} className="px-3 py-1.5 text-xs border border-dashed border-neutral-300 hover:border-neutral-900 cursor-pointer flex items-center gap-1"><Plus className="w-3 h-3"/>{s}</button>)}</div></div>}
      <form onSubmit={addCustom} className="flex gap-2 mt-6 items-end max-w-xl">
        <div><label className="block text-xs text-neutral-500 mb-1">Custom state</label><input value={newState} onChange={e=>setNewState(e.target.value)} placeholder="e.g. Diaspora" className={`${inputClass} w-44`}/></div>
        <div><label className="block text-xs text-neutral-500 mb-1">Fee (₦)</label><input value={newFee} onChange={e=>setNewFee(e.target.value)} type="number" placeholder="0" className={`${inputClass} w-28`}/></div>
        <PrimaryButton type="submit"><Plus className="w-4 h-4"/> Add</PrimaryButton>
      </form>
    </div>
  );
}
