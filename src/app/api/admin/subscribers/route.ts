import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.query.newsletterSubscribers.findMany({ orderBy: [desc(newsletterSubscribers.subscribedAt)] });
  return NextResponse.json(rows);
}
