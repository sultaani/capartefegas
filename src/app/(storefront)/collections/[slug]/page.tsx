import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { collections, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SectionLabel } from "@/components/storefront/SectionLabel";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await db.query.collections.findFirst({ where: eq(collections.slug, slug) });
  if (!collection) notFound();

  const collectionProducts = await db.query.products.findMany({
    where: and(eq(products.collectionId, collection.id), eq(products.isActive, true)),
    with: { variants: true, category: true, collection: true },
  });
  const others = await db.query.collections.findMany();
  const related = others.filter((c) => c.id !== collection.id);

  return (
    <div>
      <section className="relative h-[50vh] min-h-[320px] bg-neutral-900 text-white overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={collection.coverImageUrl || ""} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="relative h-full max-w-6xl mx-auto px-5 flex flex-col justify-end pb-10">
          <span className="font-mono text-xs tracking-widest uppercase mb-2">Collection</span>
          <h1 className="font-heading text-3xl md:text-5xl font-bold">{collection.name}</h1>
          <p className="text-sm text-neutral-200 mt-2 max-w-md">{collection.description}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 py-12">
        {collectionProducts.length === 0 ? (
          <div className="text-center text-neutral-500 py-10">Collection coming soon.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {collectionProducts.map((p) => <ProductCard key={p.id} product={p as any} />)}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-5 py-12 border-t border-neutral-200">
          <SectionLabel>Related Collections</SectionLabel>
          <div className="grid md:grid-cols-2 gap-6">
            {related.map((c) => (
              <Link key={c.id} href={`/collections/${c.slug}`} className="group block">
                <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.coverImageUrl || ""} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 motion-reduce:transform-none transition-transform duration-500" />
                </div>
                <div className="font-heading font-bold mt-2">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
