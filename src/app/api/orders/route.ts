import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { orders, orderItems, products, productVariants, shippingRates, siteSettings } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getNextOrderNumber } from "@/lib/order-number";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  color: z.string().min(1),
  size: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  customRequestType: z.string().optional().default("None"),
  customRequestNote: z.string().max(500).optional().default(""),
});

const createOrderSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(7).max(40),
  email: z.string().email(),
  address: z.string().min(3),
  city: z.string().min(1).max(120),
  state: z.string().min(1).max(60),
  notes: z.string().max(1000).optional().default(""),
  items: z.array(orderItemSchema).min(1, "Your bag is empty."),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order data", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const result = await db.transaction(async (tx) => {
      let subtotal = 0;
      const itemRows: (typeof orderItems.$inferInsert)[] = [];

      for (const item of data.items) {
        // Lock the variant row for the duration of the transaction so two
        // concurrent checkouts for the last unit of a size can't both
        // succeed — the second one waits, re-reads, and fails cleanly
        // with "Insufficient stock" instead of overselling.
        const [variantRow] = await tx.execute(sql`
          SELECT pv.id, pv.stock, p.id as product_id, p.name, p.price, p.is_active
          FROM ${productVariants} pv
          JOIN ${products} p ON p.id = pv.product_id
          WHERE pv.product_id = ${item.productId} AND pv.size = ${item.size}
          FOR UPDATE
        `) as unknown as { id: number; stock: number; product_id: number; name: string; price: string; is_active: boolean }[];

        if (!variantRow) {
          throw new OrderError(`"${item.size}" is no longer available for one of the items in your bag.`);
        }
        if (!variantRow.is_active) {
          throw new OrderError(`"${variantRow.name}" is no longer available.`);
        }
        if (variantRow.stock < item.quantity) {
          throw new OrderError(`Only ${variantRow.stock} left in size ${item.size} for "${variantRow.name}". Please adjust the quantity.`);
        }

        await tx.update(productVariants)
          .set({ stock: sql`${productVariants.stock} - ${item.quantity}` })
          .where(eq(productVariants.id, variantRow.id));

        const price = Number(variantRow.price);
        subtotal += price * item.quantity;

        itemRows.push({
          orderId: 0, // patched below once the order row exists
          productId: variantRow.product_id,
          nameSnapshot: variantRow.name,
          priceSnapshot: String(price),
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          customRequestType: item.customRequestType,
          customRequestNote: item.customRequestNote,
        });
      }

      const [rateRow] = await tx.select().from(shippingRates).where(eq(shippingRates.state, data.state));
      const [otherRow] = await tx.select().from(shippingRates).where(eq(shippingRates.state, "Other"));
      const shippingFee = Number(rateRow?.fee ?? otherRow?.fee ?? 0);

      const orderNumber = await getNextOrderNumber(tx, data.firstName, data.lastName);

      const [orderRow] = await tx.insert(orders).values({
        orderNumber,
        customerFirstName: data.firstName,
        customerLastName: data.lastName,
        customerPhone: data.phone,
        customerEmail: data.email,
        deliveryAddress: data.address,
        deliveryCity: data.city,
        deliveryState: data.state,
        shippingFee: String(shippingFee),
        subtotal: String(subtotal),
        notes: data.notes,
      }).returning();

      await tx.insert(orderItems).values(itemRows.map((row) => ({ ...row, orderId: orderRow.id })));

      return { order: orderRow, items: itemRows };
    });

    const settings = await db.query.siteSettings.findFirst({ where: eq(siteSettings.id, 1) });
    const whatsappNumber = settings?.whatsappNumber ?? "2348000000000";
    const message = buildWhatsAppMessage(result.order, result.items);
    const whatsappUrl = buildWhatsAppUrl(whatsappNumber, message);

    return NextResponse.json({ order: result.order, whatsappUrl }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Something went wrong creating your order. Please try again." }, { status: 500 });
  }
}

class OrderError extends Error {}
