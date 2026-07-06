import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.query.categories.findMany({
    orderBy: (c, { asc }) => [asc(c.sortOrder)],
  });
  return NextResponse.json(rows);
}
