import { db } from "@/lib/db";
import { ShippingClient } from "@/components/admin/ShippingClient";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const rates = await db.query.shippingRates.findMany();
  return <ShippingClient initialRates={rates.map((r) => ({ state: r.state, fee: Number(r.fee) }))} />;
}
