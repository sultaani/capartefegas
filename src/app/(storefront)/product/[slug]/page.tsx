import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SectionLabel } from "@/components/storefront/SectionLabel";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { variants: true, category: true, collection: true },
  });

  if (!product || !product.isActive) notFound();

  const related = product.categoryId
    ? await db.query.products.findMany({
        where: and(eq(products.categoryId, product.categoryId), ne(products.id, product.id), eq(products.isActive, true)),
        with: { variants: true, category: true, collection: true },
        limit: 4,
      })
    : [];

  return (
    <div>
      <ProductDetailClient product={product as any} />
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-5 pb-16">
          <div className="border-t border-neutral-200 pt-10">
            <SectionLabel>You May Also Like</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p as any} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
