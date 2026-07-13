import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyWebhookSignature } from "@/lib/opay";
import { rateLimit, getClientIP, LIMITS } from "@/lib/rate-limit";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const ip = getClientIP(request.headers);
  const rl = rateLimit(`webhook:${ip}`, LIMITS.webhook.limit, LIMITS.webhook.windowMs);
  if (!rl.allowed) return NextResponse.json({ code:"02001", message:"Rate limited" },{ status:429 });
  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, request.headers.get("authorization") ?? "")) {
    return NextResponse.json({ code:"02001", message:"Unauthorized" },{ status:401 });
  }
  let data: any;
  try { data = JSON.parse(rawBody); } catch { return NextResponse.json({ code:"02000", message:"Bad body" },{ status:400 }); }
  const reference: string = data.payload?.reference ?? data.reference ?? "";
  const status = (data.payload?.status ?? data.status ?? "").toUpperCase();
  if (!reference) return NextResponse.json({ code:"00000", message:"OK" });
  const order = await db.query.orders.findFirst({ where:eq(orders.orderNumber, reference) });
  if (!order) return NextResponse.json({ code:"00000", message:"OK" });
  if (status === "SUCCESS") await db.update(orders).set({ paymentStatus:"paid", status:"confirmed", updatedAt:new Date() }).where(eq(orders.id,order.id));
  else if (status==="FAIL"||status==="CLOSE") await db.update(orders).set({ paymentStatus:"failed", status:"cancelled", updatedAt:new Date() }).where(eq(orders.id,order.id));
  return NextResponse.json({ code:"00000", message:"SUCCESS" });
}
