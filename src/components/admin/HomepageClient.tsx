"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { PrimaryButton, SectionLabel, Field, inputClass } from "./ui";
import { ImageUpload } from "./ImageUpload";
type Settings = { heroEyebrow:string|null; heroHeadline:string|null; heroImageUrl:string|null; heroCtaPrimary:string|null; heroCtaSecondary:string|null; promoEyebrow:string|null; promoHeadline:string|null; promoSubtext:string|null; promoImageUrl:string|null };
type PF = { id:number; name:string; isNewArrival:boolean; isBestSeller:boolean };
export function HomepageClient({ settings, products:initP }:{ settings:Settings; products:PF[] }) {
  const [hero, setHero] = useState({ eyebrow:settings.heroEyebrow||"", headline:settings.heroHeadline||"", imageUrl:settings.heroImageUrl||"", imagePublicId:"", ctaPrimary:settings.heroCtaPrimary||"", ctaSecondary:settings.heroCtaSecondary||"" });
  const [promo, setPromo] = useState({ eyebrow:settings.promoEyebrow||"", headline:settings.promoHeadline||"", subtext:settings.promoSubtext||"", imageUrl:settings.promoImageUrl||"", imagePublicId:"" });
  const [products, setProducts] = useState(initP);
  const [saved, setSaved] = useState(false); const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    await fetch("/api/admin/settings",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ heroEyebrow:hero.eyebrow, heroHeadline:hero.headline, heroImageUrl:hero.imageUrl, heroCtaPrimary:hero.ctaPrimary, heroCtaSecondary:hero.ctaSecondary, promoEyebrow:promo.eyebrow, promoHeadline:promo.headline, promoSubtext:promo.subtext, promoImageUrl:promo.imageUrl }) });
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),1800);
  }
  async function toggleFlag(id:number, flag:"isNewArrival"|"isBestSeller") {
    const p = products.find(x=>x.id===id); if (!p) return;
    const value = !p[flag];
    setProducts(prev=>prev.map(x=>x.id===id?{...x,[flag]:value}:x));
    await fetch(`/api/admin/products/${id}`,{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ [flag]:value }) });
  }
  return (
    <div>
      <div className="font-heading text-2xl font-bold mb-6">Homepage</div>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-neutral-200 p-5">
          <SectionLabel>Hero Banner</SectionLabel>
          <Field label="Background image"><ImageUpload value={hero.imageUrl} publicId={hero.imagePublicId} onChange={(url,pid)=>setHero({...hero,imageUrl:url,imagePublicId:pid})} aspectClass="aspect-[16/9]"/></Field>
          <Field label="Eyebrow text"><input value={hero.eyebrow} onChange={e=>setHero({...hero,eyebrow:e.target.value})} className={inputClass} placeholder="New Horizons — Drop 003"/></Field>
          <Field label="Headline"><input value={hero.headline} onChange={e=>setHero({...hero,headline:e.target.value})} className={inputClass}/></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary CTA"><input value={hero.ctaPrimary} onChange={e=>setHero({...hero,ctaPrimary:e.target.value})} className={inputClass}/></Field>
            <Field label="Secondary CTA"><input value={hero.ctaSecondary} onChange={e=>setHero({...hero,ctaSecondary:e.target.value})} className={inputClass}/></Field>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 p-5">
          <SectionLabel>Promotional Banner</SectionLabel>
          <Field label="Background image"><ImageUpload value={promo.imageUrl} publicId={promo.imagePublicId} onChange={(url,pid)=>setPromo({...promo,imageUrl:url,imagePublicId:pid})} aspectClass="aspect-[16/9]"/></Field>
          <Field label="Eyebrow text"><input value={promo.eyebrow} onChange={e=>setPromo({...promo,eyebrow:e.target.value})} className={inputClass}/></Field>
          <Field label="Headline"><input value={promo.headline} onChange={e=>setPromo({...promo,headline:e.target.value})} className={inputClass}/></Field>
          <Field label="Subtext"><input value={promo.subtext} onChange={e=>setPromo({...promo,subtext:e.target.value})} className={inputClass}/></Field>
        </div>
      </div>
      <div className="bg-white border border-neutral-200 p-5">
        <SectionLabel>Featured Products</SectionLabel>
        <div className="text-xs text-neutral-400 mb-3">Controls New Arrivals and Best Sellers rows on the storefront homepage.</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[360px]">
            <thead><tr className="text-left text-neutral-500 font-mono text-[11px] uppercase tracking-wide border-b border-neutral-200"><th className="py-2">Product</th><th className="py-2">New Arrival</th><th className="py-2">Best Seller</th></tr></thead>
            <tbody>{products.map(p=><tr key={p.id} className="border-b border-neutral-100 last:border-b-0"><td className="py-2 pr-4">{p.name}</td><td className="py-2"><input type="checkbox" checked={p.isNewArrival} onChange={()=>toggleFlag(p.id,"isNewArrival")} className="cursor-pointer"/></td><td className="py-2"><input type="checkbox" checked={p.isBestSeller} onChange={()=>toggleFlag(p.id,"isBestSeller")} className="cursor-pointer"/></td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <PrimaryButton onClick={save} disabled={saving}>{saving?"Saving…":"Save Homepage Settings"}</PrimaryButton>
        {saved&&<span className="flex items-center gap-1 text-sm text-green-700"><Check className="w-4 h-4"/> Saved</span>}
      </div>
    </div>
  );
}
