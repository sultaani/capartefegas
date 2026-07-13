import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { CatalogueClient } from "@/components/storefront/CatalogueClient";
export const dynamic = "force-dynamic";
export default async function CataloguePage({ searchParams }:{ searchParams:Promise<{category?:string;search?:string}> }) {
  const params = await searchParams;
  const [allProducts, allCats] = await Promise.all([
    db.query.products.findMany({ where:eq(products.isActive,true), with:{ variants:true, category:true, collection:true } }),
    db.query.categories.findMany({ orderBy:[asc(categories.sortOrder)] }),
  ]);
  return <CatalogueClient products={allProducts as any} categories={allCats} initialCategory={params.category||"all"} initialSearch={params.search||""}/>;
}
