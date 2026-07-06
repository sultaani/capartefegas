import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.query.shippingRates.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.state, Number(r.fee)]));
  return NextResponse.json(map);
}
