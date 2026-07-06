import { db } from "@/lib/db";
import { collections } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { CollectionsClient } from "@/components/admin/CollectionsClient";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const allCollections = await db.query.collections.findMany({
    orderBy: [asc(collections.sortOrder)],
  });
  return <CollectionsClient initialCollections={allCollections as any} />;
}
