"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { PrimaryButton, GhostButton, Modal, Field, inputClass } from "./ui";

type Cat = { id:number; slug:string; name:string; sortOrder:number; isActive:boolean };

export function CategoriesClient({ initialCategories }:{ initialCategories:Cat[] }) {
  const [cats, setCats] = useState(initialCategories);
  const [editing, setEditing] = useState<Partial<Cat>|null>(null);
  const [deleting, setDeleting] = useState<Cat|null>(null);
  const [error, setError] = useState<string|null>(null);

  async function toggle(cat:Cat) {
    const res = await fetch(`/api/admin/categories/${cat.id}`,{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ isActive:!cat.isActive }) });
    if (res.ok) setCats(p=>p.map(c=>c.id===cat.id?{...c,isActive:!cat.isActive}:c));
  }
  async function save() {
    if (!editing) return; setError(null);
    const isNew = !editing.id;
    const res = await fetch(isNew?"/api/admin/categories":`/api/admin/categories/${editing.id}`,{
      method:isNew?"POST":"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ name:editing.name, isActive:editing.isActive??true, sortOrder:editing.sortOrder??0 }),
    });
    const data = await res.json();
    if (!res.ok){ setError(data.error||"Failed."); return; }
    setCats(p=>isNew?[...p,data]:p.map(c=>c.id===data.id?data:c));
    setEditing(null);
  }
  async function remove(cat:Cat) {
    await fetch(`/api/admin/categories/${cat.id}`,{ method:"DELETE", headers:{"Content-Type":"application/json"}, body:"{}" });
    setCats(p=>p.filter(c=>c.id!==cat.id)); setDeleting(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-heading text-2xl font-bold">Categories</div>
        <PrimaryButton onClick={()=>{ setEditing({ name:"", isActive:true, sortOrder:cats.length }); setError(null); }}>
          <Plus className="w-4 h-4"/> Add Category
        </PrimaryButton>
      </div>
      <p className="text-sm text-neutral-500 mb-6">Control which categories appear as tabs in the storefront catalogue.</p>
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500 font-mono text-[11px] uppercase tracking-wide">
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {cats.map(cat=>(
              <tr key={cat.id} className="border-b border-neutral-100 last:border-b-0">
                <td className="px-4 py-3 text-neutral-300"><GripVertical className="w-4 h-4"/></td>
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-400">{cat.slug}</td>
                <td className="px-4 py-3">
                  <button onClick={()=>toggle(cat)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border cursor-pointer transition-colors ${cat.isActive?"border-green-200 bg-green-50 text-green-700":"border-neutral-200 bg-neutral-50 text-neutral-500"}`}>
                    {cat.isActive?<><Eye className="w-3 h-3"/>Visible</>:<><EyeOff className="w-3 h-3"/>Hidden</>}
                  </button>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={()=>{ setEditing({...cat}); setError(null); }} className="p-1.5 hover:bg-neutral-100 cursor-pointer"><Pencil className="w-4 h-4"/></button>
                  <button onClick={()=>setDeleting(cat)} className="p-1.5 hover:bg-neutral-100 cursor-pointer"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
            {cats.length===0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-400">No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-400 mt-3">Hiding a category removes it from the catalogue tabs but doesn&apos;t affect the products inside it.</p>

      {editing && (
        <Modal title={editing.id?"Edit Category":"Add Category"} onClose={()=>setEditing(null)}>
          <Field label="Name"><input autoFocus value={editing.name||""} onChange={e=>setEditing({...editing,name:e.target.value})} className={inputClass} placeholder="e.g. Tracksuits"/></Field>
          <Field label="Sort order"><input type="number" value={editing.sortOrder??0} onChange={e=>setEditing({...editing,sortOrder:Number(e.target.value)})} className={inputClass}/></Field>
          <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
            <input type="checkbox" checked={editing.isActive??true} onChange={e=>setEditing({...editing,isActive:e.target.checked})}/>Visible in catalogue
          </label>
          {error && <div className="text-sm text-red-700 bg-red-50 px-3 py-2 mb-3">{error}</div>}
          <div className="flex justify-end gap-3"><GhostButton onClick={()=>setEditing(null)}>Cancel</GhostButton><PrimaryButton onClick={save}>Save</PrimaryButton></div>
        </Modal>
      )}
      {deleting && (
        <Modal title="Delete Category" onClose={()=>setDeleting(null)}>
          <p className="text-sm text-neutral-600">Delete &quot;{deleting.name}&quot;? Products in it will have their category cleared but won&apos;t be deleted.</p>
          <div className="flex justify-end gap-3 mt-5"><GhostButton onClick={()=>setDeleting(null)}>Cancel</GhostButton><PrimaryButton onClick={()=>remove(deleting)} className="bg-red-700 hover:bg-red-800">Delete</PrimaryButton></div>
        </Modal>
      )}
    </div>
  );
}
