import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { MessagesClient } from "@/components/admin/MessagesClient";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await db.query.contactMessages.findMany({ orderBy: [desc(contactMessages.createdAt)] });
  return <MessagesClient initialMessages={messages as any} />;
}
