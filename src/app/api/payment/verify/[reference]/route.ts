import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { queryPayment } from "@/lib/opay";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const order = await db.query.orders.findFirst({ where:eq(orders.orderNumber, decodeURIComponent(reference)), with:{ items:true } });
  if (!order) return NextResponse.json({ error:"Order not found" },{ status:404 });
  if (!(["unpaid","pending"] as string[]).includes(order.paymentStatus)) return buildResp(order);
  try {
    const r = await queryPayment(order.orderNumber);
    if (r.status === "SUCCESS") {
      await db.update(orders).set({ paymentStatus:"paid", status:"confirmed", updatedAt:new Date() }).where(eq(orders.id,order.id));
      order.paymentStatus = "paid"; order.status = "confirmed";
    } else if (r.status==="FAIL"||r.status==="CLOSE") {
      await db.update(orders).set({ paymentStatus:"failed", status:"cancelled", updatedAt:new Date() }).where(eq(orders.id,order.id));
      order.paymentStatus = "failed"; order.status = "cancelled";
    }
  } catch (e) { console.warn("OPay query failed:", e); }
  return buildResp(order);
}
async function buildResp(order: any) {
  const settings = await db.query.siteSettings.findFirst({ where:eq(siteSettings.id,1) });
  const waNum = settings?.whatsappNumber ?? process.env.WHATSAPP_NUMBER ?? "2348000000000";
  const msg = [
    `Hi Capartefegas! I've just completed payment for my order.`, ``,
    `Order: ${order.orderNumber}`,
    `Name: ${order.customerFirstName} ${order.customerLastName}`,
    `Phone: ${order.customerPhone}`,
    `Amount: ₦${Math.round(Number(order.subtotal)+Number(order.shippingFee)).toLocaleString("en-NG")}`, ``,
    `Please confirm receipt and let me know when to expect delivery. Thank you!`,
  ].join("\n");
  return NextResponse.json({ order:{ orderNumber:order.orderNumber, status:order.status, paymentStatus:order.paymentStatus }, whatsappUrl:buildWhatsAppUrl(waNum, msg) });
}
