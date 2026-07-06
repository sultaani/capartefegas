"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { SectionLabel } from "./SectionLabel";
import type { Product } from "@/lib/types";

export function CatalogueClient({
  products,
  categories,
  initialCategory,
  initialSearch,
}: {
  products: Product[];
  categories: { slug: string; name: string }[];
  initialCategory: string;
  initialSearch: string;
}) {
  const [category, setCategory] = useState(initialCategory || "All");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState(initialSearch || "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        (category === "All" || p.category?.slug === category) &&
        p.name.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "priceLow") list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "priceHigh") list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, sort, query]);

  const recommended = products.filter((p) => p.isBestSeller).slice(0, 4);
  const hasActiveFilter = category !== "All" || sort !== "newest" || query !== "";

  function clearFilters() {
    setCategory("All");
    setSort("newest");
    setQuery("");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-5">Catalogue</h1>

      {/* Search bar — always visible */}
      <div className="relative mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        )}
      </div>

      {/* Filter row — scrolls horizontally on mobile instead of wrapping */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="shrink-0 border border-neutral-300 px-3 py-2 text-sm cursor-pointer bg-white"
        >
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="shrink-0 border border-neutral-300 px-3 py-2 text-sm cursor-pointer bg-white"
        >
          <option value="newest">Newest</option>
          <option value="priceLow">Price: Low → High</option>
          <option value="priceHigh">Price: High → Low</option>
          <option value="az">A → Z</option>
        </select>

        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="shrink-0 flex items-center gap-1 text-xs text-neutral-500 border border-neutral-200 px-2.5 py-2 hover:border-neutral-900 cursor-pointer bg-white"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        <div className="ml-auto shrink-0 text-xs text-neutral-400 whitespace-nowrap">
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12">
          <div className="text-center text-neutral-500 mb-8">
            No products found for &quot;{query || category}&quot;.
          </div>
          {recommended.length > 0 && (
            <>
              <SectionLabel>You might like</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {recommended.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
