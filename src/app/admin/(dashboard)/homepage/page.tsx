import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { HomepageClient } from "@/components/admin/HomepageClient";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const settings = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, 1) });
  const products = await db.query.products.findMany({ columns: { id: true, name: true, isNewArrival: true, isBestSeller: true } });
  return <HomepageClient settings={settings!} products={products} />;
}
