import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.query.orders.findMany({
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
  });
  return NextResponse.json(rows);
}
