import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "@/components/admin/SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, 1) });
  return <SettingsClient settings={settings!} />;
}
