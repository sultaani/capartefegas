import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { NewsletterClient } from "@/components/admin/NewsletterClient";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await db.query.newsletterSubscribers.findMany({ orderBy: [desc(newsletterSubscribers.subscribedAt)] });
  return <NewsletterClient initialSubscribers={subscribers as any} />;
}
