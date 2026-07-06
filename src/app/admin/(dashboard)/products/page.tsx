import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { ProductsClient } from "@/components/admin/ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const allProducts = await db.query.products.findMany({
    with: { variants: true, category: true, collection: true },
    orderBy: [desc(products.createdAt)],
  });
  const allCategories = await db.query.categories.findMany();
  const allCollections = await db.query.collections.findMany();

  return <ProductsClient initialProducts={allProducts as any} categories={allCategories} collections={allCollections} />;
}
