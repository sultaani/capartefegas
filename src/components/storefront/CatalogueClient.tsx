"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { SectionLabel } from "./SectionLabel";
import type { Product } from "@/lib/types";
type Cat = { id:number; slug:string; name:string; isActive:boolean };
export function CatalogueClient({ products, categories, initialCategory, initialSearch }:{ products:Product[]; categories:Cat[]; initialCategory:string; initialSearch:string }) {
  const [category, setCategory] = useState(initialCategory||"all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState(initialSearch||"");
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ tabsRef.current?.querySelector("[data-active='true']")?.scrollIntoView({ behavior:"smooth", block:"nearest", inline:"center" }); },[category]);
  const activeCats = categories.filter(c=>c.isActive);
  const filtered = useMemo(()=>{
    let list = products.filter(p=>(category==="all"||p.category?.slug===category)&&p.name.toLowerCase().includes(query.toLowerCase()));
    if (sort==="priceLow") list=[...list].sort((a,b)=>Number(a.price)-Number(b.price));
    if (sort==="priceHigh") list=[...list].sort((a,b)=>Number(b.price)-Number(a.price));
    if (sort==="az") list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  },[products,category,sort,query]);
  const recommended = products.filter(p=>p.isBestSeller).slice(0,6);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-5">Catalogue</h1>
      {/* Category tabs */}
      {activeCats.length>0&&<div ref={tabsRef} className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth:"none" }}>
        <button data-active={category==="all"} onClick={()=>setCategory("all")} className={`shrink-0 px-4 py-2 text-sm border transition-colors cursor-pointer whitespace-nowrap ${category==="all"?"border-neutral-900 bg-neutral-900 text-white":"border-neutral-300 text-neutral-700 hover:border-neutral-900"}`}>All</button>
        {activeCats.map(cat=><button key={cat.slug} data-active={category===cat.slug} onClick={()=>setCategory(cat.slug)} className={`shrink-0 px-4 py-2 text-sm border transition-colors cursor-pointer whitespace-nowrap ${category===cat.slug?"border-neutral-900 bg-neutral-900 text-white":"border-neutral-300 text-neutral-700 hover:border-neutral-900"}`}>{cat.name}</button>)}
      </div>}
      {/* Search + sort */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products…" className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"/>
          {query&&<button onClick={()=>setQuery("")} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"><X className="w-4 h-4 text-neutral-400"/></button>}
        </div>
        <select value={sort} onChange={e=>setSort(e.target.value)} className="shrink-0 border border-neutral-300 px-3 py-2.5 text-sm cursor-pointer bg-white">
          <option value="newest">Newest</option><option value="priceLow">Price ↑</option><option value="priceHigh">Price ↓</option><option value="az">A → Z</option>
        </select>
        <div className="hidden sm:flex items-center text-xs text-neutral-400 whitespace-nowrap shrink-0">{filtered.length} item{filtered.length!==1?"s":""}</div>
      </div>
      {/* Grid */}
      {filtered.length===0 ? (
        <div className="py-12">
          <div className="text-center text-neutral-500 mb-8">No products found{query?` for "${query}"`:""}.</div>
          {recommended.length>0&&<><SectionLabel>You might like</SectionLabel><div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-5">{recommended.map(p=><ProductCard key={p.id} product={p}/>)}</div></>}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
          {filtered.map(p=><ProductCard key={p.id} product={p}/>)}
        </div>
      )}
    </div>
  );
}
