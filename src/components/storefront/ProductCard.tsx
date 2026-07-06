import Link from "next/link";
import type { Product } from "@/lib/types";

function formatNaira(n: number) {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export function ProductCard({ product }: { product: Product }) {
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const image = product.images[0]?.url || "https://picsum.photos/seed/cpt-placeholder/600/750";

  return (
    <Link href={`/product/${product.slug}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2">
      <div className="relative overflow-hidden bg-neutral-100 aspect-[4/5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" />
        {product.isNewArrival && <span className="absolute top-3 left-3 font-mono text-[10px] tracking-widest uppercase bg-white px-2 py-1">New</span>}
        {totalStock === 0 && <span className="absolute top-3 right-3 font-mono text-[10px] tracking-widest uppercase bg-neutral-900 text-white px-2 py-1">Sold Out</span>}
        {totalStock > 0 && totalStock <= 3 && <span className="absolute top-3 right-3 font-mono text-[10px] tracking-widest uppercase bg-amber-800 text-white px-2 py-1">Low Stock</span>}
      </div>
      <div className="mt-3 flex items-start justify-between">
        <div>
          <div className="font-mono text-[11px] text-neutral-400 tracking-wide">{product.sku}</div>
          <div className="text-sm text-neutral-900 mt-0.5">{product.name}</div>
        </div>
        <div className="text-sm text-neutral-900 whitespace-nowrap ml-3">{formatNaira(Number(product.price))}</div>
      </div>
    </Link>
  );
}
