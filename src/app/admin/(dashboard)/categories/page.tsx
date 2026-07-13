import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { CategoriesClient } from "@/components/admin/CategoriesClient";
export const dynamic = "force-dynamic";
export default async function AdminCategoriesPage() {
  const all = await db.query.categories.findMany({ orderBy:[asc(categories.sortOrder)] });
  return <CategoriesClient initialCategories={all} />;
}
