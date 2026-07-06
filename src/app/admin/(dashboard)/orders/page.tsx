import { db } from "@/lib/db";
import { orders, shippingRates } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { OrdersClient } from "@/components/admin/OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const allOrders = await db.query.orders.findMany({ with: { items: true }, orderBy: [desc(orders.createdAt)] });
  const rates = await db.query.shippingRates.findMany();
  const rateMap = Object.fromEntries(rates.map((r) => [r.state, Number(r.fee)]));
  return <OrdersClient initialOrders={allOrders as any} shippingRates={rateMap} />;
}
