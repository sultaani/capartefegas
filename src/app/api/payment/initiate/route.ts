import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { orders, orderItems, products, productVariants, shippingRates, siteSettings } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getNextOrderNumber } from "@/lib/order-number";
import { initiatePayment, nairaToKobo } from "@/lib/opay";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { rateLimit, getClientIP, LIMITS } from "@/lib/rate-limit";
export const dynamic = "force-dynamic";
const itemSchema = z.object({ productId:z.number().int().positive(), color:z.string().min(1), size:z.string().min(1), quantity:z.number().int().min(1).max(20), customRequestType:z.string().optional().default("None"), customRequestNote:z.string().max(500).optional().default("") });
const schema = z.object({ firstName:z.string().min(1).max(100), lastName:z.string().min(1).max(100), phone:z.string().min(7).max(40), email:z.string().email(), address:z.string().min(3), city:z.string().min(1).max(120), state:z.string().min(1).max(60), notes:z.string().max(1000).optional().default(""), items:z.array(itemSchema).min(1), paymentMethod:z.enum(["whatsapp","opay"]) });
class OErr extends Error {}
export async function POST(request: NextRequest) {
  const ip = getClientIP(request.headers);
  const rl = rateLimit(`order:${ip}`, LIMITS.orderCreate.limit, LIMITS.orderCreate.windowMs);
  if (!rl.allowed) return NextResponse.json({ error:"Too many orders. Please wait an hour." },{ status:429, headers:{"Retry-After":String(Math.ceil(rl.retryAfterMs/1000))} });
  const parsed = schema.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return NextResponse.json({ error:"Invalid order data", details:parsed.error.flatten() },{ status:400 });
  const data = parsed.data;
  try {
    const result = await db.transaction(async (tx) => {
      let subtotal = 0;
      const itemRows: (typeof orderItems.$inferInsert)[] = [];
      for (const item of data.items) {
        const [v] = await tx.execute(sql`
          SELECT pv.id, pv.stock, p.id as product_id, p.name, p.price, p.is_active
          FROM ${productVariants} pv JOIN ${products} p ON p.id = pv.product_id
          WHERE pv.product_id = ${item.productId} AND pv.size = ${item.size} FOR UPDATE
        `) as unknown as {id:number;stock:number;product_id:number;name:string;price:string;is_active:boolean}[];
        if (!v) throw new OErr(`Size ${item.size} is no longer available.`);
        if (!v.is_active) throw new OErr(`"${v.name}" is no longer available.`);
        if (v.stock < item.quantity) throw new OErr(`Only ${v.stock} left in size ${item.size} for "${v.name}".`);
        await tx.update(productVariants).set({ stock:sql`${productVariants.stock} - ${item.quantity}` }).where(eq(productVariants.id, v.id));
        const price = Number(v.price); subtotal += price * item.quantity;
        itemRows.push({ orderId:0, productId:v.product_id, nameSnapshot:v.name, priceSnapshot:String(price), color:item.color, size:item.size, quantity:item.quantity, customRequestType:item.customRequestType, customRequestNote:item.customRequestNote });
      }
      const [rr] = await tx.select().from(shippingRates).where(eq(shippingRates.state, data.state));
      const [or] = await tx.select().from(shippingRates).where(eq(shippingRates.state, "Other"));
      const shippingFee = Number(rr?.fee ?? or?.fee ?? 0);
      const orderNumber = await getNextOrderNumber(tx, data.firstName, data.lastName);
      const [orderRow] = await tx.insert(orders).values({ orderNumber, status:data.paymentMethod==="opay"?"pending_payment":"pending", paymentMethod:data.paymentMethod, paymentStatus:"unpaid", customerFirstName:data.firstName, customerLastName:data.lastName, customerPhone:data.phone, customerEmail:data.email, deliveryAddress:data.address, deliveryCity:data.city, deliveryState:data.state, shippingFee:String(shippingFee), subtotal:String(subtotal), notes:data.notes }).returning();
      await tx.insert(orderItems).values(itemRows.map(r=>({...r,orderId:orderRow.id})));
      return { order:orderRow, items:itemRows, shippingFee };
    });
    const settings = await db.query.siteSettings.findFirst({ where:eq(siteSettings.id,1) });
    const waNum = settings?.whatsappNumber ?? process.env.WHATSAPP_NUMBER ?? "2348000000000";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const total = Number(result.order.subtotal) + result.shippingFee;
    if (data.paymentMethod === "whatsapp") {
      const msg = buildWhatsAppMessage(result.order, result.items);
      return NextResponse.json({ order:result.order, whatsappUrl:buildWhatsAppUrl(waNum,msg) },{ status:201 });
    }
    const { cashierUrl } = await initiatePayment({ reference:result.order.orderNumber, amountKobo:nairaToKobo(total), customerName:`${data.firstName} ${data.lastName}`, customerEmail:data.email, customerPhone:data.phone, returnUrl:`${appUrl}/payment/verify?reference=${encodeURIComponent(result.order.orderNumber)}`, callbackUrl:`${appUrl}/api/payment/webhook`, description:`Capartefegas Order ${result.order.orderNumber}` });
    await db.update(orders).set({ paymentReference:result.order.orderNumber }).where(eq(orders.id,result.order.id));
    return NextResponse.json({ order:result.order, cashierUrl, paymentMethod:"opay" },{ status:201 });
  } catch (err:any) {
    if (err instanceof OErr) return NextResponse.json({ error:err.message },{ status:409 });
    console.error("Order error:", err);
    return NextResponse.json({ error:"Something went wrong. Please try again." },{ status:500 });
  }
}
