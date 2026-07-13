"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { PrimaryButton, GhostButton, SectionLabel, Modal, Field, inputClass } from "./ui";
import { ImageUpload } from "./ImageUpload";
import type { Product } from "@/lib/types";

const fmt = (n:number) => "₦"+Math.round(n).toLocaleString("en-NG");
const SIZES = ["S","M","L","XL","XXL"];
type Cat = { id:number; slug:string; name:string };
type Col = { id:number; slug:string; name:string };

function blank() {
  return { id:null as number|null, sku:"", name:"", categoryId:null as number|null, collectionId:null as number|null,
    price:0, colorsText:"Black", description:"", material:"", careInstructions:"", deliveryEstimate:"",
    imageUrl:"", imagePublicId:"", isNewArrival:false, isBestSeller:false, allowCustomRequest:true,
    variants:SIZES.map(size=>({size,stock:0})) };
}

export function ProductsClient({ initialProducts, categories, collections }:{ initialProducts:Product[]; categories:Cat[]; collections:Col[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ReturnType<typeof blank>|null>(null);
  const [confirmDel, setConfirmDel] = useState<Product|null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const filtered = products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())||p.sku.toLowerCase().includes(query.toLowerCase()));

  function openEdit(p:Product) {
    setEditing({ id:p.id, sku:p.sku, name:p.name, categoryId:p.category?.id??null, collectionId:p.collection?.id??null,
      price:Number(p.price), colorsText:p.colors.join(", "), description:p.description||"", material:p.material||"",
      careInstructions:p.careInstructions||"", deliveryEstimate:p.deliveryEstimate||"",
      imageUrl:p.images[0]?.url||"", imagePublicId:p.images[0]?.publicId||"",
      isNewArrival:p.isNewArrival, isBestSeller:p.isBestSeller, allowCustomRequest:p.allowCustomRequest,
      variants:SIZES.map(size=>({size,stock:p.variants.find(v=>v.size===size)?.stock??0})) });
    setErr(null);
  }

  async function save() {
    if (!editing) return; setSaving(true); setErr(null);
    const payload = { sku:editing.sku, name:editing.name, categoryId:editing.categoryId, collectionId:editing.collectionId,
      price:Number(editing.price), description:editing.description, material:editing.material,
      careInstructions:editing.careInstructions, deliveryEstimate:editing.deliveryEstimate,
      colors:editing.colorsText.split(",").map(c=>c.trim()).filter(Boolean),
      images:editing.imageUrl?[{url:editing.imageUrl,publicId:editing.imagePublicId}]:[],
      isNewArrival:editing.isNewArrival, isBestSeller:editing.isBestSeller, allowCustomRequest:editing.allowCustomRequest,
      variants:editing.variants };
    const res = await fetch(editing.id?`/api/admin/products/${editing.id}`:"/api/admin/products",
      { method:editing.id?"PATCH":"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok){ setErr(data.error||"Failed to save."); setSaving(false); return; }
    const refreshed = await fetch(`/api/admin/products/${editing.id??data.id}`).then(r=>r.json());
    setProducts(p=>editing.id?p.map(x=>x.id===editing.id?refreshed:x):[refreshed,...p]);
    setEditing(null); setSaving(false);
  }

  async function archive(p:Product) {
    await fetch(`/api/admin/products/${p.id}`,{ method:"DELETE", headers:{"Content-Type":"application/json"}, body:"{}" });
    setProducts(prev=>prev.map(x=>x.id===p.id?{...x,isActive:false}:x));
    setConfirmDel(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="font-heading text-2xl font-bold">Products</div>
        <PrimaryButton onClick={()=>{ setEditing(blank()); setErr(null); }}><Plus className="w-4 h-4"/> Add Product</PrimaryButton>
      </div>
      <div className="relative max-w-sm mb-5">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"/>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name or SKU" className={`${inputClass} pl-9`}/>
      </div>
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead><tr className="border-b border-neutral-200 text-left text-neutral-500 font-mono text-[11px] uppercase tracking-wide">
            <th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Flags</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {filtered.map(p=>{
              const total = p.variants.reduce((s,v)=>s+v.stock,0);
              const low = total>0 && p.variants.some(v=>v.stock>0&&v.stock<=3);
              return (
                <tr key={p.id} className={`border-b border-neutral-100 last:border-b-0 ${!p.isActive?"opacity-40":""}`}>
                  <td className="px-4 py-3"><div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]?.url||"https://picsum.photos/seed/placeholder/60/75"} alt="" className="w-10 h-12 object-cover bg-neutral-100 shrink-0"/>
                    <div><div>{p.name}{!p.isActive&&<span className="text-[10px] text-neutral-400 ml-1">(archived)</span>}</div><div className="font-mono text-[11px] text-neutral-400">{p.sku}</div></div>
                  </div></td>
                  <td className="px-4 py-3 text-neutral-600">{p.category?.name}</td>
                  <td className="px-4 py-3">{fmt(Number(p.price))}</td>
                  <td className="px-4 py-3">{total===0?<span className="text-red-700 text-xs font-medium">Sold Out</span>:low?<span className="text-amber-800 text-xs font-medium">{total} (low)</span>:<span className="text-neutral-600 text-xs">{total}</span>}</td>
                  <td className="px-4 py-3"><div className="flex gap-1">{p.isNewArrival&&<span className="text-[10px] uppercase bg-neutral-100 px-1.5 py-0.5">New</span>}{p.isBestSeller&&<span className="text-[10px] uppercase bg-amber-50 text-amber-800 px-1.5 py-0.5">Best Seller</span>}</div></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={()=>openEdit(p)} className="p-1.5 hover:bg-neutral-100 cursor-pointer"><Pencil className="w-4 h-4"/></button>
                    {p.isActive&&<button onClick={()=>setConfirmDel(p)} className="p-1.5 hover:bg-neutral-100 cursor-pointer"><Trash2 className="w-4 h-4"/></button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id?"Edit Product":"Add Product"} onClose={()=>setEditing(null)} wide>
          <div className="grid md:grid-cols-2 gap-x-6">
            <div>
              <Field label="Product image"><ImageUpload value={editing.imageUrl} publicId={editing.imagePublicId} onChange={(url,pid)=>setEditing({...editing,imageUrl:url,imagePublicId:pid})} aspectClass="aspect-[4/5]"/></Field>
              <Field label="Product name"><input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className={inputClass}/></Field>
              <Field label="SKU"><input value={editing.sku} onChange={e=>setEditing({...editing,sku:e.target.value})} className={`${inputClass} font-mono`} placeholder="CPT/SH/000"/></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category"><select value={editing.categoryId??""} onChange={e=>setEditing({...editing,categoryId:e.target.value?Number(e.target.value):null})} className={inputClass}><option value="">—</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
                <Field label="Collection"><select value={editing.collectionId??""} onChange={e=>setEditing({...editing,collectionId:e.target.value?Number(e.target.value):null})} className={inputClass}><option value="">—</option>{collections.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              </div>
              <Field label="Price (₦)"><input type="number" value={editing.price} onChange={e=>setEditing({...editing,price:Number(e.target.value)})} className={inputClass}/></Field>
              <Field label="Colors (comma separated)"><input value={editing.colorsText} onChange={e=>setEditing({...editing,colorsText:e.target.value})} className={inputClass} placeholder="Black, Off-White"/></Field>
              <div className="flex gap-4 mt-1 mb-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={editing.isNewArrival} onChange={e=>setEditing({...editing,isNewArrival:e.target.checked})}/> New Arrival</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={editing.isBestSeller} onChange={e=>setEditing({...editing,isBestSeller:e.target.checked})}/> Best Seller</label>
              </div>
            </div>
            <div>
              <Field label="Description"><textarea value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})} className={`${inputClass} h-24`}/></Field>
              <Field label="Material"><input value={editing.material} onChange={e=>setEditing({...editing,material:e.target.value})} className={inputClass}/></Field>
              <Field label="Care instructions"><input value={editing.careInstructions} onChange={e=>setEditing({...editing,careInstructions:e.target.value})} className={inputClass}/></Field>
              <Field label="Delivery estimate"><input value={editing.deliveryEstimate} onChange={e=>setEditing({...editing,deliveryEstimate:e.target.value})} className={inputClass}/></Field>
              <SectionLabel>Stock by Size</SectionLabel>
              <div className="border border-neutral-200">
                {editing.variants.map((v,i)=>(
                  <div key={v.size} className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 border-neutral-100">
                    <span className="text-sm font-mono w-12">{v.size}</span>
                    <input type="number" min={0} value={v.stock} onChange={e=>setEditing({...editing,variants:editing.variants.map((vv,ii)=>ii===i?{...vv,stock:Math.max(0,Number(e.target.value)||0)}:vv)})} className={`${inputClass} w-24`}/>
                  </div>
                ))}
              </div>
              <div className="text-xs text-neutral-400 mt-2">0 = Sold Out. 1–3 = Low Stock badge.</div>
            </div>
            {err && <div className="md:col-span-2 text-sm text-red-700 bg-red-50 px-3 py-2 mt-3">{err}</div>}
            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-neutral-200">
              <GhostButton onClick={()=>setEditing(null)}>Cancel</GhostButton>
              <PrimaryButton onClick={save} disabled={saving}>{saving?"Saving…":"Save Product"}</PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
      {confirmDel && (
        <Modal title="Archive Product" onClose={()=>setConfirmDel(null)}>
          <p className="text-sm text-neutral-600">Archive &quot;{confirmDel.name}&quot;? It disappears from the storefront but stays linked to past orders.</p>
          <div className="flex justify-end gap-3 mt-5"><GhostButton onClick={()=>setConfirmDel(null)}>Cancel</GhostButton><PrimaryButton onClick={()=>archive(confirmDel)} className="bg-red-700 hover:bg-red-800">Archive</PrimaryButton></div>
        </Modal>
      )}
    </div>
  );
}
