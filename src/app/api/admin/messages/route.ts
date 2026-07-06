import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.query.contactMessages.findMany({ orderBy: [desc(contactMessages.createdAt)] });
  return NextResponse.json(rows);
}
