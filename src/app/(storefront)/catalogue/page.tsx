import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CatalogueClient } from "@/components/storefront/CatalogueClient";

export const dynamic = "force-dynamic";

export default async function CataloguePage({ searchParams }: { searchParams: Promise<{ category?: string; search?: string }> }) {
  const params = await searchParams;
  const allProducts = await db.query.products.findMany({
    where: eq(products.isActive, true),
    with: { variants: true, category: true, collection: true },
  });
  const allCategories = await db.query.categories.findMany({ orderBy: (c, { asc }) => [asc(c.sortOrder)] });

  return (
    <CatalogueClient
      products={allProducts as any}
      categories={allCategories}
      initialCategory={params.category || "All"}
      initialSearch={params.search || ""}
    />
  );
}
