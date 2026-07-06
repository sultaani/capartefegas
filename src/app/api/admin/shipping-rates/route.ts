import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { shippingRates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.query.shippingRates.findMany();
  return NextResponse.json(rows);
}

const upsertSchema = z.object({ state: z.string().min(1).max(60), fee: z.number().nonnegative() });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid shipping rate" }, { status: 400 });

  const [row] = await db.insert(shippingRates)
    .values({ state: parsed.data.state, fee: String(parsed.data.fee) })
    .onConflictDoUpdate({ target: shippingRates.state, set: { fee: String(parsed.data.fee) } })
    .returning();
  return NextResponse.json(row);
}

const deleteSchema = z.object({ state: z.string().min(1) });

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (parsed.data.state === "Other") return NextResponse.json({ error: "The fallback 'Other' rate can't be deleted." }, { status: 400 });

  await db.delete(shippingRates).where(eq(shippingRates.state, parsed.data.state));
  return NextResponse.json({ ok: true });
}
